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

Do **not** implement provider integrations, persistence, Zoho integration,
auth, checkout, or payments unless the current task explicitly schedules them.

Phase 2 (Sprint 6 — Next.js Server-side Foundation) is **planned and awaiting
approval**; no Phase 2 implementation has started. ADR 0006 keeps UI and
server-side functionality in one Next.js application (no separate backend).

---

## Current Sprint

**Sprint 4 — Customer Storefront + Dummy API Foundation**
Status: **COMPLETED** (S4-T01–S4-T12 and fix S4-F01; review in
`docs/sprints/SPRINT-04.md` → S4-T12)

**Sprint 5 — Commerce UI** is **COMPLETED (Track A)**: S5-T01 planning, Track A
(S5-T02 Purchasability Rules, S5-T03 PDP Price & Availability Panel, S5-T04
Variant Selector), and the S5-T08 review are completed. Track B task ids
(S5-T05–S5-T07) stay **DEFERRED** as specified. A later owner request added a
separate browser cart and checkout review (`/cart`, `/checkout`) that does
not place a Zoho order and does not change `/demo`. A later owner
request also locked image fallback, variant selling prices, known stock
limits, and an explicit unresolved GST policy (no tax calculation).

**Sprint 6 — Next.js Server-side Foundation** is **IN PROGRESS**: S6-T01
planning, the S6-T02 Next.js-only revision, S6-T11 Server-only Boundary, and
S6-T12 Catalog Contract Conformance Suite are completed; S6-T03–S6-T10
(FastAPI/PostgreSQL) are withdrawn; S6-T13 Field Provenance Rules is
completed (gate G1 passed); S6-T14 Server-side Zoho Request Wrapper is
completed (gate G2 passed via ADR 0009 amendment); S6-T15 (Zoho feasibility)
is in progress — the Zoho demo (product → cart → checkout → draft Sales Order
`SO-00001`) works and is frozen at baseline `589b74a`, with production gaps in
`docs/project/PRODUCTION-READINESS.md`; Zoho → storefront category mapping is
partially implemented (`docs/project/CATEGORY-MAPPING-DESIGN.md`, high-confidence
rows only; remaining placements await owner decision OD-6); an interim
in-memory Zoho catalog snapshot (opt-in `CATALOG_PRODUCT_SOURCE=zoho-snapshot`,
ADR 0009 amendment) removes per-page Zoho reads; durable snapshot storage
awaits the hosting decision (`docs/project/HOSTING-SNAPSHOT-DECISION.md`,
OD-9); category → subcategory navigation audited (ancestor breadcrumbs and
subcategory links added); full Zoho catalog demo mode
(`CATALOG_PRODUCT_SOURCE=zoho-demo`: all 49 products incl. unmapped ones,
INR prices, server-side image proxy, `/catalog` view; demo only, production
rule unchanged); category listings stay direct membership and product
detail selects the real Zoho variant (SKU, price, availability); S6-T16 is proposed
(`docs/sprints/SPRINT-06.md`).

Sprint 3 is **MOSTLY_COMPLETE**: S3-T01–S3-T09 completed; S3-T10 Image
Optimization intentionally deferred.

---

## Current Task

None. S6-T14 (Server-side Zoho Request Wrapper) is **COMPLETED**. The S6-T15
Zoho demo is complete and frozen at `589b74a`. No further task is approved; do
not start production work, payment, Sprint 7, package installs, persistence,
Zoho writes, or any other task automatically.

Details: `CURRENT_TASK.md` and `docs/sprints/SPRINT-06.md`.

There is **no S1-T09**. There is **no S2-T08**.

S3-T10 Image Optimization and original S3-T01 “SEO-Friendly URL Strategy” are
**deferred**.

---

## Overall Status

**SPRINT_6_IN_PROGRESS** (Sprint 5 completed for Track A; S6-T01, S6-T02, S6-T11–S6-T14 completed; S6-T15 Zoho feasibility in progress — demo product → cart → checkout → draft Zoho Sales Order works, see `docs/project/DEMO-ZOHO-SALES-ORDER.md`)

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
  repositories (S4-T09); dummy routes and sitemap keep the static backing store
- Layout and footer catalog navigation consume the same dummy category API
  through `catalog.listCategories()` (S4-T11); sitemap remains on
  `catalogSource`
- Unknown `/c/{slug}` and `/p/{slug}` return HTTP 404 in production (S4-F01):
  segment layouts resolve slugs before loading boundaries; verified with
  `npm run build && npm run test:http`
