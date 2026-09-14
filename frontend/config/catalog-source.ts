import { StaticCategoryRepository } from "@/infrastructure/catalog/static-category-repository";
import { StaticProductRepository } from "@/infrastructure/catalog/static-product-repository";
import { StaticUomRepository } from "@/infrastructure/catalog/static-uom-repository";
import { createCatalog } from "./create-catalog";

const productRepository = new StaticProductRepository();
const categoryRepository = new StaticCategoryRepository();
const uomRepository = new StaticUomRepository();

/**
 * Dummy API backing store. Route handlers, sitemap generation, and layout
 * navigation bind here so HTTP storefront clients cannot recurse into themselves.
 * S4-T11 will move navigation onto the public category API.
 */
export const catalogSource = createCatalog(
  productRepository,
  categoryRepository,
  uomRepository,
);
