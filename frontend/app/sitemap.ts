import type { MetadataRoute } from "next";
import { catalog } from "@/config/catalog";
import { resolveSiteOrigin, toCanonicalUrl } from "@/config/site";

/**
 * Indexable storefront sitemap. URLs come from catalog repositories
 * via application/seo; origin comes from config/site.ts.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = resolveSiteOrigin();
  const entries = await catalog.listIndexableUrls();

  return entries.map((entry) => ({
    url: toCanonicalUrl(origin, entry.path),
  }));
}
