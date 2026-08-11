# Sprint 2 — Product Catalog

| Field | Value |
|-------|--------|
| Sprint ID | S2 |
| Phase | Phase 1 — SEO-First Storefront |
| Objective | Crawlable category and product listing/detail experience on mock data |
| Status | NOT_STARTED |
| Dependencies | Sprint 1 completed |

Business taxonomy, copy, and pricing rules are **TBD**. Use placeholder catalog data.

---

## S2-T01 — Category Listing Page

**Status:** NOT_STARTED

### Objective

Render a crawlable list of categories from the category repository.

### Dependencies

S1-T05, S1-T07.

### Requirements

Server-rendered HTML; thin page file; semantic lists/headings.

### Implementation scope

Category index route + application query. No filters beyond what mock data supports.

### Expected files/modules

- Category page route
- Application query `listCategories`
- Presentational category list component

### Acceptance criteria

- Categories from the repository appear in HTML
- Internal links to category pages (S2-T02 may land URLs)
- No FastAPI

### Testing requirements

Unit test the query; page uses the query (not fixtures directly).

### Definition of Done

Page works on mock data; status updated.

---

## S2-T02 — Category Product Listing Page

**Status:** NOT_STARTED

### Objective

Show products for a category slug via the product repository.

### Dependencies

S2-T01.

### Requirements

Crawlable listing; 404 for unknown slug. URL pattern follows current architecture (final SEO URLs may be adjusted in S3-T01).

### Implementation scope

Dynamic category route, listing UI, not-found handling.

### Expected files/modules

- Dynamic category route
- `listProductsByCategory` (or equivalent) use case

### Acceptance criteria

- Products for the category render in HTML
- Empty category is handled without crashing
- Unknown slug is a not-found response

### Testing requirements

Use-case tests with mock repo; listing does not call infrastructure directly.

### Definition of Done

Category listing complete on mock data.

---

## S2-T03 — Product Detail Page

**Status:** NOT_STARTED

### Objective

Crawlable product detail by slug/id as documented.

### Dependencies

S2-T02.

### Requirements

Semantic product content (name, description, image placeholders). Variant/stock rules **TBD** — omit or show placeholder fields only if present on the type.

### Implementation scope

Product detail route + `getProduct` use case. No cart button required until Sprint 4 (a disabled placeholder is optional, not required).

### Expected files/modules

- Product detail route
- Product detail presentational component
- `getProduct` use case

### Acceptance criteria

- Product fields from repository render in HTML
- Unknown product is not-found
- No payment or backend

### Testing requirements

Use-case tests for found/not-found.

### Definition of Done

PDP works on mock data.

---

## S2-T04 — Catalog Navigation and Breadcrumbs (UI)

**Status:** NOT_STARTED

### Objective

Add visible breadcrumbs and catalog nav links (structured data is Sprint 3).

### Dependencies

S2-T03.

### Requirements

Semantic breadcrumb navigation; internal links between home, category, product.

### Implementation scope

Breadcrumb component wired on catalog routes.

### Expected files/modules

- Breadcrumb UI component
- Integration on category and product pages

### Acceptance criteria

- Users can navigate category → product → parent category via links
- Breadcrumbs are in HTML (not canvas/images)

### Testing requirements

Component or unit test for crumb trail construction from domain data.

### Definition of Done

UI breadcrumbs shipped; JSON-LD left to Sprint 3.

---

## S2-T05 — Listing Filter/Sort (Placeholder)

**Status:** NOT_STARTED

### Objective

Add only filter/sort behavior that is decided. If business rules are TBD, implement a minimal sort (e.g. name) **or** document that filters are deferred — do not invent faceted search.

### Dependencies

S2-T02.

### Requirements

Do not silently invent taxonomy facets. Prefer TBD + one documented simple sort if needed for UI completeness.

### Implementation scope

Either: documented simple sort on listings, or a short requirements note that S2-T05 is deferred with status BLOCKED/TBD recorded in status files.

### Expected files/modules

- Listing query parameters **or** `docs/requirements/` note + sprint status BLOCKED

### Acceptance criteria

- No fake “brand” or “age” filters unless types already include those fields
- Behavior documented

### Testing requirements

If implemented, unit tests for sort. If deferred, documentation-only review.

### Definition of Done

Either minimal sort exists or deferral is explicit in status/docs.

---

## S2-T06 — Expand Static Catalog Fixtures

**Status:** NOT_STARTED

### Objective

Provide enough mock products/categories to exercise listing, detail, empty states, and internal links. Data is placeholder, not real merchandising.

### Dependencies

S1-T05; typically after S2-T03.

### Requirements

Do not claim real SKUs. Include at least one empty category if empty states exist.

### Implementation scope

Fixture updates only.

### Expected files/modules

- Static catalog fixtures
- Tests updated for new slugs

### Acceptance criteria

- Multiple categories and products
- All fixture slugs resolve

### Testing requirements

Repository tests still pass.

### Definition of Done

Fixtures support Sprint 2 pages.

---

## S2-T07 — Catalog Review

**Status:** NOT_STARTED

### Objective

Review catalog pages for layering, crawlability, and docs sync.

### Dependencies

S2-T01 … S2-T06 (S2-T05 may be deferred if recorded).

### Requirements

No Phase 2 code. Pages remain server-rendered.

### Implementation scope

Fixes and documentation.

### Expected files/modules

- Docs + catalog pages as needed for fixes

### Acceptance criteria

- UI does not import static JSON directly
- Unknown routes 404
- README/architecture match behavior

### Testing requirements

Lint, unit tests, build.

### Definition of Done

Sprint 2 completed in status files; S3-T01 recorded, not started.
