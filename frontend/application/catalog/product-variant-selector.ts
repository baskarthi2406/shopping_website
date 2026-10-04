import type { Product, ProductVariant } from "@/domain/catalog";
import { VARIANT_LIST_LABEL } from "./catalog-messages";
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
 * Builds option groups from real variant attributes. A shared attribute
 * matrix is used only when every variant has a unique id, the same attribute
 * names, and a unique value combination. Otherwise each variant is listed on
 * its own. Blank or duplicate ids produce no selector. Nothing is invented.
 */
export function toVariantSelectorViewModel(
  product: Product,
): VariantSelectorViewModel | null {
  if (product.variants.length === 0) {
    return null;
  }

  return toAttributeSelector(product) ?? toExplicitVariantSelector(product);
}

/**
 * One choice per variant when the variants do not share a safe attribute
 * matrix. Labels come from each variant's own attributes, then its SKU, then
 * its id. Colliding labels are disambiguated so a choice cannot resolve to a
 * different variant.
 */
function toExplicitVariantSelector(product: Product): VariantSelectorViewModel | null {
  const ids = product.variants.map((variant) => variant.id.trim());
  if (ids.some((id) => id === "") || new Set(ids).size !== ids.length) {
    return null;
  }

  const labels = product.variants.map(variantLabel);
  const unique = labels.map((label, index) => {
    if (labels.filter((candidate) => candidate === label).length === 1) {
      return label;
    }
    const sku = product.variants[index]?.sku?.trim() ?? "";
    const suffix = sku !== "" && sku !== label ? sku : ids[index];
    return `${label} (${suffix})`;
  });

  return {
    groups: [{ key: "variant", label: sharedAttributeLabel(product.variants), values: unique }],
    variants: product.variants.map((variant, index) => ({
      id: variant.id,
      values: { variant: unique[index] ?? variant.id },
    })),
  };
}

function variantLabel(variant: ProductVariant): string {
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const attribute of variant.attributes) {
    const name = attribute.name.trim();
    const value = attribute.value.trim();
    const key = normalizeName(name);
    if (name === "" || value === "" || seen.has(key)) {
      continue;
    }
    seen.add(key);
    parts.push(`${name} ${value}`);
  }
  if (parts.length > 0) {
    return parts.join(", ");
  }
  const sku = variant.sku?.trim() ?? "";
  return sku === "" ? variant.id.trim() : sku;
}

function sharedAttributeLabel(variants: readonly ProductVariant[]): string {
  const names = variants.map((variant) => {
    const usable = variant.attributes.filter(
      (attribute) => attribute.name.trim() !== "" && attribute.value.trim() !== "",
    );
    return usable.length === 1 ? usable[0]?.name.trim() ?? null : null;
  });
  const first = names[0];
  if (
    first !== null &&
    first !== undefined &&
    names.every((name) => name !== null && normalizeName(name) === normalizeName(first))
  ) {
    return first;
  }
  return VARIANT_LIST_LABEL;
}

function toAttributeSelector(product: Product): VariantSelectorViewModel | null {

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
