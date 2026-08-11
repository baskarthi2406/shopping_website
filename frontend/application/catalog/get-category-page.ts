import type { Category, Product } from "@/domain/catalog";
import type { CategoryRepository } from "./category-repository";
import { getCategoryBySlug } from "./get-category-by-slug";
import { listProductsByCategory } from "./list-products-by-category";
import type { ProductRepository } from "./product-repository";

export type CategoryPageData = {
  readonly category: Category;
  readonly products: readonly Product[];
};

/**
 * Resolves a category by slug and loads its products.
 * Returns null when the slug is not a known category so the page can notFound().
 * An existing category with no products is a valid empty result, not null.
 */
export async function getCategoryPage(
  categories: CategoryRepository,
  products: ProductRepository,
  slug: string,
): Promise<CategoryPageData | null> {
  const category = await getCategoryBySlug(categories, slug);
  if (category === null) {
    return null;
  }

  const listed = await listProductsByCategory(products, category.slug);
  return { category, products: listed };
}
