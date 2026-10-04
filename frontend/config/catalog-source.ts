import "server-only";
import { connection } from "next/server";
import type { Product } from "@/domain/catalog";
import type { ProductRepository } from "@/application/catalog";
import { SnapshotProductRepository } from "@/infrastructure/catalog/snapshot-product-repository";
import { StaticCategoryRepository } from "@/infrastructure/catalog/static-category-repository";
import { StaticProductRepository } from "@/infrastructure/catalog/static-product-repository";
import { StaticUomRepository } from "@/infrastructure/catalog/static-uom-repository";
import { createCatalog } from "./create-catalog";
import { getZohoCatalogRuntime, isZohoCatalogSource, readCatalogProductSource } from "./zoho-catalog";

/**
 * Snapshot reads wait for a real request, so routes that would otherwise be
 * prerendered (home, sitemap) read the current snapshot at request time and
 * builds never depend on Zoho.
 */
async function readSnapshotProducts(): Promise<readonly Product[]> {
  await connection();
  return (await getZohoCatalogRuntime().snapshot.get()).products;
}

function createProductRepository(): ProductRepository {
  return isZohoCatalogSource(readCatalogProductSource())
    ? new SnapshotProductRepository(readSnapshotProducts)
    : new StaticProductRepository();
}

const productRepository = createProductRepository();
const categoryRepository = new StaticCategoryRepository();
const uomRepository = new StaticUomRepository();

/**
 * Dummy API backing store. Route handlers, sitemap generation, and layout
 * navigation bind here so HTTP storefront clients cannot recurse into themselves.
 * Products come from the static fixtures or, with
 * `CATALOG_PRODUCT_SOURCE=zoho-snapshot` or `zoho-demo`, from the Zoho
 * catalog snapshot; page renders never call Zoho directly.
 */
export const catalogSource = createCatalog(
  productRepository,
  categoryRepository,
  uomRepository,
);
