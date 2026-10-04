import type { DemoSalesOrder } from "@/application/checkout/place-demo-order";
import { DEMO_ORDER_LABEL, DEMO_PAYMENT_LABEL } from "@/application/checkout/demo-order";
import type { Inventory, Product, ProductVariant, VariantAttribute } from "@/domain/catalog";
import type { ZohoCategoryResolver } from "./zoho-category-mapping";

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

function attributesOf(item: ZohoRecord): VariantAttribute[] {
  return [1, 2, 3].flatMap((index) => {
    const name = text(item[`attribute_name${index}`]);
    const value = text(item[`attribute_option_name${index}`]);
    return name !== null && value !== null ? [{ name, value }] : [];
  });
}

export function mapZohoVariant(item: ZohoRecord, currency: string): ProductVariant | null {
  const id = text(item.item_id);
  if (id === null) {
    return null;
  }
  const rate = finite(item.rate);
  return {
    id,
    sku: text(item.sku),
    attributes: attributesOf(item),
    pricing: rate !== null && rate > 0 ? { price: { amount: rate, currency }, compareAtPrice: null } : null,
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
): Product[] {
  const products = new Map<string, { product: Product; variants: ProductVariant[] }>();
  for (const raw of items) {
    if (!isRecord(raw)) continue;
    const variant = mapZohoVariant(raw, currency);
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
  }
  return [...products.values()].map(({ product, variants }) => ({
    ...product,
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
