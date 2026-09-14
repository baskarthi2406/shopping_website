import {
  getCategoryCollection,
  getCategoryBySlug,
  getCategoryPage,
  getHomePage,
  getProductById,
  getProductBySlug,
  getProductCollection,
  getProductDetail,
  getProductPage,
  listCategories,
  listFeaturedProducts,
  listProducts,
  listProductsByCategory,
  type CategoryRepository,
  type ProductRepository,
  type ProductCollectionQuery,
  type UomRepository,
} from "@/application/catalog";
import { listIndexableUrls } from "@/application/seo/list-indexable-urls";

export function createCatalog(
  productRepository: ProductRepository,
  categoryRepository: CategoryRepository,
  uomRepository: UomRepository,
) {
  return {
    getProductById: (id: string) => getProductById(productRepository, id),
    getProductBySlug: (slug: string) =>
      getProductBySlug(productRepository, slug),
    getProductCollection: (query: ProductCollectionQuery) =>
      getProductCollection(productRepository, query),
    getProductDetail: (slug: string) =>
      getProductDetail(productRepository, slug),
    getProductPage: (slug: string) =>
      getProductPage(productRepository, categoryRepository, slug),
    listProducts: () => listProducts(productRepository),
    listProductsByCategory: (categorySlug: string) =>
      listProductsByCategory(productRepository, categorySlug),
    listFeaturedProducts: () => listFeaturedProducts(productRepository),
    getCategoryBySlug: (slug: string) =>
      getCategoryBySlug(categoryRepository, slug),
    getCategoryCollection: () => getCategoryCollection(categoryRepository),
    getCategoryPage: (slug: string) =>
      getCategoryPage(categoryRepository, productRepository, slug),
    getHomePage: () => getHomePage(categoryRepository, productRepository),
    listCategories: () => listCategories(categoryRepository),
    listIndexableUrls: () =>
      listIndexableUrls(categoryRepository, productRepository),
    listUoms: () => uomRepository.list(),
    getUomByCode: (code: string) => uomRepository.getByCode(code),
  };
}

export type Catalog = ReturnType<typeof createCatalog>;
