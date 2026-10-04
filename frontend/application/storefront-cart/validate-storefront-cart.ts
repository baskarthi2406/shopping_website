import type { Money, Product } from "@/domain/catalog";
import type { PriceDisplayConfig } from "@/application/catalog/product-commerce-view-model";
import type { CartCandidate } from "./cart-candidate";
import { toCartCandidates } from "./cart-candidate";

function itemName(product: Product, candidate: CartCandidate): string {
  const variant = candidate.variantLabel.trim();
  if (variant === "" || variant === product.name) {
    return product.name;
  }
  return `${product.name} (${variant})`;
}

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
    const name = itemName(product, candidate);
    if (!candidate.canAdd || candidate.unitPrice === null) {
      issues.push({
        variantId: line.variantId,
        message: `${name}: ${candidate.blockMessage ?? "This item cannot be checked out."}`,
      });
      continue;
    }
    if (
      candidate.unitPrice.amount !== line.unitPrice.amount ||
      candidate.unitPrice.currency !== line.unitPrice.currency
    ) {
      issues.push({
        variantId: line.variantId,
        message: `The price for ${name} changed. Review your cart and add it again before checkout.`,
      });
      continue;
    }
    if (candidate.availableToSell !== null && line.quantity > candidate.availableToSell) {
      issues.push({
        variantId: line.variantId,
        message:
          candidate.availableToSell <= 0
            ? `${name} is out of stock.`
            : `Only ${candidate.availableToSell} available for ${name}.`,
      });
    }
  }

  return { ok: issues.length === 0, issues };
}