- Technical-debt register: `docs/project/TECHNICAL_DEBT.md`
- Pure purchase-eligibility rule `evaluatePurchasability` with stable reason
  codes (S5-T02); all current products are not purchasable
  (`price_missing`, `inventory_unknown`)
- PDP price & availability panel (S5-T03): “Price not available” /
  “Availability not confirmed” for today's catalog, plus a `tel:` link to the
  verified store phone. Prices render only when `config/commerce.ts`
  `priceDisplay` is approved (currently `null`, Q9). No purchase controls; no
  JSON-LD `offers`
- PDP variant selector (S5-T04): native radio groups rendered only for real,
  selectable variants; switches precomputed per-variant commerce; no
  auto-selection or parent price/stock fallback. No current product has
  variants, so no selector renders today
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
- Sprint 6: Next.js server-side foundations (ADR 0006 supersedes the FastAPI
  + PostgreSQL plan of ADR 0003; no database selected, ADR 0008)
- Sprint 7: server-only Zoho POS adapter behind repository interfaces
  (ADR 0005, ADR 0009)
- Read-only dummy category, product collection, and product detail routes
  implemented in Next.js; no provider integration exists

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
- S4-T11 — API-driven Navigation
- S4-F01 — Production Soft-404 Correction
- S4-T12 — Sprint Review (**Sprint 4 COMPLETED**)
- S5-T01 — Sprint 5 Planning & Specification
- S5-T02 — Purchasability Rules
- S5-T03 — PDP Price & Availability Panel
- S5-T04 — Variant Attribute Selector
- S5-T08 — Sprint 5 Review (**Sprint 5 COMPLETED, Track A**)
- S6-T01 — Sprint 6 Planning (task sequence later withdrawn)
- S6-T02 — Revise Sprint 6 for a Next.js-only Architecture
- S6-T11 — Server-only Boundary and Secret Isolation
- S6-T12 — Catalog Contract Conformance Suite
- S6-T13 — Field Provenance Rules
- S6-T14 — Server-side Zoho Request Wrapper

## In progress

- None.

## Pending
- Sprint 5 Track B — S5-T05–S5-T07 (local cart) **DEFERRED**, pending renewed
  Q1/Q2 approval; open business questions in `docs/sprints/SPRINT-05.md`
- Sprint 6 — Next.js Server-side Foundation: proposed S6-T15, S6-T16, each
  requiring explicit approval (gates in `docs/sprints/SPRINT-06.md` §6)
- Sprint 7 — Zoho POS Integration
- Sprint 8 — Orders, Checkout & Operations
- S3-T10 — Image Optimization (**DEFERRED**)
- Original S3-T01 — SEO-Friendly URL Strategy (**DEFERRED**)
- Sprints 9–11 remain future plans

## Blockers

- No code blocker. Open technical debt (TD-002–TD-011):
  `docs/project/TECHNICAL_DEBT.md`. TD-010: a Zoho allowance of 7,500
  requests/month is a future constraint whose actual account limits are
  unverified. TD-011: homepage service claims (secure checkout, free
  shipping, COD, returns, 24/7 support) need business confirmation.
- Zoho POS access verified for the demo (S6-T15): OAuth, catalog reads, and
  one draft Sales Order. Production gaps (tax, location stock, images,
  customers, order confirmation, persistent idempotency, categories, request
  limits) are open: `docs/project/PRODUCTION-READINESS.md`.
- Field-level data ownership is undecided (ADR 0007, Proposed). Persistence is
  not selected (ADR 0008, Proposed). Provider access policy is proposed
  (ADR 0009). Hosting/runtime model, public exposure of `/api/*` in
  production, and CI vendor are undecided (`SPRINT-06.md` §8).
- Reference-storefront (`minimystiq.zakyastore.in`) inspection **not
  completed**; no observations recorded.
- Local `main` is still at the initial commit; Sprint 3–5 work is on unmerged,
  mostly unpushed stacked branches. Integration needs a human decision.
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

None approved. The S6-T15 Zoho demo is frozen at `589b74a`; candidate next
work is the P0 backlog in `docs/project/PRODUCTION-READINESS.md`, each item
requiring an explicit task. The P0 decision gate
(`docs/project/PRODUCTION-DECISIONS.md`) awaits owner decisions OD-1–OD-9 and
Zoho verifications V1–V11. The decision on
merging Sprints 3–5 into `main` (D12) remains open. Sprint 5 Track B task ids
remain deferred. The owner-requested browser cart and checkout review is
done and does not place orders. Image fallback, variant price and stock
consistency, and the unresolved GST note are in place; no tax is
calculated. Requires explicit human approval.
