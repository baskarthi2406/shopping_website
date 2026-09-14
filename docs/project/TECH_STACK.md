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
| Dummy API | Runtime/transport TBD | Provider-independent contracts completed S4-T03; implementation S4-T04–S4-T06 |
| Testing tools | Vitest 4.1.10 (Node environment) | Decided S1-T06; colocate `*.test.ts` |
| Linting | ESLint 9.39.5 + `eslint-config-next` 16.3.0 | Reviewed S1-T06; keep Next Core Web Vitals + TypeScript |
| Formatting | No Prettier | Decided S1-T06 — avoid a second style tool; ESLint + editor defaults |

## Planned production backend — Sprint 6

| Concern | Choice | Status |
|---------|--------|--------|
| Language | Python | Decided; not started |
| API | FastAPI modular monolith (ADR 0003) | Decided; not started |
| Database | PostgreSQL | Decided; not started |
| Migrations | TBD | Sprint 5 |
| ORM / SQL layer | TBD | Sprint 5 |
| Auth | TBD | Sprint 8 |

## Planned integration — Sprint 7

| Concern | Choice | Status |
|---------|--------|--------|
| POS integration | Zoho POS behind repository/mapper adapters | Planned; API details TBD |
| Vendor isolation | Mini Mystiq contracts + anti-corruption mapping | Decided; ADR 0005 |

## Phase 3+

Payment, email, messaging, shipping, analytics, hosting, CI/CD: **TBD**.

## Explicitly out of current S4-T01

- FastAPI application code
- PostgreSQL schema
- Dummy API implementation
- Zoho integration
- Admin implementation
- Payment processing
