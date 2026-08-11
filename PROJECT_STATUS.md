# Project Status

This file is the live index of project state. A new AI session must read it after `PROJECT_DEVELOPMENT_RULES.md` and must not infer state from prior chat history.

---

## How to determine current state

1. Read **Current Phase**, **Current Sprint**, and **Current Task** below.
2. Read `SPRINT_STATUS.md` for task-level statuses.
3. Read `CURRENT_TASK.md` for the single task that may be implemented.
4. Read `docs/sprints/` for the full task specification.
5. If these files disagree, stop and report the conflict. Do not guess.

---

## Project

**Name:** Mini Mystiq — Baby Clothes & Toys E-Commerce  
**Repository:** `shopping`

---

## Current Phase

**Phase 1 — SEO-First Storefront**

Do **not** implement FastAPI, PostgreSQL, or admin during this phase.

---

## Current Sprint

**Sprint 2 — Product Catalog**  
Status: **IN_PROGRESS** (S2-T01 … S2-T03 completed)

---

## Current Task

**S2-T04 — Catalog Navigation and Breadcrumbs (UI)**  
Status: **NOT_STARTED**

Do not start S2-T04 automatically. Category and product pages already have simple breadcrumbs.

Details: `CURRENT_TASK.md` and `docs/sprints/SPRINT-02.md`.

There is **no S1-T09**.

---

## Overall Status

**SPRINT_2_IN_PROGRESS**

---

## Technology

### Frontend (Phase 1)

- Next.js 16.3.0 App Router (ADR 0002) — `frontend/app/` (no `src/`)
- React 19.2.8, TypeScript 5.9.3 (`strict: true`), Tailwind CSS 4.3.3
- ESLint 9.39.5 (`eslint-config-next` 16.3.0)
- Vitest 4.1.10 — `npm test` / `npm run test:watch`; colocate `*.test.ts`
- Option 1 design tokens + semantic shell (S1-T07)
- Static catalog (S1-T05): `config/catalog.ts` → ports → `Static*Repository`
- Category listing `/c/[slug]` (S2-T01; S2-T02 closed as already satisfied)
- Product detail `/p/[slug]` (S2-T03)
- Layer contract: `docs/architecture/FRONTEND_ARCHITECTURE.md`

### Backend (Phase 2 — not started)

- Python, FastAPI modular monolith (ADR 0003), PostgreSQL

---

## Completed work

- S0-T01 — Initialize Project-Control Documentation
- S1-T01 … S1-T08 — Sprint 1 Foundation & Architecture (**COMPLETED**)
- S2-T01 — Category Listing Page
- S2-T02 — Category Product Listing Page (satisfied by S2-T01; no duplicate route)
- S2-T03 — Product Detail Page

## In progress

- None. Do not start S2-T04 automatically.

## Pending

- S2-T04 — Catalog Navigation and Breadcrumbs (UI) (next)
- Remainder of Sprint 2–11

## Blockers

- None for starting S2-T04 when explicitly requested.
- Business TBD: domain, legal entity, catalog taxonomy, vendors, Pigeon/Careers/character-print, navy/tan category, dedicated category/hero lifestyle art, pricing, UOM, variants, inventory display, brand-guide hex, WCAG/CWV numeric targets.

## Next task (do not start automatically)

**S2-T04 — Catalog Navigation and Breadcrumbs (UI)**
