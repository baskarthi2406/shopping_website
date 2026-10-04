import type { Money, Product } from "@/domain/catalog";
import type { PriceDisplayConfig } from "@/application/catalog/product-commerce-view-model";
import { toCartCandidates } from "./cart-candidate";

export type StorefrontCartIssue = {
  readonly variantId: string;
  readonly message: string;
};

export type StorefrontCartCheckLine = {
  readonly productId: string;
  readonly productSlug: string;
  readonly variantId: string;
  readonly quantity: number;
  readonly unitPrice: Money;
};

/**
 * Re-checks cart lines against the current catalog. Does not change the cart
 * and does not call a provider directly.
 */
export function validateStorefrontCart(
  lines: readonly StorefrontCartCheckLine[],
  findProduct: (slug: string) => Product | null,
  priceDisplay: PriceDisplayConfig | null,
): { readonly ok: boolean; readonly issues: readonly StorefrontCartIssue[] } {
  if (lines.length === 0) {
    return { ok: false, issues: [{ variantId: "", message: "Your cart is empty." }] };
  }

  const issues: StorefrontCartIssue[] = [];
  for (const line of lines) {
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1) {
      issues.push({ variantId: line.variantId, message: "Quantity must be at least 1." });
      continue;
    }

    const product = findProduct(line.productSlug);
    if (product === null || product.id !== line.productId) {
      issues.push({ variantId: line.variantId, message: "This product is no longer available." });
      continue;
    }

    const candidate = toCartCandidates(product, priceDisplay).find(
      (item) => item.variantId === line.variantId,
    );
    if (candidate === undefined) {
      issues.push({ variantId: line.variantId, message: "This variant is no longer available." });
      continue;
    }
    if (!candidate.canAdd || candidate.unitPrice === null) {
      issues.push({
        variantId: line.variantId,
        message: candidate.blockMessage ?? "This item cannot be checked out.",
      });
      continue;
    }
    if (
      candidate.unitPrice.amount !== line.unitPrice.amount ||
      candidate.unitPrice.currency !== line.unitPrice.currency
    ) {
      issues.push({
        variantId: line.variantId,
        message: "The price for this item changed. Remove it and add it again before checkout.",
      });
      continue;
    }
    if (candidate.availableToSell !== null && line.quantity > candidate.availableToSell) {
      issues.push({
        variantId: line.variantId,
        message:
          candidate.availableToSell <= 0
            ? "Out of stock."
            : `Only ${candidate.availableToSell} available.`,
      });
    }
  }

  return { ok: issues.length === 0, issues };
}
