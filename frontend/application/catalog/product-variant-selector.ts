import type { Product } from "@/domain/catalog";
import {
  toProductCommerceViewModel,
  type ProductCommerceOptions,
  type ProductCommerceViewModel,
} from "./product-commerce-view-model";
import type { VariantChoiceViewModel, VariantSelectorViewModel } from "./variant-selection";

export type ProductPurchaseOptionsViewModel = {
  /** Commerce state with no variant selected (or for products without variants). */
  readonly commerce: ProductCommerceViewModel;
  /** `null` when the product has no variants or they are not safely selectable. */
  readonly selector: VariantSelectorViewModel | null;
  readonly commerceByVariant: Readonly<Record<string, ProductCommerceViewModel>>;
};

const normalizeName = (name: string) => name.trim().toLowerCase();

/**
 * Builds option groups from real variant attributes. Returns `null` (no
 * selector) unless every variant has a non-blank id, unique non-blank
 * attribute names with non-blank values, the same attribute names as every
 * other variant, and a unique value combination. Nothing is invented or
 * defaulted.
 */
export function toVariantSelectorViewModel(
  product: Product,
): VariantSelectorViewModel | null {
  if (product.variants.length === 0) {
    return null;
  }

  const groups = new Map<string, { label: string; values: string[] }>();
  const variants: VariantChoiceViewModel[] = [];
  const variantIds = new Set<string>();
  const combinations = new Set<string>();

  for (const variant of product.variants) {
    const id = variant.id.trim();
    if (id === "" || variantIds.has(id)) {
      return null;
    }
    variantIds.add(id);

    const values: Record<string, string> = {};
    for (const attribute of variant.attributes) {
      const key = normalizeName(attribute.name);
      const value = attribute.value.trim();
      if (key === "" || value === "" || key in values) {
        return null;
      }
      values[key] = value;

      const group = groups.get(key) ?? { label: attribute.name.trim(), values: [] };
      if (!group.values.includes(value)) {
        group.values.push(value);
      }
      groups.set(key, group);
    }
    if (Object.keys(values).length === 0) {
      return null;
    }
    variants.push({ id: variant.id, values });
  }

  const keys = [...groups.keys()];
  for (const choice of variants) {
    if (keys.some((key) => !(key in choice.values))) {
      return null;
    }
    const combination = keys.map((key) => `${key}=${choice.values[key]}`).join("|");
    if (combinations.has(combination)) {
      return null;
    }
    combinations.add(combination);
  }

  return {
    groups: keys.map((key) => {
      const group = groups.get(key)!;
      return { key, label: group.label, values: group.values };
    }),
    variants,
  };
}

/**
 * PDP commerce for every selectable state, computed once on the server so the
 * client only switches between precomputed view models.
 */
export function toProductPurchaseOptionsViewModel(
  product: Product,
  options: Pick<ProductCommerceOptions, "priceDisplay">,
): ProductPurchaseOptionsViewModel {
  const commerce = toProductCommerceViewModel(product, { ...options, variantId: null });
  const selector = toVariantSelectorViewModel(product);
  const commerceByVariant: Record<string, ProductCommerceViewModel> = {};
  if (selector !== null) {
    for (const variant of selector.variants) {
      commerceByVariant[variant.id] = toProductCommerceViewModel(product, {
        ...options,
        variantId: variant.id,
      });
    }
  }
  return { commerce, selector, commerceByVariant };
}
