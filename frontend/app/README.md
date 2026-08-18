# App / routing

Next.js App Router only: routes, layouts, loading/error/not-found boundaries, metadata **calls**, `sitemap.ts`, and `robots.ts`.

**May import:** application use cases, presentation components, SEO helpers.

**Must not import:** infrastructure, static JSON/fixtures, FastAPI, domain internals that bypass application services.

Pages stay thin Server Components by default. Do not put product, cart, or pricing rules here.

**S2-T01:** `c/[slug]/page.tsx` (category listing) and `not-found.tsx`. The page calls `catalog.getCategoryPage` and `generateMetadata`; it must not import fixtures.

**S2-T03:** `p/[slug]/page.tsx` (product detail) calls `catalog.getProductPage`. Unknown slugs reuse `not-found.tsx`.

**S2-T04:** `layout.tsx` loads catalog nav via `catalog.listCategories`. It remains a Server Component.

**S3-T04:** `sitemap.ts` calls `catalog.listIndexableUrls` and `config/site.ts`. It must not import fixtures.

**S3-T05:** `robots.ts` allows `/` and references `/sitemap.xml` via `config/site.ts`. It must not import catalog data.

**S3-T06:** `p/[slug]/page.tsx` renders Product JSON-LD via `JsonLd` after `catalog.getProductPage`. Unknown slugs still `notFound()` with no Product JSON-LD.

**S3-T07:** `c/[slug]/page.tsx` and `p/[slug]/page.tsx` render BreadcrumbList JSON-LD from the view-model trail.

Future routes: cart belongs to a later sprint.
