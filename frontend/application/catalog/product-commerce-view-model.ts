import type { Money, Pricing, Product } from "@/domain/catalog";
import {
  AVAILABILITY_NOT_CONFIRMED_MESSAGE,
  NOT_CURRENTLY_AVAILABLE_MESSAGE,
  OUT_OF_STOCK_MESSAGE,
  PRICE_NOT_AVAILABLE_MESSAGE,
} from "./catalog-messages";
import {
  evaluatePurchasability,
  type PurchasabilityReason,
} from "./evaluate-purchasability";

/**
 * Approved price presentation. A price renders only when its currency is
 * listed here; `null` means no locale/currency is approved for display.
 */
export type PriceDisplayConfig = {
  readonly locale: string;
  readonly currencies: readonly string[];
};

export type AvailabilityState = "out_of_stock" | "not_available" | "unconfirmed";

export type ProductCommerceViewModel = {
  /** Formatted price, or `null` when no verified, displayable price exists. */
  readonly price: string | null;
  readonly compareAtPrice: string | null;
  /** Shown instead of a price; `null` exactly when `price` is set. */
  readonly priceMessage: string | null;
  readonly availability: AvailabilityState | null;
  readonly availabilityMessage: string | null;
  readonly purchasable: boolean;
  /** SKU of the selected variant, or of the product when it has no variants. */
  readonly sku: string | null;
};

export type ProductCommerceOptions = {
  readonly priceDisplay: PriceDisplayConfig | null;
  readonly variantId?: string | null;
};

const PRICE_BLOCKERS: readonly PurchasabilityReason[] = [
  "variant_required",
  "variant_not_found",
  "price_missing",
  "price_invalid",
  "currency_invalid",
];

const UNCONFIRMED_REASONS: readonly PurchasabilityReason[] = [
  "product_status_unknown",
  "variant_status_unknown",
  "variant_required",
  "variant_not_found",
  "inventory_unknown",
  "insufficient_inventory",
];

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

function sellablePricing(product: Product, variantId: string | null): Pricing | null {
  if (product.variants.length === 0) {
    return product.pricing;
  }
  return product.variants.find((variant) => variant.id === variantId)?.pricing ?? null;
}

function availabilityFor(
  reasons: readonly PurchasabilityReason[],
): AvailabilityState | null {
  if (reasons.includes("out_of_stock")) {
    return "out_of_stock";
  }
  if (reasons.includes("product_inactive") || reasons.includes("variant_inactive")) {
    return "not_available";
  }
  if (reasons.some((reason) => UNCONFIRMED_REASONS.includes(reason))) {
    return "unconfirmed";
  }
  return null;
}

const AVAILABILITY_MESSAGES: Record<AvailabilityState, string> = {
  out_of_stock: OUT_OF_STOCK_MESSAGE,
  not_available: NOT_CURRENTLY_AVAILABLE_MESSAGE,
  unconfirmed: AVAILABILITY_NOT_CONFIRMED_MESSAGE,
};

/**
 * PDP price and availability presentation. Eligibility comes only from
 * `evaluatePurchasability`; this mapper adds formatting and copy. Confirmed
 * in-stock status is not announced (showing "In stock" is undecided).
 */
export function toProductCommerceViewModel(
  product: Product,
  options: ProductCommerceOptions,
): ProductCommerceViewModel {
  const variantId = options.variantId ?? null;
  const { purchasable, reasons } = evaluatePurchasability({
    product,
    variantId,
    quantity: 1,
  });

  const pricing = sellablePricing(product, variantId);
  let price: string | null = null;
  let compareAtPrice: string | null = null;
  if (
    pricing !== null &&
    options.priceDisplay !== null &&
    !reasons.some((reason) => PRICE_BLOCKERS.includes(reason))
  ) {
    price = formatMoney(pricing.price, options.priceDisplay);
    const compareAt = pricing.compareAtPrice;
    if (
      price !== null &&
      compareAt !== null &&
      compareAt.currency === pricing.price.currency &&
      Number.isFinite(compareAt.amount) &&
      compareAt.amount > pricing.price.amount
    ) {
      compareAtPrice = formatMoney(compareAt, options.priceDisplay);
    }
  }

  const availability = availabilityFor(reasons);

  return {
    price,
    compareAtPrice,
    priceMessage: price === null ? PRICE_NOT_AVAILABLE_MESSAGE : null,
    availability,
    availabilityMessage: availability === null ? null : AVAILABILITY_MESSAGES[availability],
    purchasable,
    sku: skuFor(product, variantId),
  };
}

function skuFor(product: Product, variantId: string | null): string | null {
  const source =
    product.variants.length === 0
      ? product.sku
      : variantId === null
        ? null
        : (product.variants.find((variant) => variant.id === variantId)?.sku ?? null);
  const sku = source?.trim() ?? "";
  return sku === "" ? null : sku;
}
