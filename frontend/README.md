# Frontend — Mini Mystiq

SEO-first, mobile-first storefront for Mini Mystiq (Baby Clothes & Toys).

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript (`strict: true`)
- Tailwind CSS v4
- ESLint (`eslint-config-next`)
- Vitest 4 (unit tests)

Server Components are the default. No state-management library or API-client/
backend dependency has been added. The first read-only dummy route is the
S4-T04 category endpoint.

## Run

From `frontend/`:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run typecheck
npm run lint
npm test
npm run test:watch
npm run build
npm run test:http
npm run test:boundary
npm start
```

## Current state

Sprint 1 foundation is complete (S1-T08). Option 1 tokens and a semantic shell (`header` / `main` / `footer`) exist.

**S2-T01 / S2-T02:** crawlable category listing at `/c/[slug]` (Server Component). Built in S2-T01; S2-T02 added no duplicate route or ProductCard. Data comes from `catalog.getCategoryPage` only. Do not import `infrastructure/catalog/data` from `app/` or `components/`.

Valid development slugs: `/c/baby-essentials` (four products), `/c/kids` (three kids shirts), `/c/infants`, `/c/teens`, `/c/women` (empty states). Unknown slugs use `notFound()`. Product cards link to `/p/{slug}`. Uncategorized products are reachable at `/p/{slug}` only.

**S2-T03:** crawlable product detail at `/p/[slug]` via `catalog.getProductPage`. Example: `/p/pink-white-pleated-baby-dress`. Unknown slugs use `notFound()`. No price, stock, variants, or cart. JSON-LD is Sprint 3.

**S2-T04:** header catalog nav (categories from `listCategories`) and a shared
`Breadcrumbs` component on `/c/` and `/p/`. S4-T02 later replaced the flat
header rendering with recursive customer navigation while preserving this data
flow and the existing routes.

**S2-T05:** listing filter/sort deferred. Category pages do not expose Filter/Sort UI or query parameters. See `docs/requirements/CATALOG_FILTER_SORT.md`.

**S2-T06:** static catalog expanded to 12 approved product photos. No invented products, prices, or categories. Toys pending approved assets.

**S2-T07:** catalog review passed. No fixture or UI corrections. Image-path tests confirm `frontend/public/` files. Uncategorized dresses and empty infants/teens/women remain intentional.

**S3-T01:** Option 1 homepage at `/` — hero, category circles, catalog product grid (`listProducts`, not featured), secondary promo, intro, trust bar. Mobile category menu is `details`/`summary` (no Client Component). Announcement/trust copy from DESIGN_OPTION_1 (operations TBD). Search, wishlist, account, and cart chrome are not implemented.

**S3-T02:** unique titles, factual descriptions, path canonicals, and OpenGraph for `/`, `/c/[slug]`, and `/p/[slug]`. Unknown slugs are 404 + `noindex`. Category OpenGraph uses documented stand-in images.

**S3-T03:** `config/site.ts` reads `NEXT_PUBLIC_SITE_URL` and layout sets `metadataBase`. Production domain is TBD. Copy `.env.example` to `.env.local` to set a local origin; omit it to fall back to `http://localhost:3000`. Hosted production must set a non-localhost origin.

**S3-T04:** `/sitemap.xml` from `app/sitemap.ts`. URLs come from `catalog.listIndexableUrls` (homepage, categories, products — including empty categories and uncategorized products). Origin is `config/site.ts`. No `lastmod` / `priority` / `changefreq`. JSON-LD is later.

**S3-T05:** `/robots.txt` from `app/robots.ts`. Allows `/` for all crawlers and references `{origin}/sitemap.xml` from `config/site.ts`. No invented Disallow rules.

**S3-T06:** Product JSON-LD on `/p/[slug]`. Fields: name, description, primary image, canonical URL. No offers, price, SKU, brand, availability, or reviews.

**S3-T07:** BreadcrumbList JSON-LD on `/c/[slug]` and `/p/[slug]`, matching the UI trail. Uncategorized products are Home → Product.

**S3-T08:** Organization JSON-LD from the root layout. Name Mini Mystiq; no `legalName`. Logo `/mini-mystiq-logo.png`. Listing telephone and address only.

**S3-T09:** OpenGraph review. Existing S3-T02/S3-T03 metadata already met the contract (hero / category stand-in / primary product image; canonical equals `og:url`). Tests added; helpers unchanged.

**S4-T01:** repository-wide backend/API audit found no API routes, server
actions, backend application, DB/ORM, HTTP client, auth, or obsolete backend
dependency. Existing static repositories and clean interfaces remain.

**S4-T02:** customer-reference taxonomy is represented as flat infrastructure
records mapped to recursive domain `children`. Mobile uses a scrollable Menu
disclosure; tablet/desktop use a prominent single-row category bar and
hierarchy dropdowns. Search, Account, Cart, and Track Your Order are disabled
visual entry points only. Homepage category tiles remain the existing five
image-backed categories.

