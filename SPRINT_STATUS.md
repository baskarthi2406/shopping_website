# Sprint Status

Live sprint and task index. Detailed specifications live in `docs/sprints/`.  
Do not mark future tasks completed. Do not start a task that is not in `CURRENT_TASK.md`.

---

## How to read this file

- Sprint status: `NOT_STARTED` | `PLANNED — AWAITING APPROVAL` | `IN_PROGRESS` | `COMPLETED`
- Task status: `NOT_STARTED` | `PROPOSED` | `IN_PROGRESS` | `COMPLETED` | `BLOCKED` | `DEFERRED`
- Only one task may be `IN_PROGRESS`.

---

## S0 — Project Control

| Field | Value |
|-------|--------|
| Phase | Bootstrap (before Phase 1 implementation) |
| Objective | Create project-control and documentation foundation |
| Status | **COMPLETED** |
| Dependencies | None |
| Task IDs | S0-T01 |

| Task ID | Name | Status |
|---------|------|--------|
| S0-T01 | Initialize Project-Control Documentation | **COMPLETED** |

---

## Sprint 1 — Foundation & Architecture

| Field | Value |
|-------|--------|
| Phase | Phase 1 — SEO-First Storefront |
| Objective | Document architecture and scaffold the Next.js storefront with clean layering, mock repositories, and mobile-first UX |
| Status | **COMPLETED** |
| Dependencies | S0-T01 completed |
| Task IDs | S1-T01 … S1-T08 |

| Task ID | Name | Status |
|---------|------|--------|
| S1-T01 | Document Target Architecture | **COMPLETED** |
| S1-T02 | Document Frontend Layer Boundaries | **COMPLETED** |
| S1-T03 | Initialize Next.js + TypeScript + Tailwind | **COMPLETED** |
| S1-T04 | Establish Frontend Project Structure | **COMPLETED** |
| S1-T05 | Repository Interfaces and Static Data Source | **COMPLETED** |
| S1-T06 | Configure Linting and Unit Tests | **COMPLETED** |
| S1-T07 | Base Layout, Tokens, Semantic HTML Shell | **COMPLETED** |
| S1-T08 | Foundation Review and Documentation Sync | **COMPLETED** |

Sprint 1 is complete. There is no S1-T09.

---

## Sprint 2 — Product Catalog

| Field | Value |
|-------|--------|
| Phase | Phase 1 — SEO-First Storefront |
| Objective | Crawlable category and product listing/detail experience on mock data |
| Status | **COMPLETED** |
| Dependencies | Sprint 1 completed |
| Task IDs | S2-T01 … S2-T07 |

| Task ID | Name | Status |
|---------|------|--------|
| S2-T01 | Category Listing Page | **COMPLETED** |
| S2-T02 | Category Product Listing Page | **COMPLETED** |
| S2-T03 | Product Detail Page | **COMPLETED** |
| S2-T04 | Catalog Navigation and Breadcrumbs (UI) | **COMPLETED** |
| S2-T05 | Listing Filter/Sort (Placeholder) | **COMPLETED** (deferred) |
| S2-T06 | Expand Static Catalog Fixtures | **COMPLETED** |
| S2-T07 | Catalog Review | **COMPLETED** |

S2-T01 delivered `/c/[slug]`. S2-T02 is complete with no duplicate route. S2-T03 delivered `/p/[slug]`. S2-T04 delivered catalog nav and shared breadcrumbs. S2-T05 deferred filter/sort. S2-T06 expanded the static catalog to 12 approved products. S2-T07 reviewed the catalog (pass; no data changes). There is no S2-T08.

---

## Planned roadmap

### Sprint 2 — Product Catalog

See the live Sprint 2 section above. Status: **COMPLETED**.

### Sprint 3 — Storefront + SEO

| Field | Value |
|-------|--------|
| Phase | Phase 1 |
| Objective | Option 1 homepage, then first-class SEO: URLs, metadata, sitemap, robots, structured data, OG, images, internal linking |
| Status | **MOSTLY_COMPLETE** |
| Dependencies | Sprint 2 completed |
| Task IDs | S3-T01 … S3-T11 |

