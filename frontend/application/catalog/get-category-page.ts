import type { Category, Product } from "@/domain/catalog";
import type { CategoryRepository } from "./category-repository";
import { getCategoryBySlug } from "./get-category-by-slug";
import { listCategoryAncestors } from "./list-category-ancestors";
import { listProductsByCategory } from "./list-products-by-category";
import type { ProductRepository } from "./product-repository";

export type CategoryPageData = {
  readonly category: Category;
  /** Parent chain, root first; empty for a top-level category. */
  readonly ancestors: readonly Category[];
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

  const [ancestors, listed] = await Promise.all([
    listCategoryAncestors(categories, category),
    listProductsByCategory(products, category.slug),
  ]);
  return { category, ancestors, products: listed };
}
