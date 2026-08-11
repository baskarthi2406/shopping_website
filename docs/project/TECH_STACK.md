# Technology Stack

## Phase 1 — Storefront

| Concern | Choice | Status |
|---------|--------|--------|
| Framework | Next.js 16.3.0 App Router | Decided; initialized in `frontend/` (S1-T03) |
| UI | React 19.2.8 | Decided |
| Language | TypeScript 5.9.3 (`strict: true`) | Decided |
| Styling | Tailwind CSS 4.3.3 | Decided |
| Storefront UX | Mobile-first (Mobile → Tablet → Desktop) | Decided; breakpoint px TBD |
| Brand | Mini Mystiq | Decided |
| Homepage UI | Design Option 1 (top-left of `mini-mystiq-app-design-suggestions.png`) | **Finalized** — `DESIGN_OPTION_1.md` |
| Visual assets | `public/` (logo + product/promo photos) | Approved; inventory in `DESIGN_ASSETS.md` |
| Image pipeline | Next.js Image | In use for the approved logo (`frontend/public/mini-mystiq-logo.png`) |
| Routing | App Router at `frontend/app/` (no `src/`) | Decided (ADR 0002); S1-T03 |
| Data | Static/mock repositories | Decided for Phase 1; not implemented until S1-T05 |
| Testing tools | TBD | Decide in S1-T06 |
| Linting | ESLint 9.39.5 + `eslint-config-next` 16.3.0 | Scaffolded in S1-T03; remaining lint/format policy is S1-T06 |
| Formatting | TBD | Decide in S1-T06 |

## Phase 2 — Backend

| Concern | Choice | Status |
|---------|--------|--------|
| Language | Python | Decided; not started |
| API | FastAPI modular monolith (ADR 0003) | Decided; not started |
| Database | PostgreSQL | Decided; not started |
| Migrations | TBD | Sprint 5 |
| ORM / SQL layer | TBD | Sprint 5 |
| Auth | TBD | Sprint 8 |

## Phase 3+

Payment, email, messaging, shipping, analytics, hosting, CI/CD: **TBD**.

## Explicitly out of Phase 1

- FastAPI application code
- PostgreSQL schema
- Admin implementation
- Payment processing
