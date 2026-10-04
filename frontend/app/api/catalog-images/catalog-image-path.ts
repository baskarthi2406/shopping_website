/**
 * Public catalog image URL. Only numeric source identifiers are accepted;
 * the route never takes a URL, so it cannot be used to fetch arbitrary hosts.
 */
export const CATALOG_IMAGE_ID_PATTERN = /^\d{1,30}$/;

export function catalogImagePath(itemId: string, documentId: string): string {
  if (!CATALOG_IMAGE_ID_PATTERN.test(itemId) || !CATALOG_IMAGE_ID_PATTERN.test(documentId)) {
    throw new RangeError("Catalog image identifiers must be numeric");
  }
  return `/api/catalog-images/${itemId}/${documentId}`;
}
