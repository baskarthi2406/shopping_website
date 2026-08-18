import type { CategoryRepository } from "../catalog/category-repository";
import { listCategories } from "../catalog/list-categories";
import { listProducts } from "../catalog/list-products";
import type { ProductRepository } from "../catalog/product-repository";

export type IndexableUrl = {
  readonly path: string;
};

/**
 * Indexable storefront paths for the sitemap.
 * Homepage, then categories and products in repository order.
 * Empty categories and uncategorized products are included.
 * lastModified / changeFrequency / priority are omitted — those fields are TBD.
 */
export async function listIndexableUrls(
  categories: CategoryRepository,
  products: ProductRepository,
): Promise<readonly IndexableUrl[]> {
  const [categoryList, productList] = await Promise.all([
    listCategories(categories),
    listProducts(products),
  ]);

  return [
    { path: "/" },
    ...categoryList.map((category) => ({ path: `/c/${category.slug}` })),
    ...productList.map((product) => ({ path: `/p/${product.slug}` })),
  ];
}
