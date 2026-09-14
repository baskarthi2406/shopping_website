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

**Phase 1 — Customer Storefront + Dummy API Foundation**

Do **not** implement the production backend, Zoho integration, auth, checkout,
or payments unless the current task explicitly schedules them.

---

## Current Sprint

**Sprint 4 — Customer Storefront + Dummy API Foundation**
Status: **IN_PROGRESS** (S4-T01–S4-T10C completed)

Sprint 3 is **MOSTLY_COMPLETE**: S3-T01–S3-T09 completed; S3-T10 Image
Optimization intentionally deferred.

---

## Current Task

**S4-T11 — API-driven Navigation**
Status: **NOT_STARTED**

Do not start S4-T11 automatically.

Details: `CURRENT_TASK.md` and `docs/sprints/SPRINT-04.md`.

There is **no S1-T09**. There is **no S2-T08**.

S3-T10 Image Optimization and original S3-T01 “SEO-Friendly URL Strategy” are
**deferred**.

---

## Overall Status

**SPRINT_4_IN_PROGRESS**

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
- Customer-reference hierarchical category model and prominent responsive
  navigation (S4-T02); Search, Account, Cart, and Track Your Order are disabled
  visual entry points only
- Stable provider-independent catalog domain/application contracts (S4-T03);
  recursive categories, product summaries/details, generic variants, nullable
  commerce data, pagination, and error envelopes
- Force-static dummy category API at `GET /api/categories` (S4-T04)
- Paginated dummy product-summary API at `GET /api/products` (S4-T05), with
  deterministic page/pageSize behavior and safe errors
- Dummy product-detail API at `GET /api/products/[slug]` (S4-T06); lookup is by
  public SEO slug and unknown slugs return `not_found`
- Generic variant attribute/value model (S4-T07); current fixtures keep
  `variants: []` and do not invent size/color values
- Provider-independent pricing/inventory invariants (S4-T08); money remains a
  major-unit amount plus currency, compare-at is nullable, inventory null ≠ 0,
  and current fixtures keep commerce values unknown
- Storefront pages consume dummy category/product APIs through HTTP
  repositories (S4-T09); dummy routes/sitemap/nav keep the static backing store
- Loading, sanitized catalog errors, not-found, and empty collection states
  (S4-T10); null pricing/inventory/variants remain valid product data
- Storefront footer polish (S4-T10A): brand, category-derived Shop/Collections,
  verified contact/`tel:` link, existing service claims, and copyright; header
  and catalog architecture unchanged
- Classic-modern visual refinement (S4-T10A): warmed tokens, self-hosted
  display/UI fonts, boutique mega-menu, card/CTA hover, homepage rhythm
- Mega-menu boutique refinement (S4-T10B): cream panel, primary accent line,
  hover/focus child rows, stronger View all; navigation data unchanged
- Final mega-menu visual refinement (S4-T10C): content-aligned panel, tighter
  boutique spacing, balanced 3-column grid, refined hover/focus/View all;
  mega-menu visual design frozen; navigation data unchanged
- Listing filter/sort deferred (S2-T05; `docs/requirements/CATALOG_FILTER_SORT.md`)
- Option 1 homepage (S3-T01)
- Dynamic metadata for `/`, `/c/[slug]`, `/p/[slug]` (S3-T02)
- Canonical site origin / `metadataBase` via `NEXT_PUBLIC_SITE_URL` (S3-T03; production domain TBD)
- XML sitemap at `/sitemap.xml` from catalog repositories (S3-T04)
- `/robots.txt` allows the storefront and references the sitemap (S3-T05)
- Product JSON-LD on `/p/[slug]` (S3-T06; no invented offers/brand/reviews)
- BreadcrumbList JSON-LD on `/c/[slug]` and `/p/[slug]` (S3-T07)
- Organization JSON-LD from the root layout (S3-T08; no invented legalName)
- OpenGraph reviewed (S3-T09; already present from S3-T02/S3-T03)
- Layer contract: `docs/architecture/FRONTEND_ARCHITECTURE.md`

### API/backend roadmap

- Sprint 4: stable Mini Mystiq API/domain contracts and dummy catalog APIs
- Sprint 6: production backend (planned FastAPI modular monolith + PostgreSQL;
  ADR 0003)
- Sprint 7: Zoho POS adapter behind repository interfaces (ADR 0005)
- Read-only dummy category, product collection, and product detail routes
  implemented in Next.js; no production backend implementation exists

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
- S3-T08 — Organization Structured Data
- S3-T09 — OpenGraph
- S4-T01 — Backend/API Audit & Cleanup (no obsolete implementation found)
- S4-T02 — Customer Navigation & Hierarchical Category UI
- S4-T03 — API/Domain Contracts
- S4-T04 — Dummy Category API
- S4-T05 — Dummy Product API
- S4-T06 — Dummy Product Detail API
- S4-T07 — Variant/Size/Color Model
- S4-T08 — Pricing/Inventory Model
- S4-T09 — Connect UI to Dummy API
- S4-T10 — Loading/Error/Empty States
- S4-T10A — Classic-Modern Storefront UI Polish
- S4-T10B — Refine Mega Menu Boutique UI
- S4-T10C — Final Mega Menu Visual Refinement

## In progress

- None. Do not start S4-T11 automatically.

## Pending

- S4-T11 — API-driven Navigation (next)
- S4-T12 — Sprint Review
- Sprint 5 — Commerce UI
- Sprint 6 — Production Backend
- Sprint 7 — Zoho POS Integration
- Sprint 8 — Orders, Checkout & Operations
- S3-T10 — Image Optimization (**DEFERRED**)
- Original S3-T01 — SEO-Friendly URL Strategy (**DEFERRED**)
- Sprints 9–11 remain future plans

## Blockers

- None for starting S4-T11 when explicitly requested.
- Business/API TBD: taxonomy beyond the supplied S4-T02 reference,
  descendant-listing semantics, API menu-order field, Zoho API access/schema/
  auth/rate limits, future product filters/search,
  pricing/currency/tax values, SKU/UOM/variant/inventory source data,
  search behavior, account/auth, cart, Track Your Order,
  checkout/operations, production domain, and deployment.
- Existing business/asset TBDs remain: legal entity, Pigeon/Careers/
  character-print, several dress categories, dedicated category/hero art, toys,
  brand-guide hex, WCAG/CWV targets, and filter/sort rules.

## Next task (do not start automatically)

**S4-T11 — API-driven Navigation**
