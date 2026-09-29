import {
  isCurrencyCode,
  type Inventory,
  type Pricing,
  type Product,
  type ProductStatus,
} from "@/domain/catalog";

/**
 * Stable purchase-blocking reasons, listed in the order results report them.
 * UI and cart code map these codes to copy; they must not re-derive the rules.
 */
export const PURCHASABILITY_REASONS = [
  "product_not_found",
  "product_status_unknown",
  "product_inactive",
  "variant_required",
  "variant_not_found",
  "variant_status_unknown",
  "variant_inactive",
  "quantity_invalid",
  "price_missing",
  "price_invalid",
  "currency_invalid",
  "inventory_unknown",
  "out_of_stock",
  "insufficient_inventory",
] as const;

export type PurchasabilityReason = (typeof PURCHASABILITY_REASONS)[number];

export type PurchasabilityRequest = {
  /** `null` when the product could not be found. */
  readonly product: Product | null;
  /** Required when the product has variants; must be absent/null otherwise. */
  readonly variantId?: string | null;
  readonly quantity: number;
};

export type PurchasabilityResult = {
  readonly purchasable: boolean;
  /** Empty exactly when `purchasable` is true. */
  readonly reasons: readonly PurchasabilityReason[];
};

type Sellable = {
  readonly pricing: Pricing | null;
  readonly inventory: Inventory | null;
};

function statusReasons(
  status: ProductStatus | undefined,
  unknown: PurchasabilityReason,
  inactive: PurchasabilityReason,
): PurchasabilityReason[] {
  if (status === "active") {
    return [];
  }
  return [status === "inactive" ? inactive : unknown];
}

function pricingReasons(pricing: Pricing | null | undefined): PurchasabilityReason[] {
  if (
    pricing === null ||
    pricing === undefined ||
    pricing.price === null ||
    pricing.price === undefined
  ) {
    return ["price_missing"];
  }

  const reasons: PurchasabilityReason[] = [];
  const { amount, currency } = pricing.price;
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    reasons.push("price_invalid");
  }
  if (!isCurrencyCode(currency)) {
    reasons.push("currency_invalid");
  }
  return reasons;
}

function inventoryReasons(
  inventory: Inventory | null | undefined,
  quantity: number | null,
): PurchasabilityReason[] {
  if (inventory === null || inventory === undefined) {
    return ["inventory_unknown"];
  }
  if (inventory.status === "out_of_stock") {
    return ["out_of_stock"];
  }

  const available = inventory.availableToSell;
  if (
    inventory.status !== "in_stock" ||
    typeof available !== "number" ||
    !Number.isInteger(available) ||
    available < 0
  ) {
    return ["inventory_unknown"];
  }
  if (quantity !== null && available < quantity) {
    return ["insufficient_inventory"];
  }
  return [];
}

function isValidQuantity(quantity: number): boolean {
  return Number.isSafeInteger(quantity) && quantity > 0;
}

/**
 * Decides whether `quantity` of a product (or its selected variant) can be
 * bought using only verified catalog data. Pure and deterministic.
 *
 * Missing price, currency, status, or inventory is never defaulted: each
 * blocks with its own reason. A selected variant is judged on its own pricing
 * and inventory and never inherits the parent product's values. SKU and UOM
 * are not considered.
 */
export function evaluatePurchasability(
  request: PurchasabilityRequest,
): PurchasabilityResult {
  const { product, quantity } = request;
  if (product === null) {
    return { purchasable: false, reasons: ["product_not_found"] };
  }

  const found = new Set<PurchasabilityReason>(
    statusReasons(product.status, "product_status_unknown", "product_inactive"),
  );

  const validQuantity = isValidQuantity(quantity);
  if (!validQuantity) {
    found.add("quantity_invalid");
  }

  const variantId = request.variantId ?? null;
  const variants = product.variants ?? [];
  let sellable: Sellable | null = product;

  if (variants.length > 0) {
    const variant =
      variantId === null ? undefined : variants.find((item) => item.id === variantId);
    if (variantId === null || variantId.trim() === "") {
      found.add("variant_required");
      sellable = null;
    } else if (variant === undefined) {
      found.add("variant_not_found");
      sellable = null;
    } else {
      for (const reason of statusReasons(
        variant.status,
        "variant_status_unknown",
        "variant_inactive",
      )) {
        found.add(reason);
      }
      sellable = variant;
    }
  } else if (variantId !== null) {
    found.add("variant_not_found");
  }

  if (sellable !== null) {
    for (const reason of pricingReasons(sellable.pricing)) {
      found.add(reason);
    }
    for (const reason of inventoryReasons(
      sellable.inventory,
      validQuantity ? quantity : null,
    )) {
      found.add(reason);
    }
  }

  const reasons = PURCHASABILITY_REASONS.filter((reason) => found.has(reason));
  return { purchasable: reasons.length === 0, reasons };
}
