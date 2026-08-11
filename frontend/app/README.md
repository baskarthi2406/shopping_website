# App / routing

Next.js App Router only: routes, layouts, loading/error/not-found boundaries, metadata **calls**, and later `sitemap.ts` / `robots.ts`.

**May import:** application use cases, presentation components, SEO helpers.

**Must not import:** infrastructure, static JSON/fixtures, FastAPI, domain internals that bypass application services.

Pages stay thin Server Components by default. Do not put product, cart, or pricing rules here.

**S2-T01:** `c/[slug]/page.tsx` (category listing) and `not-found.tsx`. The page calls `catalog.getCategoryPage` and `generateMetadata`; it must not import fixtures.

**S2-T03:** `p/[slug]/page.tsx` (product detail) calls `catalog.getProductPage`. Unknown slugs reuse `not-found.tsx`.

**S2-T04:** `layout.tsx` loads catalog nav via `catalog.listCategories`. It remains a Server Component.

Future routes: cart and SEO files (`sitemap.ts`, `robots.ts`) belong to later sprints.
