import type { MetadataRoute } from "next";
import { catalogSource } from "@/config/catalog-source";
import { resolveSiteOrigin, toCanonicalUrl } from "@/config/site";

/**
 * Indexable storefront sitemap. URLs come from the dummy API backing
 * composition via application/seo; origin comes from config/site.ts.
 * Storefront pages use the HTTP catalog client; sitemap stays on the same
 * source the dummy API uses so build-time URLs stay aligned.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = resolveSiteOrigin();
  const entries = await catalogSource.listIndexableUrls();

  return entries.map((entry) => ({
    url: toCanonicalUrl(origin, entry.path),
  }));
}