**S4-T03:** provider-independent contracts define recursive categories,
product summaries/details, generic variant attributes, nullable SKU/UOM/
pricing/inventory, publication and availability status, product pagination,
and consistent detail errors. Static fixtures keep unknown commerce values
null and no longer synthesize default variants. See
`docs/architecture/STOREFRONT_CONTRACTS.md`.

**S4-T04:** `GET /api/categories` returns the stable ordered recursive category
collection from `StaticCategoryRepository` through an application use case.
The route is force-static and maps failures to the shared safe error envelope.
The existing UI does not fetch this endpoint.

**S4-T05:** `GET /api/products` returns paginated product summaries from the 12
approved records. Supported queries are positive integer `page` and `pageSize`;
defaults are 1 and 12. Invalid/unsupported queries return the shared 400 error,
and repository failures return a sanitized 500. No filters are implemented.

**S4-T06:** `GET /api/products/[slug]` returns the full product-detail envelope
for an approved public SEO slug. Unknown well-formed slugs return 404
`not_found`; invalid slug syntax and unsupported query parameters return 400.
Unknown SKU/UOM/pricing/inventory remain null and variants remain empty. The
existing UI does not fetch this endpoint.

**S4-T07:** variants are generic `name`/`value` attributes. Size and color are
examples, not typed fields. Current fixtures keep `variants: []`. No variant
UI, API, or invented option values.

**Not implemented yet:** API repository/UI wiring, cart/search/account/order
behavior, filters/sort, admin, or Zoho integration. S3-T10 Image Optimization
and the original SEO-friendly URL strategy remain deferred.

## Architecture

App Router lives at `frontend/app/` (no `src/` directory). Other layers sit beside `app/`:

```
app/            routes and layouts
components/     presentation (ui/, storefront/)
domain/         catalog/, cart/
application/    catalog/, cart/, seo/  ← repository interfaces live here
infrastructure/ catalog/, cart/        ← implementations
config/         bind adapters; no secrets
lib/            shared technical utils only
```

```
App / Pages → Presentation → Application → Domain → Repository interface
Infrastructure implements repositories. Configuration binds them.
```

**Forbidden:** React → static/dummy/Zoho DTOs; React → FastAPI/SQL; Domain →
Next.js/React. Infrastructure maps transport/vendor DTOs to domain contracts.

There is no top-level `repositories/` or `types/` folder. Canonical domain models belong in `domain/`.

Details: `docs/architecture/FRONTEND_ARCHITECTURE.md` §17. Each layer folder has a README.

## Design tokens (S1-T07)

Centralized in `app/globals.css` as `--mm-*` variables, mapped to Tailwind `@theme inline`.

- Primary green `#016C37` sampled from Option 1 (implementation default, not a brand-guide lock).
- System UI sans-serif. No extra font package.
- Breakpoints: Tailwind `sm` 640 / `md` 768 / `lg` 1024 (implementation defaults; business TBD).
- Use semantic classes (`bg-primary`, `text-foreground`), not raw hex in components.
- `Container` applies `--mm-space-page` (16 → 24 → 32px) and `--mm-container-max`.
- Accessibility: `lang="en"`, skip link, `:focus-visible`, `prefers-reduced-motion`, 44px tap-min implementation default.

## Public assets

Approved logo is served from `frontend/public/mini-mystiq-logo.png`. Catalog product JPEGs used by `/c/` and `/p/` are copied into `frontend/public/` (SEO filenames). Repository-root `public/` remains the design-asset source of truth (`docs/project/DESIGN_ASSETS.md`). Do not replace or redesign the logo.

## Configuration / environment variables

| Name | Required | Purpose |
|------|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Hosted production | Public canonical origin (no path). Not a secret. Production hostname is **TBD**. |

Local development may omit it; `config/site.ts` then uses `http://localhost:3000`. Copy `.env.example` to `.env.local` to set a value. Pages must not read `process.env` for this — use `config/site.ts`.

- Put secrets in `.env.local` (gitignored). Never commit secrets.
- Prefer server-only variables unless the value must reach the browser (`NEXT_PUBLIC_*`).
- Bind infrastructure in `config/` (S1-T05+). Pages must not read ad-hoc `process.env` for data-source choice.

**Server-only convention (S6-T11):**

- `NEXT_PUBLIC_*` values are inlined into browser bundles. Never use that
  prefix for credentials, tokens, or provider settings.
- Server-only settings are read through `readServerEnv(name)` in
  `config/server-env.ts`. It rejects `NEXT_PUBLIC_*` names, treats blank as
  unset (`null`), and its errors name the variable, never its value.
- `config/catalog.ts`, `config/catalog-source.ts`,
  `config/catalog-api-dispatch.ts`, and `config/server-env.ts` start with
  `import "server-only"`. Importing them (directly or transitively) from a
  `"use client"` module fails `next build`. Fix such a failure by moving logic
  to a browser-safe module, never by removing the guard.
