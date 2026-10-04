import type { Product } from "@/domain/catalog";
import { toProductCardViewModel, type ProductCardViewModel } from "./category-page-view-model";

/** Category reported by the source system for a product; metadata, not a storefront placement. */
export type CatalogSourceCategory = { readonly name: string | null };

export type CatalogDemoProductViewModel = ProductCardViewModel & {
  /** False when the product has no storefront category placement yet. */
  readonly placed: boolean;
};

export type CatalogDemoGroupViewModel = {
  readonly label: string;
  readonly products: readonly CatalogDemoProductViewModel[];
};

export type CatalogDemoViewModel = {
  readonly productCount: number;
  readonly placedCount: number;
  readonly unplacedCount: number;
  readonly groups: readonly CatalogDemoGroupViewModel[];
};

export const NO_SOURCE_CATEGORY_LABEL = "No source category";

/**
 * Full-catalog inspection view: every product, grouped by its source-system
 * category label (sorted, products in catalog order), with products lacking
 * a storefront placement flagged. Grouping never assigns storefront categories.
 */
export function toCatalogDemoViewModel(
  products: readonly Product[],
  sourceCategories: ReadonlyMap<string, CatalogSourceCategory>,
): CatalogDemoViewModel {
  const groups = new Map<string, CatalogDemoProductViewModel[]>();
  let placedCount = 0;
  for (const product of products) {
    const placed = product.categoryIds.length > 0;
    if (placed) {
      placedCount += 1;
    }
    const label = sourceCategories.get(product.id)?.name ?? NO_SOURCE_CATEGORY_LABEL;
    const group = groups.get(label) ?? [];
    group.push({ ...toProductCardViewModel(product), placed });
    groups.set(label, group);
  }

  return {
    productCount: products.length,
    placedCount,
    unplacedCount: products.length - placedCount,
    groups: [...groups]
      .sort(([a], [b]) => {
        if (a === NO_SOURCE_CATEGORY_LABEL || b === NO_SOURCE_CATEGORY_LABEL) {
          return a === b ? 0 : a === NO_SOURCE_CATEGORY_LABEL ? 1 : -1;
        }
        return a.localeCompare(b, "en");
      })
      .map(([label, groupProducts]) => ({ label, products: groupProducts })),
  };
}
