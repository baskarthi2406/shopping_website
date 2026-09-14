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

Component and E2E testing remain later tasks. No coverage thresholds.

## SEO

Category and product pages implement `generateMetadata` (unique title/description, canonical `/c/{slug}` or `/p/{slug}`, OpenGraph). Product pages include the first product image in OpenGraph when present. Valid PDPs also include Schema.org Product JSON-LD (name, description, image, canonical URL — no invented offers or brand). Category and product pages include BreadcrumbList JSON-LD matching the visible crumbs. The root layout emits Organization JSON-LD once (brand Mini Mystiq; no `legalName`). OpenGraph was reviewed in S3-T09: `og:url` matches canonical; images are the homepage hero, category stand-in, or primary product photo — not the logo. `/sitemap.xml` lists homepage, category, and product URLs from catalog data using the same origin as `metadataBase`. `/robots.txt` allows the public storefront and references that sitemap. Canonical domain is TBD.

## Mobile-first

Storefront UX is Mobile → Tablet → Desktop. This scaffold only establishes the foundation (no horizontal overflow on the root page). Responsive storefront UI is later tasks.
