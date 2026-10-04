# Configuration

Binds which repository implementation to use (static vs dummy/production/Zoho
HTTP). Holds non-secret public settings such as the canonical site origin.

**Must not contain:** secrets, business rules, catalog fixture rows.

`create-catalog.ts` is the shared use-case wiring helper.

`catalog-source.ts` is the dummy API backing composition (`Static*Repository`).
Route handlers and `app/sitemap.ts` call it so the dummy API cannot recurse
through the storefront HTTP client. With `CATALOG_PRODUCT_SOURCE=zoho-snapshot`
its products come from the in-memory Zoho catalog snapshot
(`zoho-catalog.ts`: refresh every `ZOHO_CATALOG_REFRESH_MINUTES`, default 360;
never served past the 24 h freshness threshold); categories stay static.
Snapshot reads call `connection()`, so the home page and sitemap render per
request from memory and builds never call Zoho.

`CATALOG_PRODUCT_SOURCE=zoho-demo` is the full-catalog **demo** mode: the same
snapshot, but every active, contract-valid Zoho product is published;
products without a mapped storefront category keep `categoryIds: []` (no
category listing) and appear on the home page, their product page, the
sitemap, and `/catalog`, which groups products by their Zoho category label
(`catalog-demo.ts`; metadata only, never a storefront placement). `commerce.ts`
shows INR prices only in this mode. Product images in either Zoho mode are
`/api/catalog-images/{itemId}/{documentId}`: `catalog-images.ts` serves only
pairs referenced by the current snapshot, fetching the bytes server-side
(`infrastructure/zoho/zoho-item-image.ts`); tokens and Zoho URLs never reach
the browser. Each uncached image view is one Zoho GET (about 4 MB); browsers
cache for one day and `next/image` caches optimized copies.

`catalog.ts` is the storefront composition root (`Http*Repository` + catalog
API client). Pages, layout navigation, and footer category columns call
`catalog.*` use cases and must not import `infrastructure/catalog/data`.
Category tree reads are request-memoized so header, footer, and pages share
one `GET /api/categories`.

A future production or Zoho adapter replaces the dummy dispatch/backing store
in this folder only (ADR 0004/0005).

`site.ts` is the single source of truth for `NEXT_PUBLIC_SITE_URL` (canonical origin / `metadataBase` / sitemap locs / robots sitemap URL / Organization `url` and logo). The production domain is **TBD** and is not hardcoded. Copy `.env.example` to `.env.local` when you need a local override. Hosted production (`VERCEL_ENV=production` or `REQUIRE_SITE_URL=true`) must set a non-localhost origin.

`organization.ts` holds public Organization JSON-LD facts (brand name, approved logo path, listing telephone and PostalAddress). It is not a legal-entity record: do not add `legalName` or social profiles here until they are confirmed.

Secrets go in `.env.local` (gitignored). The site URL is not a secret.

**Server-only (S6-T11):** `catalog.ts`, `catalog-source.ts`,
`catalog-api-dispatch.ts`, and `server-env.ts` begin with
`import "server-only"`. They are the server composition roots where a future
provider credential would be bound; a Client Component import fails
`next build`. `server-env.ts` exposes `readServerEnv(name)` for server-only
settings (rejects `NEXT_PUBLIC_*`, never echoes values). `site.ts` and
`organization.ts` hold public values and stay unmarked. Keep the guard; move
logic instead. Tests: `server-only-boundary.test.ts` and
`npm run test:boundary`.
