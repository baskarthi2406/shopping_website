# `application/seo`

SEO helpers for `generateMetadata`, canonical URLs, OpenGraph, and JSON-LD (Product, BreadcrumbList, Organization).

Pages call helpers; they do not copy-paste metadata objects. `sitemap.ts` / `robots.ts` stay under `app/` and call this layer.

**S2-T01:** `category-metadata.ts` builds title, description, and canonical path `/c/{slug}` from category domain data.

**S2-T03:** `product-metadata.ts` builds title, description, canonical path `/p/{slug}`, and optional first-image OpenGraph data. JSON-LD, sitemap, and robots remain Sprint 3. Canonical domain is TBD.
