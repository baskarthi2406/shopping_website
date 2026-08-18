import type { MetadataRoute } from "next";
import { resolveSiteOrigin, toCanonicalUrl } from "@/config/site";

/**
 * Public storefront robots.txt. Allows crawling and points to /sitemap.xml.
 * Origin comes from config/site.ts.
 */
export default function robots(): MetadataRoute.Robots {
  const origin = resolveSiteOrigin();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: toCanonicalUrl(origin, "/sitemap.xml"),
  };
}
