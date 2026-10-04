import "server-only";
import type { LoadCatalogImage } from "@/app/api/catalog-images/[itemId]/[documentId]/get-catalog-image-handler";
import {
  describeZohoCatalogError,
  getZohoCatalogRuntime,
  isZohoCatalogSource,
  readCatalogProductSource,
} from "./zoho-catalog";

/**
 * Catalog image source for `/api/catalog-images/{itemId}/{documentId}`.
 * Only images referenced by the current catalog snapshot are served; with
 * the static catalog there are none. Provider credentials and URLs stay on
 * the server.
 */
export const loadCatalogImage: LoadCatalogImage = async (itemId, documentId) => {
  if (!isZohoCatalogSource(readCatalogProductSource())) {
    return null;
  }
  return getZohoCatalogRuntime().loadImage(itemId, documentId);
};

export function logCatalogImageError(error: unknown): void {
  console.error(`[catalog-images] image request failed: ${describeZohoCatalogError(error)}`);
}
