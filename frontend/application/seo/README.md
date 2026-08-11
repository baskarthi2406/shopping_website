# `application/seo`

SEO helpers for `generateMetadata`, canonical URLs, OpenGraph, and JSON-LD (Product, BreadcrumbList, Organization).

Pages call helpers; they do not copy-paste metadata objects. `sitemap.ts` / `robots.ts` stay under `app/` and call this layer.

Do not implement the SEO suite in S1-T04 (Sprint 3).
