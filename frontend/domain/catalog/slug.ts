const CATALOG_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** SEO-friendly catalog slug: lowercase, hyphen-separated, no stuffing. */
export function isCatalogSlug(value: string): boolean {
  return CATALOG_SLUG_PATTERN.test(value);
}
