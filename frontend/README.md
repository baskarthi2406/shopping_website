# Frontend — Mini Mystiq

Phase 1 SEO-first, mobile-first storefront for Mini Mystiq (Baby Clothes & Toys).

## Stack (S1-T03)

- Next.js 16 (App Router)
- React 19
- TypeScript (`strict: true`)
- Tailwind CSS v4
- ESLint (`eslint-config-next`)

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
npm run build
npm start
```

## Current state

S1-T03 foundation only. The root page shows the brand name, tagline, and approved logo.

**Not implemented yet:** product listing, product details, cart, search, categories, hero, Design Option 1 storefront, admin, SEO suite (`sitemap`, `robots`, JSON-LD, OpenGraph, canonicals).

Layer folders (`domain/`, `application/`, `repositories/`, `infrastructure/`, `components/`, `config/`, `lib/`, `types/`) are created in **S1-T04**, not this task.

## Architecture

App Router lives at `frontend/app/` (no `src/` directory). Domain and application code must stay **outside** `app/` when added in S1-T04.

```
App / Pages → Presentation → Application → Domain → Repository interface
Infrastructure implements repositories. Configuration binds them.
```

**Forbidden:** React → static JSON; React → FastAPI/SQL; Domain → Next.js/React.

Details: `docs/architecture/FRONTEND_ARCHITECTURE.md`.

## Public assets

Approved logo is served from `frontend/public/mini-mystiq-logo.png`.

The repository-root `public/` directory remains the design-asset source of truth (`docs/project/DESIGN_ASSETS.md`). Do not replace or redesign the logo.

## Configuration / environment variables

No environment variables are required for S1-T03.

When they are needed:

- Put secrets in `.env.local` (gitignored). Never commit secrets.
- Document non-secret names in `.env.example` only when a task actually introduces them.
- Prefer server-only variables unless the value must reach the browser (`NEXT_PUBLIC_*`).
- Bind infrastructure in a future `config/` module (S1-T04+). Pages must not read ad-hoc `process.env` for data-source choice.

## Testing

Testing framework selection remains **TBD** (S1-T06). Do not add a test runner in this package until that task.

Sanity checks for S1-T03: `npm run typecheck`, `npm run lint`, `npm run build`.

## SEO

Do not implement the SEO suite here. The App Router layout already exports `metadata` so later tasks can add `generateMetadata`, `sitemap.ts`, `robots.ts`, JSON-LD, canonicals, and OpenGraph without restructuring the app.

## Mobile-first

Storefront UX is Mobile → Tablet → Desktop. This scaffold only establishes the foundation (no horizontal overflow on the root page). Responsive storefront UI is later tasks.
