import "server-only";
import { connection } from "next/server";
import type { CatalogSourceCategory } from "@/application/catalog/catalog-demo-view-model";
import { getZohoCatalogRuntime, readCatalogProductSource } from "./zoho-catalog";

/**
 * Full-catalog demo view (`/catalog`). Enabled only with
 * `CATALOG_PRODUCT_SOURCE=zoho-demo`; it shows source-system category labels
 * as metadata and never assigns storefront categories.
 */
export function isCatalogDemoEnabled(): boolean {
  return readCatalogProductSource() === "zoho-demo";
}

/** Source category per product ID from the current catalog snapshot. */
export async function getCatalogSourceCategories(): Promise<
  ReadonlyMap<string, CatalogSourceCategory>
> {
  await connection();
  return (await getZohoCatalogRuntime().snapshot.get()).sourceCategories;
}