| Task ID | Name | Status |
|---------|------|--------|
| S3-T01 | Homepage Storefront Implementation | **COMPLETED** |
| S3-T02 | Dynamic Metadata | **COMPLETED** |
| S3-T03 | Canonical Site URL and Metadata Base | **COMPLETED** |
| S3-T04 | XML Sitemap | **COMPLETED** |
| S3-T05 | robots.txt | **COMPLETED** |
| S3-T06 | Product Structured Data | **COMPLETED** |
| S3-T07 | Breadcrumb Structured Data | **COMPLETED** |
| S3-T08 | Organization Structured Data | **COMPLETED** |
| S3-T09 | OpenGraph | **COMPLETED** |
| S3-T10 | Image Optimization | **DEFERRED** |
| S3-T11 | Internal Linking and SEO Review | **DEFERRED** (review moved to S4-T12) |

S3-T01–S3-T09 are complete. S3-T10 Image Optimization is intentionally
**DEFERRED**; S3-T11 review scope moved to S4-T12. Customer navigation/header
alignment continues in Sprint 4. Original “SEO-Friendly URL Strategy” remains
deferred.

### Sprint 4 — Customer Storefront + Dummy API Foundation

| Field | Value |
|-------|--------|
| Phase | Phase 1 — Storefront + Dummy API |
| Objective | Customer navigation, stable API/domain contracts, dummy catalog APIs, and API-driven storefront |
| Status | **COMPLETED** |
| Dependencies | S3-T01–S3-T09 completed; S3-T10 deferred |
| Task IDs | S4-T01 … S4-T12 (including S4-T10A, S4-T10B, S4-T10C) and fix S4-F01 |

| Task ID | Name | Status |
|---------|------|--------|
| S4-T01 | Backend/API Audit & Cleanup | **COMPLETED** |
| S4-T02 | Customer Navigation & Hierarchical Category UI | **COMPLETED** |
| S4-T03 | API/Domain Contracts | **COMPLETED** |
| S4-T04 | Dummy Category API | **COMPLETED** |
| S4-T05 | Dummy Product API | **COMPLETED** |
| S4-T06 | Dummy Product Detail API | **COMPLETED** |
| S4-T07 | Variant/Size/Color Model | **COMPLETED** |
| S4-T08 | Pricing/Inventory Model | **COMPLETED** |
| S4-T09 | Connect UI to Dummy API | **COMPLETED** |
| S4-T10 | Loading/Error/Empty States | **COMPLETED** |
| S4-T10A | Classic-Modern Storefront UI Polish | **COMPLETED** |
| S4-T10B | Refine Mega Menu Boutique UI | **COMPLETED** |
| S4-T10C | Final Mega Menu Visual Refinement | **COMPLETED** |
| S4-T11 | API-driven Navigation | **COMPLETED** |
| S4-F01 | Production Soft-404 Correction | **COMPLETED** |
| S4-T12 | Sprint Review | **COMPLETED** |

Sprint 4 is complete. S4-F01 corrected the S4-T10 soft-404 defect found in
review. Reference-storefront inspection and Zoho data verification were not
completed; open debt is in `docs/project/TECHNICAL_DEBT.md`. Sprint 5 task IDs
must be written and approved before Sprint 5 starts.

### Sprint 5 — Commerce UI

| Field | Value |
|-------|--------|
| Phase | Phase 1 — Customer Storefront |
| Objective | Commerce-ready storefront behavior on the nullable catalog without implying orders, payment, reservation, or fulfillment |
| Status | **COMPLETED (Track A)** — closed by S5-T08; Track B (S5-T05–S5-T07) DEFERRED, not implemented |
| Dependencies | Sprint 4 completed |
| Task IDs | S5-T01 … S5-T08 |

