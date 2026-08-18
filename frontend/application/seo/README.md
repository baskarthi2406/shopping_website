# `application/seo`

SEO helpers for `generateMetadata`, canonical paths, OpenGraph, and the sitemap URL list.

Pages call helpers; they do not copy-paste metadata objects. The Next.js Metadata API is mapped in `app/to-next-metadata.ts`. `app/sitemap.ts` calls `catalog.listIndexableUrls`. `app/robots.ts` uses `config/site.ts` only.

**S2-T01:** `category-metadata.ts` — title, description, canonical `/c/{slug}`.

**S2-T03:** `product-metadata.ts` — title, description, canonical `/p/{slug}`, optional first image.

**S3-T01:** `home-metadata.ts` — homepage title, description, canonical `/`, hero image.

**S3-T03:** `config/site.ts` + layout `metadataBase` from `NEXT_PUBLIC_SITE_URL`. Production domain TBD.

**S3-T04:** `list-indexable-urls.ts` — homepage, then categories, then products in repository order. Empty categories and uncategorized products included. No lastModified / priority / changeFrequency.

**S3-T05:** `app/robots.ts` — allow `/`, sitemap `{origin}/sitemap.xml`.

**S3-T06:** `product-structured-data.ts` — Schema.org Product from catalog fields. `serialize-json-ld.ts` escapes `<`. Offers/brand/reviews omitted. BreadcrumbList / Organization remain later Sprint 3.
