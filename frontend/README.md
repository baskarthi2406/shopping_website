# Frontend — Mini Mystiq

Phase 1 SEO-first, mobile-first storefront for Mini Mystiq (Baby Clothes & Toys).

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript (`strict: true`)
- Tailwind CSS v4
- ESLint (`eslint-config-next`)
- Vitest 4 (unit tests)

Server Components are the default. No state-management library. No API client. No backend dependencies.

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

**S2-T04:** header catalog nav (categories from `listCategories`) and a shared `Breadcrumbs` component on `/c/` and `/p/`. Wrapping links, no hamburger Client Component, no cart/search. Breadcrumb JSON-LD is Sprint 3.

**S2-T05:** listing filter/sort deferred. Category pages do not expose Filter/Sort UI or query parameters. See `docs/requirements/CATALOG_FILTER_SORT.md`.

**S2-T06:** static catalog expanded to 12 approved product photos. No invented products, prices, or categories. Toys pending approved assets.

**S2-T07:** catalog review passed. No fixture or UI corrections. Image-path tests confirm `frontend/public/` files. Uncategorized dresses and empty infants/teens/women remain intentional.

**S3-T01:** Option 1 homepage at `/` — hero, category circles, catalog product grid (`listProducts`, not featured), secondary promo, intro, trust bar. Mobile category menu is `details`/`summary` (no Client Component). Announcement/trust copy from DESIGN_OPTION_1 (operations TBD). Search, wishlist, account, and cart chrome are not implemented.

**S3-T02:** unique titles, factual descriptions, path canonicals, and OpenGraph for `/`, `/c/[slug]`, and `/p/[slug]`. Unknown slugs are 404 + `noindex`. Category OpenGraph uses documented stand-in images. Site origin / `metadataBase` TBD (S3-T03).

**Not implemented yet:** category index, cart, search, filters/sort, Option 1 search/wishlist/account/cart chrome, admin, SEO suite remainder (`sitemap`, `robots`, JSON-LD, absolute canonical domain). SEO-friendly URL strategy is deferred from original S3-T01.

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

**Forbidden:** React → static JSON; React → FastAPI/SQL; Domain → Next.js/React.

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

No environment variables are required yet.

When they are needed:

- Put secrets in `.env.local` (gitignored). Never commit secrets.
- Document non-secret names in `.env.example` only when a task actually introduces them.
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

Category and product pages implement `generateMetadata` (unique title/description, canonical `/c/{slug}` or `/p/{slug}`, OpenGraph). Product pages include the first product image in OpenGraph when present. Site origin, sitemap, robots.txt, and JSON-LD remain later tasks. Canonical domain is TBD.

## Mobile-first

Storefront UX is Mobile → Tablet → Desktop. This scaffold only establishes the foundation (no horizontal overflow on the root page). Responsive storefront UI is later tasks.
