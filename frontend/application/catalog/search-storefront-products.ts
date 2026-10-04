import type { Category, Product } from "@/domain/catalog";

export const STOREFRONT_SEARCH_QUERY_MAX = 80;

function normalize(value: string): string {
  return value.toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

function categoryNames(categories: readonly Category[], names: Map<string, string>): void {
  for (const category of categories) {
    names.set(category.id, category.name);
    categoryNames(category.children, names);
  }
}

/**
 * Filters the storefront catalog already loaded for the page. Matches the
 * product name, and a product SKU, variant SKU, or storefront category name
 * when that text is already on the catalog records. Empty queries match nothing.
 */
export function searchStorefrontProducts(
  products: readonly Product[],
  categories: readonly Category[],
  query: string,
): readonly Product[] {
  const needle = normalize(query).slice(0, STOREFRONT_SEARCH_QUERY_MAX);
  if (needle.length === 0) {
    return [];
  }
  const names = new Map<string, string>();
  categoryNames(categories, names);
  const terms = needle.split(" ");

  return products.filter((product) => {
    const fields = [product.name];
    if (product.sku !== null && product.sku.trim() !== "") {
      fields.push(product.sku);
    }
    for (const categoryId of product.categoryIds) {
      const name = names.get(categoryId);
      if (name !== undefined) {
        fields.push(name);
      }
    }
    for (const variant of product.variants) {
      if (variant.sku !== null && variant.sku.trim() !== "") {
        fields.push(variant.sku);
      }
    }
    const haystack = normalize(fields.join(" "));
    return terms.every((term) => haystack.includes(term));
  });
}
