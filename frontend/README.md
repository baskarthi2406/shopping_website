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

Sprint 1 foundation is complete (S1-T08). Option 1 tokens and a semantic shell (`header` / `main` / `footer`) exist. The home page remains a brand shell (no catalog, hero, or nav).

**S2-T01:** crawlable category listing at `/c/[slug]` (Server Component). Data comes from `catalog.getCategoryPage` only. Do not import `infrastructure/catalog/data` from `app/` or `components/`.

Valid development slugs: `/c/baby-essentials` (three products), `/c/infants`, `/c/kids`, `/c/teens`, `/c/women` (empty states). Unknown slugs use `notFound()`. Product cards link to `/p/{slug}` (PDP not built). No cart, search, or filters.

**Not implemented yet:** product detail page, category index, homepage catalog, cart, search, full Option 1 header/nav/footer, admin, SEO suite remainder (`sitemap`, `robots`, JSON-LD).

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

Approved logo is served from `frontend/public/mini-mystiq-logo.png`. S2-T01 also copied the three `baby-essentials` product JPEGs into `frontend/public/` (SEO filenames). Repository-root `public/` remains the design-asset source of truth (`docs/project/DESIGN_ASSETS.md`). Do not replace or redesign the logo.

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

Category pages implement `generateMetadata` (unique title/description, canonical `/c/{slug}`, OpenGraph title/description). Site origin, sitemap, robots.txt, and JSON-LD remain later tasks. Canonical domain is TBD.

## Mobile-first

Storefront UX is Mobile → Tablet → Desktop. This scaffold only establishes the foundation (no horizontal overflow on the root page). Responsive storefront UI is later tasks.