- Secrets must not reach client props, serialized view models, route
  responses, logs, or error messages.
- Server-only Zoho settings (S6-T14): `ZOHO_API_BASE_URL`,
  `ZOHO_ACCESS_TOKEN`, optional `ZOHO_REQUEST_TIMEOUT_MS`, read by
  `infrastructure/zoho/zoho-config.ts`. `infrastructure/zoho/zoho-client.ts`
  is the only path for Zoho requests (explicit timeout, sanitized errors,
  untrusted responses). The S6-T15 demo (`/demo`, server env
  `ZOHO_DEMO_ENABLED=true`) is frozen at `589b74a`; see
  `docs/project/DEMO-ZOHO-SALES-ORDER.md`.

## Testing

**Runner:** Vitest 4 (Node). Config: `vitest.config.mts`.

**Convention:** colocate `*.test.ts` with the source module.

| Belongs in unit tests | Does not belong |
|----------------------|-----------------|
| Domain behavior (`isCatalogSlug`) | Type-only models with no behavior |
| Application use cases with in-memory repository fakes | Importing `infrastructure/catalog/data` from application tests |
| `Static*Repository` list/get/slug/featured/UOM | Component render tests, Playwright/Cypress, mock servers |

```bash
npm test
npm run test:watch
```

**Production HTTP status checks (S4-F01):** `*.http.test.ts` files are
excluded from `npm test`. They start `next start` against the existing `.next`
production build on a free local port and assert real response status codes
(existing `/`, `/c/{slug}`, `/p/{slug}` → 200; missing category/product → 404
with the not-found page and `noindex`) for a browser and a Googlebot user
agent. Config: `vitest.http.config.mts`.

```bash
npm run build
npm run test:http
```

**Catalog API contract suite (S6-T12):** `describeCatalogApiContract` in
`infrastructure/catalog/catalog-api-contract.ts` checks any
`CatalogApiDispatch` against the public catalog envelopes (runs in
`npm test`). `config/catalog-api-dispatch.contract.test.ts` applies it to the
dummy dispatch and compares `config/catalog-api-dispatch.golden.json`
(regenerate only after an approved content change:
`UPDATE_CATALOG_GOLDEN=1 npx vitest run config/catalog-api-dispatch.contract.test.ts`).
Details and open ambiguities: `docs/architecture/STOREFRONT_CONTRACTS.md`.

**Server-only boundary (S6-T11):**

- `config/server-only-boundary.test.ts` (in `npm test`) walks the source import
  graph: every `"use client"` module must not reach `config/`,
  `infrastructure/`, or a `server-only` module, and the protected modules
  must keep their `import "server-only"`.
- `vitest.config.mts` aliases `server-only` to Next's bundled
  `next/dist/compiled/server-only/empty.js` (the module Next itself uses for
  server code), so unit tests can import server modules. The alias does not
  test client rejection; the `server-only` package is not installed because
  Next resolves the import natively.
- `npm run test:boundary` (`*.build.test.ts`, `vitest.build.config.mts`; four
  production builds) is the production verification. It runs `next build` on the
  real app with a synthetic secret and scans client artifacts (`.next/static`,
  prerendered HTML/RSC, client reference and build manifests). It then builds
  throwaway fixtures under `.boundary-fixtures/` (gitignored, deleted
  afterwards): a valid app that proves the scan detects a
  `NEXT_PUBLIC_` control and keeps a server-only marker server-side, plus two
  invalid apps (direct and transitive client imports of a server-only module)
  that must fail with Next's `'server-only' cannot be imported from a Client
  Component module` error. Synthetic values are random per run and redacted
  from failure output. It overwrites `.next`.

```bash
npm run test:boundary
```

Component and E2E testing remain later tasks. No coverage thresholds.

## SEO

Category and product pages implement `generateMetadata` (unique title/description, canonical `/c/{slug}` or `/p/{slug}`, OpenGraph). Product pages include the first product image in OpenGraph when present. Valid PDPs also include Schema.org Product JSON-LD (name, description, image, canonical URL — no invented offers or brand). Category and product pages include BreadcrumbList JSON-LD matching the visible crumbs. The root layout emits Organization JSON-LD once (brand Mini Mystiq; no `legalName`). OpenGraph was reviewed in S3-T09: `og:url` matches canonical; images are the homepage hero, category stand-in, or primary product photo — not the logo. `/sitemap.xml` lists homepage, category, and product URLs from catalog data using the same origin as `metadataBase`. `/robots.txt` allows the public storefront and references that sitemap. Canonical domain is TBD.

## Mobile-first

Storefront UX is Mobile → Tablet → Desktop. This scaffold only establishes the foundation (no horizontal overflow on the root page). Responsive storefront UI is later tasks.
