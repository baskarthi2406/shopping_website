import {
  evaluatePurchasability,
  toProductCommerceViewModel,
  type PriceDisplayConfig,
} from "@/application/catalog";
import type { Money, Product, ProductVariant } from "@/domain/catalog";

export type DemoVariantViewModel = {
  readonly productId: string;
  readonly variantId: string;
  readonly productName: string;
  readonly label: string;
  readonly sku: string | null;
  /** Formatted selling price, or null when not verified/displayable. */
  readonly price: string | null;
  readonly unitPrice: Money | null;
  readonly stockLabel: string;
  readonly availableToSell: number;
  readonly purchasable: boolean;
};

export type DemoProductViewModel = {
  readonly productId: string;
  readonly name: string;
  readonly variants: readonly DemoVariantViewModel[];
};

/** Attribute values, e.g. "M / Pink"; "Standard" for items without attributes. */
export function demoVariantLabel(variant: ProductVariant): string {
  return variant.attributes.length > 0
    ? variant.attributes.map((attribute) => attribute.value).join(" / ")
    : "Standard";
}

/** Organization-level stock wording; it does not claim a location. */
function stockLabel(variant: ProductVariant): string {
  const inventory = variant.inventory;
  if (inventory?.status === "in_stock" && inventory.availableToSell !== null) {
    return `In stock (${inventory.availableToSell} available)`;
  }
  if (inventory?.status === "out_of_stock") {
    return "Out of stock";
  }
  return "Stock not confirmed";
}

/**
 * One row per real variant. Purchasability comes only from
 * `evaluatePurchasability`; price formatting from the commerce view model, so
 * no compare-at/MRP or tax wording is produced.
 */
export function toDemoProductViewModels(
  products: readonly Product[],
  priceDisplay: PriceDisplayConfig,
): DemoProductViewModel[] {
  return products
    .filter((product) => product.variants.length > 0)
    .map((product) => ({
      productId: product.id,
      name: product.name,
      variants: product.variants.map((variant) => {
        const { purchasable } = evaluatePurchasability({
          product,
          variantId: variant.id,
          quantity: 1,
        });
        const commerce = toProductCommerceViewModel(product, {
          priceDisplay,
          variantId: variant.id,
        });
        return {
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          label: demoVariantLabel(variant),
          sku: variant.sku,
          price: commerce.price,
          unitPrice: variant.pricing?.price ?? null,
          stockLabel: stockLabel(variant),
          availableToSell: variant.inventory?.availableToSell ?? 0,
          purchasable: purchasable && commerce.price !== null,
        };
      }),
    }));
}
