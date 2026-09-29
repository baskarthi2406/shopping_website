import { cache } from "react";
import { HttpCategoryRepository } from "@/infrastructure/catalog/http-category-repository";
import { HttpProductRepository } from "@/infrastructure/catalog/http-product-repository";
import { StaticUomRepository } from "@/infrastructure/catalog/static-uom-repository";
import {
  createCatalogApiClient,
  type CatalogApiClient,
} from "@/infrastructure/catalog/catalog-api-client";
import { dispatchCatalogApi } from "./catalog-api-dispatch";
import { createCatalog } from "./create-catalog";

const catalogApi = createCatalogApiClient(dispatchCatalogApi);
const storefrontCatalogApi: CatalogApiClient = {
  getCategoryTree: cache(() => catalogApi.getCategoryTree()),
  getProductCollection: (query) => catalogApi.getProductCollection(query),
  getProductBySlug: cache((slug: string) => catalogApi.getProductBySlug(slug)),
};
const productRepository = new HttpProductRepository(storefrontCatalogApi);
const categoryRepository = new HttpCategoryRepository(storefrontCatalogApi);
const uomRepository = new StaticUomRepository();

/**
 * Storefront composition root. Pages and layout navigation call these use
 * cases and never choose a repository or import fixtures. Product/category
 * reads go through the dummy API client (ADR 0004). Category tree and product
 * detail reads are request-memoized so header, footer, route existence checks,
 * and pages share one GET /api/categories and one product detail request.
 * UOM has no dummy endpoint yet, so it stays static.
 */
export const catalog = createCatalog(
  productRepository,
  categoryRepository,
  uomRepository,
);
