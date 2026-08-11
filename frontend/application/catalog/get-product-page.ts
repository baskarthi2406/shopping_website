import type { Category, Product } from "@/domain/catalog";
import type { CategoryRepository } from "./category-repository";
import { getProductBySlug } from "./get-product-by-slug";
import type { ProductRepository } from "./product-repository";

export type ProductPageData = {
  readonly product: Product;
  readonly categories: readonly Category[];
};

/**
 * Resolves a product by slug and any known merchandising categories.
 * Returns null when the slug is unknown so the page can notFound().
 * Unresolved category ids are omitted — they are not invented.
 */
export async function getProductPage(
  products: ProductRepository,
  categories: CategoryRepository,
  slug: string,
): Promise<ProductPageData | null> {
  const product = await getProductBySlug(products, slug);
  if (product === null) {
    return null;
  }

  const resolved = await Promise.all(
    product.categoryIds.map((categoryId) => categories.getById(categoryId)),
  );

  return {
    product,
    categories: resolved.filter((category): category is Category => category !== null),
  };
}
