import type { DemoSalesOrder } from "@/application/checkout/place-demo-order";
import { DEMO_ORDER_LABEL, DEMO_PAYMENT_LABEL } from "@/application/checkout/demo-order";
import { sharedVariantSellingPrice } from "@/application/catalog/catalog-contracts";
import {
  DEFAULT_FRESHNESS_THRESHOLD_MS,
  resolvePricingProvenance,
} from "@/application/catalog/field-provenance";
import type {
  CatalogImage,
  Inventory,
  Pricing,
  Product,
  ProductVariant,
  VariantAttribute,
} from "@/domain/catalog";
import type { ZohoCategoryResolver } from "./zoho-category-mapping";

/** Owning source for the Zoho selling-price field (`rate`). */
export const ZOHO_SELLING_PRICE_SOURCE = "zoho";

/**
 * Zoho POS → storefront mapping (S6-T15 demo). A Zoho item is one sellable
 * variant; its item group is the product. `label_rate` is deliberately not
 * mapped (meaning unverified) and no tax is derived. Stock is the
 * organization-level figure; location-specific validation is deferred.
 */

type ZohoRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ZohoRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function finite(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Prefers the item-detail `actual_available_for_sale_stock`; the list
 * endpoint only returns `actual_available_stock`. Untracked, missing, or
 * fractional stock is unknown, never available.
 */
export function mapZohoInventory(item: ZohoRecord): Inventory {
  const unknown: Inventory = { stockOnHand: null, availableToSell: null, reserved: null, status: "unknown" };
  if (item.track_inventory !== true) {
    return unknown;
  }
  const available =
    finite(item.actual_available_for_sale_stock) ?? finite(item.actual_available_stock);
  if (available === null || !Number.isInteger(available)) {
    return unknown;
  }
  const onHand = finite(item.stock_on_hand);
  const reserved = finite(item.actual_committed_stock);
  return {
    stockOnHand: onHand !== null && onHand >= 0 ? onHand : null,
    availableToSell: Math.max(0, available),
    reserved: reserved !== null && reserved >= 0 ? reserved : null,
    status: available > 0 ? "in_stock" : "out_of_stock",
  };
}

/**
 * Verified selling price from Zoho `rate` only. A missing, non-positive, or
 * contract-invalid rate stays hidden, as does an observation older than the
 * 24-hour freshness threshold. `label_rate` is never read.
 */
export function verifiedZohoSellingPrice(
  rate: unknown,
  currency: string,
  observedAt: string,
  evaluatedAt: string,
): Pricing | null {
  const amount = finite(rate);
  const value: Pricing | null =
    amount !== null && amount > 0
      ? { price: { amount, currency }, compareAtPrice: null }
      : null;
  return resolvePricingProvenance(
    { source: ZOHO_SELLING_PRICE_SOURCE, observedAt, value },
    {
      ownerSource: ZOHO_SELLING_PRICE_SOURCE,
      freshnessThresholdMs: DEFAULT_FRESHNESS_THRESHOLD_MS,
    },
    evaluatedAt,
  ).pricing;
}

function attributesOf(item: ZohoRecord): VariantAttribute[] {
  return [1, 2, 3].flatMap((index) => {
    const name = text(item[`attribute_name${index}`]);
    const value = text(item[`attribute_option_name${index}`]);
    return name !== null && value !== null ? [{ name, value }] : [];
  });
}

export function mapZohoVariant(
  item: ZohoRecord,
  currency: string,
  priceTiming: { readonly observedAt: string; readonly evaluatedAt: string },
): ProductVariant | null {
  const id = text(item.item_id);
  if (id === null) {
    return null;
  }
  return {
    id,
    sku: text(item.sku),
    attributes: attributesOf(item),
    pricing: verifiedZohoSellingPrice(
      item.rate,
      currency,
      priceTiming.observedAt,
      priceTiming.evaluatedAt,
    ),
    inventory: mapZohoInventory(item),
    status: item.status === "active" ? "active" : "inactive",
  };
}

function slugFor(name: string, id: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base === "" ? "zoho-item" : base}-${id.slice(-6).toLowerCase()}`;
}

/** Zoho IDs are decimal strings; anything else is never put into an image path. */
const ZOHO_ID_PATTERN = /^\d{1,30}$/;

/** Item image reference: the item that owns the image and its document ID. */
export type ZohoItemImageRef = { readonly itemId: string; readonly documentId: string };

export function zohoItemImageRef(item: ZohoRecord): ZohoItemImageRef | null {
  const itemId = text(item.item_id);
  const documentId = text(item.image_document_id);
  return itemId !== null &&
    documentId !== null &&
    ZOHO_ID_PATTERN.test(itemId) &&
    ZOHO_ID_PATTERN.test(documentId)
    ? { itemId, documentId }
    : null;
}

/** Zoho item group ID for grouped items, otherwise the item ID (as used by `mapZohoItemsToProducts`). */
export function zohoProductIdOf(item: unknown): string | null {
  return isRecord(item) ? (text(item.group_id) ?? text(item.item_id)) : null;
}

export type MapZohoItemsOptions = {
  /**
   * Builds the storefront image URL for an item image. Without it products
   * have no images. The URL must not carry provider URLs or credentials.
   */
  readonly imageSrc?: (ref: ZohoItemImageRef) => string;
  /**
   * When the selling rate was observed, and when that observation is judged.
   * Both default to the mapping time, so a snapshot built now carries a fresh
   * price. A snapshot older than 24 hours is not served.
   */
  readonly priceObservedAt?: string;
  readonly priceEvaluatedAt?: string;
};

/** At most this many distinct images per product, in variant order. */
export const MAX_PRODUCT_IMAGES = 8;

/**
 * Groups Zoho items into products (item group = product), keeping input order.
 * The product's single storefront placement comes from `resolveCategory`
 * (group override, then Zoho category ID); without a resolver, or when it
 * returns null, `categoryIds` stays empty and the product is in no listing.
 */
export function mapZohoItemsToProducts(
  items: readonly unknown[],
  currency: string,
  resolveCategory: ZohoCategoryResolver = () => null,
  options: MapZohoItemsOptions = {},
): Product[] {
  const observedAt = options.priceObservedAt ?? new Date().toISOString();
  const priceTiming = { observedAt, evaluatedAt: options.priceEvaluatedAt ?? observedAt };
  const products = new Map<
    string,
    { product: Product; variants: ProductVariant[]; images: CatalogImage[]; documents: Set<string> }
  >();
  for (const raw of items) {
    if (!isRecord(raw)) continue;
    const variant = mapZohoVariant(raw, currency, priceTiming);
    if (variant === null) continue;
    const productId = text(raw.group_id) ?? variant.id;
    let entry = products.get(productId);
    if (entry === undefined) {
      const name = text(raw.group_name) ?? text(raw.name) ?? variant.id;
      const unit = text(raw.unit);
      const categoryId = resolveCategory({
        groupId: text(raw.group_id),
        categoryId: text(raw.category_id),
      });
      entry = {
        variants: [],
        images: [],
        documents: new Set(),
        product: {
          id: productId,
          slug: slugFor(name, productId),
          name,
          description: "",
          images: [],
          categoryIds: categoryId === null ? [] : [categoryId],
          sku: null,
          uom: unit === null ? null : { code: unit, label: unit },
          pricing: null,
          inventory: null,
          status: "inactive",
          variants: [],
        },
      };
      products.set(productId, entry);
    }
    entry.variants.push(variant);
    const image = options.imageSrc === undefined ? null : zohoItemImageRef(raw);
    if (
      options.imageSrc !== undefined &&
      image !== null &&
      !entry.documents.has(image.documentId) &&
      entry.images.length < MAX_PRODUCT_IMAGES
    ) {
      entry.documents.add(image.documentId);
      entry.images.push({ src: options.imageSrc(image), alt: entry.product.name });
    }
  }
  return [...products.values()].map(({ product, variants, images }) => ({
    ...product,
    images,
    pricing: sharedVariantSellingPrice(variants),
    status: variants.some((variant) => variant.status === "active") ? "active" : "inactive",
    variants,
  }));
}

/**
 * Builds the Zoho sales-order body. Rates are the re-validated selling
 * prices; no tax, discount, warehouse, or inclusive-tax flag is sent, so
 * Zoho applies its own defaults (recorded, not asserted). The order is left
 * in Zoho's default (draft) status.
 */
export function toZohoSalesOrderBody(order: DemoSalesOrder, demoCustomerId: string): ZohoRecord {
  const notes = [
    DEMO_ORDER_LABEL,
    `Mini Mystiq demo reference: ${order.reference}`,
    `Payment: ${DEMO_PAYMENT_LABEL} (no payment collected)`,
    `Customer: ${order.customer.name}`,
    `Mobile: ${order.customer.mobile}`,
    `Address: ${order.customer.address}`,
  ].join("\n");
  return {
    customer_id: demoCustomerId,
    reference_number: order.reference,
    line_items: order.lines.map((line) => ({
      item_id: line.variantId,
      quantity: line.quantity,
      rate: line.unitPrice.amount,
    })),
    notes,
  };
}

/** Extracts the sales-order number from a create response. */
export function readZohoSalesOrderNumber(data: unknown): string | null {
  if (!isRecord(data) || data.code !== 0 || !isRecord(data.salesorder)) {
    return null;
  }
  return text(data.salesorder.salesorder_number);
}
