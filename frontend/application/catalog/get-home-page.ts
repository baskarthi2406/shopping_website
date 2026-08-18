import type { Category, Product } from "@/domain/catalog";
import type { CategoryRepository } from "./category-repository";
import { listCategories } from "./list-categories";
import { listProducts } from "./list-products";
import type { ProductRepository } from "./product-repository";

export type HomePageData = {
  readonly categories: readonly Category[];
  readonly products: readonly Product[];
};

/**
 * Homepage catalog data. Uses list(), not listFeatured() —
 * featured merchandising is still TBD.
 */
export async function getHomePage(
  categories: CategoryRepository,
  products: ProductRepository,
): Promise<HomePageData> {
  const [categoryList, productList] = await Promise.all([
    listCategories(categories),
    listProducts(products),
  ]);

  return {
    categories: categoryList,
    products: productList,
  };
}