| Task ID | Name | Status |
|---------|------|--------|
| S5-T01 | Sprint 5 Planning & Specification | **COMPLETED** |
| S5-T02 | Purchasability Rules (Track A) | **COMPLETED** |
| S5-T03 | PDP Price & Availability Panel (Track A) | **COMPLETED** |
| S5-T04 | Variant Attribute Selector (Track A) | **COMPLETED** |
| S5-T05 | Local Cart Model & Persistence Boundary (Track B) | **DEFERRED** (not implemented; requires Q1/Q2) |
| S5-T06 | Add-to-Cart & Quantity Control (Track B) | **DEFERRED** (not implemented; requires Q1/Q3/Q5) |
| S5-T07 | Cart Page & Checkout-Unavailable State (Track B) | **DEFERRED** (not implemented; requires Q1/Q4) |
| S5-T08 | Sprint 5 Review | **COMPLETED** |

Sprint 5 is closed for Track A (S5-T01–S5-T04, review S5-T08). Track B is
deferred pending renewed Q1/Q2 approval; its IDs stay reserved. Q3 and Q8 are
resolved; Q4 is partly resolved. Q9 is open, so no price renders
(`config/commerce.ts`). Search, listing-card prices, Account, and Track Your
Order are deferred. The review added TD-010 (unverified Zoho allowance of 7,500
requests/month) and TD-011 (homepage service claims need business
confirmation).

### Sprint 6 — Production Backend

| Field | Value |
|-------|--------|
| Phase | Phase 2 — Production Backend |
| Objective | Production Mini Mystiq API, persistence, and operational foundation |
| Status | **NOT_STARTED** |
| Dependencies | Sprint 5 completed |
| Task IDs | TBD before Sprint 6 starts |

### Sprint 7 — Zoho POS Integration

| Field | Value |
|-------|--------|
| Phase | Phase 2 — External Integration |
| Objective | Zoho POS repository/adapter integration behind stable Mini Mystiq contracts |
| Status | **NOT_STARTED** |
| Dependencies | Sprint 6 completed |
| Task IDs | TBD before Sprint 7 starts |

### Sprint 8 — Orders, Checkout & Operations

| Field | Value |
|-------|--------|
| Phase | Phase 2 — Orders & Operations |
| Objective | Approved order, checkout, account/auth, and operational workflows |
| Status | **NOT_STARTED** |
| Dependencies | Sprint 7 completed |
| Task IDs | TBD before Sprint 8 starts |

### Sprint 9 — Payment + Email + Messaging + Shipping

| Field | Value |
|-------|--------|
| Phase | Phase 3 — Commerce |
| Objective | Payment, email, messaging, shipping integrations (vendors TBD) |
| Status | **NOT_STARTED** |
| Dependencies | Sprint 8 completed |
| Task IDs | S9-T01 … S9-T06 |

### Sprint 10 — Customer Segmentation + Campaigns + Analytics

| Field | Value |
|-------|--------|
| Phase | Phase 4 — Digital Marketing |
| Objective | Segmentation, campaigns, analytics (approach TBD) |
| Status | **NOT_STARTED** |
| Dependencies | Sprint 9 completed |
| Task IDs | S10-T01 … S10-T04 |

### Sprint 11 — Production Readiness + Deployment

| Field | Value |
|-------|--------|
| Phase | Phase 5 — Production |
| Objective | Security, performance, accessibility, deployment, production checklist |
| Status | **NOT_STARTED** |
| Dependencies | Sprint 10 completed |
| Task IDs | S11-T01 … S11-T06 |

---

## Notes

- Admin UI modules are planned in `docs/requirements/ADMIN_REQUIREMENTS.md`. Implementation starts in Phase 2.
- Storefront is mobile-first (`docs/requirements/MOBILE_REQUIREMENTS.md`). Admin may prioritize desktop but must stay responsive.
- Homepage visual design: Option 1 finalized (`docs/project/DESIGN_OPTION_1.md`).
- Vendor, brand, and policy decisions are **TBD**.
