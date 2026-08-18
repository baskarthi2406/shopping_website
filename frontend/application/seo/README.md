# `application/seo`

SEO helpers for `generateMetadata`, canonical paths, and OpenGraph.

Pages call helpers; they do not copy-paste metadata objects. The Next.js Metadata API is mapped in `app/to-next-metadata.ts`. `sitemap.ts` / `robots.ts` stay under `app/` when those tasks run.

**S2-T01:** `category-metadata.ts` — title, description, canonical `/c/{slug}`.

**S2-T03:** `product-metadata.ts` — title, description, canonical `/p/{slug}`, optional first image.

**S3-T01:** `home-metadata.ts` — homepage title, description, canonical `/`, hero image.

**S3-T02:** shared `IndexablePageMetadata`; category OpenGraph stand-in images; `buildNotFoundMetadata`; unique titles across page types. JSON-LD, sitemap, and robots remain later Sprint 3. Canonical domain / `metadataBase` is TBD (S3-T03).
