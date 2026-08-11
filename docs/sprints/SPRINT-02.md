# Sprint 2 — Product Catalog

| Field | Value |
|-------|--------|
| Sprint ID | S2 |
| Phase | Phase 1 — SEO-First Storefront |
| Objective | Crawlable category and product listing/detail experience on mock data |
| Status | IN_PROGRESS |
| Dependencies | Sprint 1 completed |

Business taxonomy, copy, and pricing rules are **TBD**. Use placeholder catalog data.

Storefront catalog UI is **mobile-first** (Mobile → Tablet → Desktop). See `docs/requirements/MOBILE_REQUIREMENTS.md`.

---

## S2-T01 — Category Listing Page

**Status:** COMPLETED

### Objective

Crawlable category product listing at `/c/[slug]`, resolved through the catalog application layer.

The original sprint outline described a category **index** (`listCategories`). The explicit S2-T01 request implemented the **category-by-slug product listing** instead. A separate category index page was not built.

### Dependencies

S1-T05, S1-T07.

### Requirements

Server Component page; `generateMetadata` from category data; unknown slug → `notFound()`; empty valid category → empty state; mobile-first product grid. No cart, search, filters, header/nav/footer redesign, JSON-LD, or product detail page.

### Implementation scope (as implemented)

- Route: `frontend/app/c/[slug]/page.tsx`
- Application: `getCategoryPage` (category + products, `null` if unknown)
- View model: `toCategoryPageViewModel` / `toProductCardViewModel`
- Metadata helper: `application/seo/category-metadata.ts`
- Presentation: `ProductCard` (view-model props only)
- Minimal `app/not-found.tsx` for unknown routes
- Copied the three `baby-essentials` product JPEGs into `frontend/public/` (SEO filenames; originals kept in repository-root `public/`)

### Current static catalog used

Categories: `baby-essentials`, `infants`, `kids`, `teens`, `women`.

Products on `/c/baby-essentials`: pink-white pleated baby dress, sage striped top and shorts, cream/grey/rose tiered baby dress.

`infants`, `kids`, `teens`, `women` exist and render empty. Uncategorized products (navy/tan, olive, beige) are not shown. No invented prices, stock, sizes, or extra categories.

### Acceptance criteria

- Valid slug renders H1 + products (or empty state) from `catalog.getCategoryPage`
- Unknown slug is HTTP 404 (`notFound()`), not a fake empty category
- Product links use `/p/{slug}` (PDP not implemented)
- Unique title/description/canonical `/c/{slug}` + OpenGraph title/description
- Option 1 tokens; no raw hex; no `"use client"`
- No FastAPI

### Testing requirements

Unit tests for `getCategoryPage`, view-model mapping, and metadata. Page does not import fixtures.

### Definition of Done

Page works on mock data; status updated. S2-T02 remains **NOT_STARTED**.

### Notes

- JSON-LD (Product / BreadcrumbList) is Sprint 3. Not invented here.
- Canonical **domain** remains TBD; canonical is the path `/c/{slug}`.
- Category descriptions are currently `null`; metadata uses a factual fallback (`{name} at Mini Mystiq. Baby Clothes & Toys.`).
- Visible breadcrumb is Home (link) + current category (not a link). Full catalog nav remains S2-T04.
- S2-T02’s original `/c/[slug]` product-listing scope was delivered here. Do not rebuild the same route when S2-T02 starts; re-scope that task (possible remaining work: category index).

---

## S2-T02 — Category Product Listing Page

**Status:** NOT_STARTED

Do **not** start automatically. `/c/[slug]` product listing, `notFound()`, and empty states were implemented in **S2-T01**. Do not re-implement that route. Remaining work for this task is TBD when a human requests S2-T02 (the original S2-T01 category index is one candidate).

### Objective

Show products for a category slug via the product repository.

### Dependencies

S2-T01.

### Requirements

Crawlable listing; 404 for unknown slug. URL pattern follows current architecture (final SEO URLs may be adjusted in S3-T01). Mobile-first product browsing.

### Implementation scope

Dynamic category route, listing UI, not-found handling.

### Expected files/modules

- Dynamic category route
- `listProductsByCategory` (or equivalent) use case

### Acceptance criteria

- Products for the category render in HTML
- Empty category is handled without crashing
- Unknown slug is a not-found response
- Mobile-first listing: no horizontal scroll; touch-friendly product links/cards

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

Semantic product content (name, description, image placeholders). Variant/stock rules **TBD** — omit or show placeholder fields only if present on the type. Mobile-first product detail.

### Implementation scope

Product detail route + `getProduct` use case. No cart button required until Sprint 4 (a disabled placeholder is optional, not required).

### Expected files/modules

- Product detail route
- Product detail presentational component
- `getProduct` use case

### Acceptance criteria

- Product fields from repository render in HTML
- Unknown product is not-found
- Mobile-first PDP: readable typography and images on a narrow viewport; no horizontal scroll
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

Semantic breadcrumb navigation; internal links between home, category, product. Mobile-friendly wrapping; no horizontal scroll.

### Implementation scope

Breadcrumb component wired on catalog routes.

### Expected files/modules

- Breadcrumb UI component
- Integration on category and product pages

### Acceptance criteria

- Users can navigate category → product → parent category via links
- Breadcrumbs are in HTML (not canvas/images)
- Breadcrumbs wrap on mobile; no horizontal scroll

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
- Catalog pages are mobile-first (listing + PDP) with no horizontal scroll at mobile widths

### Testing requirements

Lint, unit tests, build.

### Definition of Done

Sprint 2 completed in status files; S3-T01 recorded, not started.
