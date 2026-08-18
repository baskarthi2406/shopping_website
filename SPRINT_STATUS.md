# Sprint Status

Live sprint and task index. Detailed specifications live in `docs/sprints/`.  
Do not mark future tasks completed. Do not start a task that is not in `CURRENT_TASK.md`.

---

## How to read this file

- Sprint status: `NOT_STARTED` | `IN_PROGRESS` | `COMPLETED`
- Task status: `NOT_STARTED` | `IN_PROGRESS` | `COMPLETED` | `BLOCKED`
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

### Sprint 3 — Homepage + SEO

| Field | Value |
|-------|--------|
| Phase | Phase 1 |
| Objective | Option 1 homepage, then first-class SEO: URLs, metadata, sitemap, robots, structured data, OG, images, internal linking |
| Status | **IN_PROGRESS** |
| Dependencies | Sprint 2 completed |
| Task IDs | S3-T01 … S3-T11 |

| Task ID | Name | Status |
|---------|------|--------|
| S3-T01 | Homepage Storefront Implementation | **COMPLETED** |
| S3-T02 | Dynamic Metadata | **COMPLETED** |
| S3-T03 | Canonical Site URL and Metadata Base | **COMPLETED** |
| S3-T04 | XML Sitemap | **COMPLETED** |
| S3-T05 | robots.txt | **NOT_STARTED** |

Original “SEO-Friendly URL Strategy” was reordered out of S3-T01 and remains **NOT_STARTED** (deferred in `docs/sprints/SPRINT-03.md`). Do not start S3-T05 automatically.

### Sprint 4 — Cart & Storefront Completion

| Field | Value |
|-------|--------|
| Phase | Phase 1 |
| Objective | Client-side cart, storefront completion, Phase 1 review. No payments. |
| Status | **NOT_STARTED** |
| Dependencies | Sprint 3 completed |
| Task IDs | S4-T01 … S4-T07 |

### Sprint 5 — FastAPI Backend Foundation

| Field | Value |
|-------|--------|
| Phase | Phase 2 — Backend + Admin |
| Objective | FastAPI app, PostgreSQL, backend layers, API contract, frontend API repository adapter |
| Status | **NOT_STARTED** |
| Dependencies | Sprint 4 completed |
| Task IDs | S5-T01 … S5-T06 |

### Sprint 6 — Products + Categories + UOM + Admin

| Field | Value |
|-------|--------|
| Phase | Phase 2 |
| Objective | Product/category/UOM APIs and corresponding admin modules |
| Status | **NOT_STARTED** |
| Dependencies | Sprint 5 completed |
| Task IDs | S6-T01 … S6-T08 |

### Sprint 7 — Inventory + Cart + Orders

| Field | Value |
|-------|--------|
| Phase | Phase 2 |
| Objective | Inventory, persisted cart, orders; admin inventory/orders; storefront integration |
| Status | **NOT_STARTED** |
| Dependencies | Sprint 6 completed |
| Task IDs | S7-T01 … S7-T06 |

### Sprint 8 — Customers + Authentication + RBAC + Audit

| Field | Value |
|-------|--------|
| Phase | Phase 2 |
| Objective | Customers, auth, RBAC, audit logs, related admin |
| Status | **NOT_STARTED** |
| Dependencies | Sprint 7 completed |
| Task IDs | S8-T01 … S8-T07 |

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
