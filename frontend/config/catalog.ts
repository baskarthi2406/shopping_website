import {
  getCategoryBySlug,
  getCategoryPage,
  getHomePage,
  getProductById,
  getProductBySlug,
  getProductPage,
  listCategories,
  listFeaturedProducts,
  listProducts,
  listProductsByCategory,
  type CategoryRepository,
  type ProductRepository,
  type UomRepository,
} from "@/application/catalog";
import { StaticCategoryRepository } from "@/infrastructure/catalog/static-category-repository";
import { StaticProductRepository } from "@/infrastructure/catalog/static-product-repository";
import { StaticUomRepository } from "@/infrastructure/catalog/static-uom-repository";

const productRepository: ProductRepository = new StaticProductRepository();
const categoryRepository: CategoryRepository = new StaticCategoryRepository();
const uomRepository: UomRepository = new StaticUomRepository();

/**
 * Composition root for catalog data.
 * Pages and later UI call these functions. They must not import static records.
 * Phase 2 swaps the repository implementations here only (ADR 0004).
 */
export const catalog = {
  getProductById: (id: string) => getProductById(productRepository, id),
  getProductBySlug: (slug: string) => getProductBySlug(productRepository, slug),
  getProductPage: (slug: string) =>
    getProductPage(productRepository, categoryRepository, slug),
  listProducts: () => listProducts(productRepository),
  listProductsByCategory: (categorySlug: string) =>
    listProductsByCategory(productRepository, categorySlug),
  listFeaturedProducts: () => listFeaturedProducts(productRepository),
  getCategoryBySlug: (slug: string) =>
    getCategoryBySlug(categoryRepository, slug),
  getCategoryPage: (slug: string) =>
    getCategoryPage(categoryRepository, productRepository, slug),
  getHomePage: () => getHomePage(categoryRepository, productRepository),
  listCategories: () => listCategories(categoryRepository),
  listUoms: () => uomRepository.list(),
  getUomByCode: (code: string) => uomRepository.getByCode(code),
};
