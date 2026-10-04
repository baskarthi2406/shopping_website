import type { Inventory, Money, Pricing, Product, ProductVariant } from "@/domain/catalog";
import {
  NOT_CURRENTLY_AVAILABLE_MESSAGE,
  OUT_OF_STOCK_MESSAGE,
} from "@/application/catalog/catalog-messages";
import { evaluatePurchasability } from "@/application/catalog/evaluate-purchasability";
import type { PriceDisplayConfig } from "@/application/catalog/product-commerce-view-model";
import { imageForVariant } from "@/application/catalog/variant-selection";

/**
 * One variant the product page may add. `unitPrice` is set only when the
 * approved price display can show that variant's selling price.
 */
export type CartCandidate = {
  readonly productId: string;
  readonly productSlug: string;
  readonly productName: string;
  readonly variantId: string;
  readonly sku: string | null;
  readonly attributes: readonly { readonly name: string; readonly value: string }[];
  readonly variantLabel: string;
  readonly unitPrice: Money | null;
  readonly unitPriceLabel: string | null;
  readonly priceLocale: string | null;
  readonly imageSrc: string | null;
  readonly imageAlt: string | null;
  readonly availableToSell: number | null;
  readonly canAdd: boolean;
  readonly blockMessage: string | null;
};

const PRICE_BLOCKERS = new Set([
  "price_missing",
  "price_invalid",
  "currency_invalid",
]);

function trimmedSku(sku: string | null | undefined): string | null {
  const value = sku?.trim() ?? "";
  return value === "" ? null : value;
}

function formatMoney(money: Money, config: PriceDisplayConfig): string | null {
  if (!config.currencies.includes(money.currency)) {
    return null;
  }
  try {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: money.currency,
    }).format(money.amount);
  } catch {
    return null;
  }
}

function sellingPrice(
  pricing: Pricing | null,
  priceDisplay: PriceDisplayConfig | null,
): { unitPrice: Money; unitPriceLabel: string; priceLocale: string } | null {
  if (priceDisplay === null || pricing === null) {
    return null;
  }
  const label = formatMoney(pricing.price, priceDisplay);
  if (label === null) {
    return null;
  }
  return {
    unitPrice: { amount: pricing.price.amount, currency: pricing.price.currency },
    unitPriceLabel: label,
    priceLocale: priceDisplay.locale,
  };
}

/** Known units that can be sold. Null means stock was not confirmed. */
export function knownAvailableToSell(inventory: Inventory | null): number | null {
  if (inventory === null) {
    return null;
  }
  if (inventory.status === "out_of_stock") {
    return 0;
  }
  if (
    inventory.status === "in_stock" &&
    typeof inventory.availableToSell === "number" &&
    Number.isSafeInteger(inventory.availableToSell) &&
    inventory.availableToSell >= 0
  ) {
    return inventory.availableToSell;
  }
  return null;
}

function variantLabel(variant: ProductVariant | null, product: Product): string {
  if (variant !== null && variant.attributes.length > 0) {
    return variant.attributes.map((attribute) => `${attribute.name} ${attribute.value}`).join(", ");
  }
  return trimmedSku(variant?.sku ?? product.sku) ?? product.name;
}

function candidateFor(
  product: Product,
  variant: ProductVariant | null,
  priceDisplay: PriceDisplayConfig | null,
): CartCandidate {
  const variantId = variant?.id ?? product.id;
  const evaluation = evaluatePurchasability({
    product,
    variantId: variant?.id ?? null,
    quantity: 1,
  });
  const reasons = new Set(evaluation.reasons);
  reasons.delete("inventory_unknown");

  const priced = sellingPrice(variant?.pricing ?? product.pricing, priceDisplay);
  const priceBlocked =
    priced === null || [...reasons].some((reason) => PRICE_BLOCKERS.has(reason));
  if (priceBlocked) {
    reasons.add("price_missing");
  }

  const availableToSell = knownAvailableToSell(variant?.inventory ?? product.inventory);
  const outOfStock =
    reasons.has("out_of_stock") ||
    reasons.has("insufficient_inventory") ||
    availableToSell === 0;
  const inactive = reasons.has("product_inactive") || reasons.has("variant_inactive");

  let blockMessage: string | null = null;
  if (inactive) {
    blockMessage = NOT_CURRENTLY_AVAILABLE_MESSAGE;
  } else if (outOfStock) {
    blockMessage = OUT_OF_STOCK_MESSAGE;
  } else if (priceBlocked || reasons.has("price_missing")) {
    blockMessage = "Price is currently unavailable.";
  } else if (reasons.size > 0) {
    blockMessage = NOT_CURRENTLY_AVAILABLE_MESSAGE;
  }

  const image = variant === null ? product.images[0] : (imageForVariant(product.images, variant.id) ?? product.images[0]);

  return {
    productId: product.id,
    productSlug: product.slug,
    productName: product.name,
    variantId,
    sku: trimmedSku(variant?.sku ?? product.sku),
    attributes: variant?.attributes.map((attribute) => ({ name: attribute.name, value: attribute.value })) ?? [],
    variantLabel: variantLabel(variant, product),
    unitPrice: priceBlocked ? null : priced.unitPrice,
    unitPriceLabel: priceBlocked ? null : priced.unitPriceLabel,
    priceLocale: priceBlocked ? null : priced.priceLocale,
    imageSrc: image?.src ?? null,
    imageAlt: image?.alt ?? null,
    availableToSell: outOfStock ? 0 : availableToSell,
    canAdd: blockMessage === null,
    blockMessage,
  };
}

/** One candidate per variant, or one candidate when the product has no variants. */
export function toCartCandidates(
  product: Product,
  priceDisplay: PriceDisplayConfig | null,
): readonly CartCandidate[] {
  if (product.variants.length === 0) {
    return [candidateFor(product, null, priceDisplay)];
  }
  return product.variants.map((variant) => candidateFor(product, variant, priceDisplay));
}

export function formatCartMoney(money: Money, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: money.currency,
    }).format(money.amount);
  } catch {
    return `${money.currency} ${money.amount}`;
  }
}
