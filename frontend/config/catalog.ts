import { HttpCategoryRepository } from "@/infrastructure/catalog/http-category-repository";
import { HttpProductRepository } from "@/infrastructure/catalog/http-product-repository";
import { StaticUomRepository } from "@/infrastructure/catalog/static-uom-repository";
import { createCatalogApiClient } from "@/infrastructure/catalog/catalog-api-client";
import { dispatchCatalogApi } from "./catalog-api-dispatch";
import { createCatalog } from "./create-catalog";

const catalogApi = createCatalogApiClient(dispatchCatalogApi);
const productRepository = new HttpProductRepository(catalogApi);
const categoryRepository = new HttpCategoryRepository(catalogApi);
const uomRepository = new StaticUomRepository();

/**
 * Storefront composition root. Pages call these use cases and never choose a
 * repository or import fixtures. Product/category reads go through the dummy
 * API client (ADR 0004). UOM has no dummy endpoint yet, so it stays static.
 */
export const catalog = createCatalog(
  productRepository,
  categoryRepository,
  uomRepository,
);
