# Technology Stack

## Phase 1 — Storefront

| Concern | Choice | Status |
|---------|--------|--------|
| Framework | Next.js | Decided; not initialized |
| UI | React | Decided |
| Language | TypeScript | Decided |
| Styling | Tailwind CSS | Decided |
| Storefront UX | Mobile-first (Mobile → Tablet → Desktop) | Decided; breakpoint px TBD |
| Brand | Mini Mystiq | Decided |
| Homepage UI | Design Option 1 (top-left of `mini-mystiq-app-design-suggestions.png`) | **Finalized** — `DESIGN_OPTION_1.md` |
| Visual assets | `public/` (logo + product/promo photos) | Approved; inventory in `DESIGN_ASSETS.md` |
| Image pipeline | Next.js Image | When S1-T03 initializes the app |
| Routing | App Router | Proposed; confirm in S1-T01 / ADR if needed |
| Data | Static/mock repositories | Decided for Phase 1 |
| Testing tools | TBD | Decide in S1-T06 |
| Linting/formatting | TBD | Decide in S1-T06 |

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
