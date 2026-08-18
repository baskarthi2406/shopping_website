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

**Sprint 3 — Homepage + SEO**  
Status: **IN_PROGRESS** (S3-T01 … S3-T07 completed)

---

## Current Task

**S3-T08 — Organization Structured Data**  
Status: **NOT_STARTED**

Do not start S3-T08 automatically.

Details: `CURRENT_TASK.md` and `docs/sprints/SPRINT-03.md`.

There is **no S1-T09**. There is **no S2-T08**.

Original S3-T01 “SEO-Friendly URL Strategy” is **deferred** (not started).

---

## Overall Status

**SPRINT_3_IN_PROGRESS**

---

## Technology

### Frontend (Phase 1)

- Next.js 16.3.0 App Router (ADR 0002) — `frontend/app/` (no `src/`)
- React 19.2.8, TypeScript 5.9.3 (`strict: true`), Tailwind CSS 4.3.3
- ESLint 9.39.5 (`eslint-config-next` 16.3.0)
- Vitest 4.1.10 — `npm test` / `npm run test:watch`; colocate `*.test.ts`
- Option 1 design tokens + semantic shell (S1-T07)
- Static catalog: 12 approved products (S1-T05, expanded S2-T06, reviewed S2-T07)
- Category listing `/c/[slug]` (S2-T01; S2-T02 closed as already satisfied)
- Product detail `/p/[slug]` (S2-T03)
- Catalog nav + shared breadcrumbs (S2-T04)
- Listing filter/sort deferred (S2-T05; `docs/requirements/CATALOG_FILTER_SORT.md`)
- Option 1 homepage (S3-T01)
- Dynamic metadata for `/`, `/c/[slug]`, `/p/[slug]` (S3-T02)
- Canonical site origin / `metadataBase` via `NEXT_PUBLIC_SITE_URL` (S3-T03; production domain TBD)
- XML sitemap at `/sitemap.xml` from catalog repositories (S3-T04)
- `/robots.txt` allows the storefront and references the sitemap (S3-T05)
- Product JSON-LD on `/p/[slug]` (S3-T06; no invented offers/brand/reviews)
- BreadcrumbList JSON-LD on `/c/[slug]` and `/p/[slug]` (S3-T07)
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
- S2-T04 — Catalog Navigation and Breadcrumbs (UI)
- S2-T05 — Listing Filter/Sort (Placeholder) — **deferred**
- S2-T06 — Expand Static Catalog Fixtures
- S2-T07 — Catalog Review (**Sprint 2 COMPLETED**)
- S3-T01 — Homepage Storefront Implementation
- S3-T02 — Dynamic Metadata
- S3-T03 — Canonical Site URL and Metadata Base
- S3-T04 — XML Sitemap
- S3-T05 — robots.txt
- S3-T06 — Product Structured Data
- S3-T07 — Breadcrumb Structured Data

## In progress

- None. Do not start S3-T08 automatically.

## Pending

- S3-T08 — Organization Structured Data (next)
- Deferred original S3-T01 — SEO-Friendly URL Strategy (not started)
- Remainder of Sprint 3–11

## Blockers

- None for starting S3-T08 when explicitly requested.
- Business TBD: domain, legal entity, catalog taxonomy, vendors, Pigeon/Careers/character-print, navy/tan and several dress categories, dedicated category/hero lifestyle art, toys (no approved toy assets), pricing, UOM, variants, inventory display, brand-guide hex, WCAG/CWV numeric targets, listing filter/sort rules. Announcement/trust-bar copy is from Option 1; operations still TBD. Production canonical domain remains TBD — set `NEXT_PUBLIC_SITE_URL` before live deploy.

## Next task (do not start automatically)

**S3-T08 — Organization Structured Data**
