# App / routing

Next.js App Router only: routes, layouts, loading/error/not-found boundaries, metadata **calls**, and later `sitemap.ts` / `robots.ts`.

**May import:** application use cases, presentation components, SEO helpers.

**Must not import:** infrastructure, static JSON/fixtures, FastAPI, domain internals that bypass application services.

Pages stay thin Server Components by default. Do not put product, cart, or pricing rules here.

Future catalog routes (`/c/[slug]`, `/p/[slug]`), cart, and SEO files belong to later sprints — do not add them in S1-T04.
