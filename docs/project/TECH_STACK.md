# Technology Stack

## Phase 1 — Storefront

| Concern | Choice | Status |
|---------|--------|--------|
| Framework | Next.js 16.3.0 App Router | Decided; initialized in `frontend/` (S1-T03) |
| UI | React 19.2.8 | Decided |
| Language | TypeScript 5.9.3 (`strict: true`) | Decided |
| Styling | Tailwind CSS 4.3.3 | Decided |
| Storefront UX | Mobile-first (Mobile → Tablet → Desktop) | Decided; S1-T07 uses Tailwind sm/md/lg as implementation defaults |
| Design tokens | Option 1 CSS variables in `frontend/app/globals.css` | S1-T07; hex are implementation defaults |
| Brand | Mini Mystiq | Decided |
| Homepage UI | Design Option 1 (top-left of `mini-mystiq-app-design-suggestions.png`) | **Finalized** — `DESIGN_OPTION_1.md` |
| Visual assets | `public/` (logo + product/promo photos) | Approved; inventory in `DESIGN_ASSETS.md` |
| Image pipeline | Next.js Image | In use for the approved logo (`frontend/public/mini-mystiq-logo.png`) |
| Routing | App Router at `frontend/app/` (no `src/`) | Decided (ADR 0002); S1-T03 |
| Data | Static/mock repositories | Implemented S1-T05 (`config/catalog.ts` → ports → static repos); retained by S4-T01 |
| Dummy API | Next.js App Router route handlers | Category collection S4-T04; paginated product collection S4-T05; product detail S4-T06 |
| Testing tools | Vitest 4.1.10 (Node environment) | Decided S1-T06; colocate `*.test.ts` |
| Linting | ESLint 9.39.5 + `eslint-config-next` 16.3.0 | Reviewed S1-T06; keep Next Core Web Vitals + TypeScript |
| Formatting | No Prettier | Decided S1-T06 — avoid a second style tool; ESLint + editor defaults |

## Server-side (Next.js) — Sprint 6 onward

| Concern | Choice | Status |
|---------|--------|--------|
| Application | Single Next.js application; no separate backend (ADR 0006, supersedes ADR 0003) | Decided S6-T02 |
| Server code | Server Components, server-only modules, Route Handlers (Node.js runtime) | Decided (ADR 0006) |
| Database / persistence | None selected; PostgreSQL is only a candidate (ADR 0008) | Open |
| Migrations / ORM | Not applicable unless ADR 0008 selects a store | Open |
| Hosting / runtime model | TBD | Sprint 11 |
| Auth | TBD | Sprint 8 |

## Planned integration — Sprint 7

| Concern | Choice | Status |
|---------|--------|--------|
| POS integration | Zoho POS behind server-only repository/mapper adapters (ADR 0009) | Planned; API details, quota, and fields unverified |
| Vendor isolation | Mini Mystiq contracts + anti-corruption mapping | Decided; ADR 0005 |

## Phase 3+

Payment, email, messaging, shipping, analytics, hosting, CI/CD: **TBD**.

## Explicitly out of current S4-T01

- Separate backend service code (none planned; ADR 0006)
- Database schema (no store selected; ADR 0008)
- Dummy API implementation
- Zoho integration
- Admin implementation
- Payment processing
