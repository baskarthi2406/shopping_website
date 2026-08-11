# Sprint 2 — Product Catalog

| Field | Value |
|-------|--------|
| Sprint ID | S2 |
| Phase | Phase 1 — SEO-First Storefront |
| Objective | Crawlable category and product listing/detail experience on mock data |
| Status | COMPLETED |
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

Page works on mock data; status updated.

### Notes

- JSON-LD (Product / BreadcrumbList) is Sprint 3. Not invented here.
- Canonical **domain** remains TBD; canonical is the path `/c/{slug}`.
- Category descriptions are currently `null`; metadata uses a factual fallback (`{name} at Mini Mystiq. Baby Clothes & Toys.`).
- Visible breadcrumb is Home (link) + current category (not a link). Full catalog nav remains S2-T04.
- S2-T02’s original `/c/[slug]` product-listing scope was delivered here. S2-T02 closed as already satisfied (no duplicate route). The original S2-T01 category **index** was not built and is not part of S2-T02.

---

## S2-T02 — Category Product Listing Page

**Status:** COMPLETED

### Objective

Show products for a category slug via the product repository.

### Overlap with S2-T01

S2-T01 already implemented this task’s entire original scope at `/c/[slug]`. S2-T02 adds **no new storefront code**. A category **index** (`listCategories`) was the original S2-T01 outline, not S2-T02, and was not invented here.

| S2-T02 requirement | S2-T01 coverage |
|--------------------|-----------------|
| Dynamic category route | `frontend/app/c/[slug]/page.tsx` |
| `listProductsByCategory` (or equivalent) | `getCategoryPage` → `listProductsByCategory` |
| Products render in HTML | Server-rendered `ProductCard` list |
| Empty category without crash | Empty state copy; no fake products |
| Unknown slug → not-found | `notFound()` + `app/not-found.tsx` |
| Mobile-first listing | 2 → 3 → 4 column grid; tap-sized links |
| Use-case tests; no UI → fixtures | `get-category-page.test.ts`, `catalog.test.ts` |

### Dependencies

S2-T01.

### Requirements

Crawlable listing; 404 for unknown slug. URL pattern follows current architecture (final SEO URLs may be adjusted in S3-T01). Mobile-first product browsing.

### Implementation scope (as closed)

Documentation/status only. Did **not** rebuild `/c/[slug]`, `ProductCard`, or `getCategoryPage`.

### Expected files/modules

Already present from S2-T01:

- Dynamic category route
- `listProductsByCategory` / `getCategoryPage`

### Acceptance criteria

- Products for the category render in HTML — **met (S2-T01)**
- Empty category is handled without crashing — **met (S2-T01)**
- Unknown slug is a not-found response — **met (S2-T01)**
- Mobile-first listing: no horizontal scroll; touch-friendly product links/cards — **met (S2-T01)**

### Testing requirements

Use-case tests with mock repo; listing does not call infrastructure directly. Existing tests cover this; no new tests (no new logic).

### Definition of Done

Category listing complete on mock data. Overlap documented. S2-T03 recorded **NOT_STARTED**.

---

## S2-T03 — Product Detail Page

**Status:** COMPLETED

### Objective

Crawlable product detail by slug/id as documented.

### Dependencies

S2-T02.

### Requirements

Semantic product content (name, description, images). Variant/stock/price **TBD** — omitted, not invented. Mobile-first product detail. No cart. JSON-LD deferred to Sprint 3.

### Implementation scope (as implemented)

- Route: `frontend/app/p/[slug]/page.tsx` (Server Component)
- Application: `getProductPage` → existing `getProductBySlug` + `CategoryRepository.getById` for known category links
- View model: `toProductPageViewModel`
- Metadata: `application/seo/product-metadata.ts`
- Presentation: `components/storefront/product-detail.tsx`
- Reuses `app/not-found.tsx` for unknown slugs
- Copied remaining catalog product JPEGs into `frontend/public/` (SEO filenames; originals kept)

### Acceptance criteria

- Product fields from repository render in HTML
- Unknown product is not-found
- Mobile-first PDP: readable typography and images on a narrow viewport; no horizontal scroll
- No payment or backend

### Testing requirements

Use-case tests for found/not-found; view-model and metadata tests. Page does not import fixtures.

### Definition of Done

PDP works on mock data. S2-T04 recorded **NOT_STARTED**.

### Notes

- JSON-LD Product schema is Sprint 3. Not invented here (no price/availability/offers).
- Canonical **domain** remains TBD; canonical is the path `/p/{slug}`.
- Uncategorized products (navy/tan, olive, beige) render without a fake category crumb or link.
- Default variants, `uomCode`, and `inventoryStatus: unknown` are not displayed.
- No `"use client"`. Primary image uses `priority` for LCP.

---

## S2-T04 — Catalog Navigation and Breadcrumbs (UI)

**Status:** COMPLETED

### Objective

Add visible breadcrumbs and catalog nav links (structured data is Sprint 3).

### Dependencies

S2-T03.

### Requirements

Semantic breadcrumb navigation; internal links between home, category, product. Mobile-friendly wrapping; no horizontal scroll.

### Implementation scope (as implemented)

- Shared `Breadcrumbs` presentation component (items as props)
- Category and product pages reuse it (S2-T01/S2-T03 inline markup removed)
- Header catalog nav from `catalog.listCategories()` → `toCatalogNavItems` (layout maps; shell receives props)
- Wrapping link list — no hamburger, no `"use client"`, no cart/search/account
- Categories used: Baby Essentials, Infants, Kids, Teens, Women. No New Arrivals/Offers (not in the catalog)

### Expected files/modules

- `frontend/components/storefront/breadcrumbs.tsx`
- `frontend/components/storefront/catalog-navigation.tsx`
- Integration on category and product pages; nav on the storefront shell

### Acceptance criteria

- Users can navigate category → product → parent category via links
- Breadcrumbs are in HTML (not canvas/images)
- Breadcrumbs wrap on mobile; no horizontal scroll
- Catalog category links are crawlable from every page using the shell

### Testing requirements

Unit tests for crumb trail construction (`toCategoryPageViewModel`, `toProductPageViewModel`) and `toCatalogNavItems`. No JSX snapshot tests.

### Definition of Done

UI breadcrumbs and catalog nav shipped; JSON-LD left to Sprint 3. S2-T05 recorded **NOT_STARTED**.

### Notes

- BreadcrumbList JSON-LD is Sprint 3.
- Uncategorized products still breadcrumb Home → product only.
- Option 1 search/wishlist/account/cart chrome is out of scope.

---

## S2-T05 — Listing Filter/Sort (Placeholder)

**Status:** COMPLETED (deferred)

### Objective

Add only filter/sort behavior that is decided. If business rules are TBD, implement a minimal sort (e.g. name) **or** document that filters are deferred — do not invent faceted search.

### Outcome

**Deferred.** Price, size, color, brand, inventory, and merchandising order are TBD. No sort, facets, query parameters, or placeholder Filter/Sort UI were added. Listings keep repository order.

Note: `docs/requirements/CATALOG_FILTER_SORT.md`. Task is **COMPLETED** as documentation (not BLOCKED): S2-T06 does not depend on filters.

### Dependencies

S2-T02.

### Requirements

Do not silently invent taxonomy facets. Prefer TBD + one documented simple sort if needed for UI completeness.

### Implementation scope (as closed)

Documentation only. No listing query parameters. No Client Component. Category/product pages unchanged.

### Expected files/modules

- `docs/requirements/CATALOG_FILTER_SORT.md`

### Acceptance criteria

- No fake “brand” or “age” filters unless types already include those fields
- Behavior documented

### Testing requirements

Deferred: documentation-only review. No new unit tests (no new logic).

### Definition of Done

Deferral is explicit in status/docs. S2-T06 recorded **NOT_STARTED**.

---

## S2-T06 — Expand Static Catalog Fixtures

**Status:** COMPLETED

### Objective

Provide enough mock products/categories to exercise listing, detail, empty states, and internal links. Data is placeholder, not real merchandising.

### Dependencies

S1-T05; typically after S2-T03.

### Requirements

Do not claim real SKUs. Include at least one empty category if empty states exist.

### Implementation scope (as implemented)

Fixture updates only. Six approved product photos added as records. Existing ids/slugs preserved. No new categories, prices, UOM, variants, featured merchandising, or toys.

### Current static catalog (after S2-T06)

**12 products.** Categories unchanged: `baby-essentials`, `infants`, `kids`, `teens`, `women`.

| Category | Products |
|----------|----------|
| baby-essentials | pink-white-pleated-baby-dress, sage-striped-baby-top-and-shorts, cream-grey-rose-tiered-baby-dress, **grey-pinafore-baby-set** |
| kids | **kids-striped-shirts-burgundy-and-sage**, **kids-button-down-shirts-rose-and-burgundy**, **kids-linen-shirts-brown-and-sage** |
| infants, teens, women | empty (empty-state coverage) |
| Uncategorized | navy-star-tan-bow-dress, olive-green-patterned-dress, beige-motif-pleated-dress, **dusty-blue-floral-dress**, **cream-tiered-shirt-dress** |

Kids shirts assigned from DESIGN_ASSETS “kids shirts” names/alts — not visual age guessing. Dusty-blue remains uncategorized (Teens stand-in is **not** taxonomy). Navy/tan category still TBD. No toy assets exist.

### Expected files/modules

- Static catalog fixtures
- Tests updated for new slugs

### Acceptance criteria

- Multiple categories and products
- All fixture slugs resolve

### Testing requirements

Repository tests still pass. Unique id/slug checks; category ids must exist.

### Definition of Done

Fixtures support Sprint 2 pages. S2-T07 recorded **NOT_STARTED**.

---

## S2-T07 — Catalog Review

**Status:** COMPLETED

### Objective

Review catalog pages for layering, crawlability, and docs sync.

### Dependencies

S2-T01 … S2-T06 (S2-T05 may be deferred if recorded).

### Requirements

No Phase 2 code. Pages remain server-rendered.

### Implementation scope (as implemented)

Quality gate only. No catalog data, taxonomy, UI, filter/sort, search, cart, JSON-LD, or backend changes. Added focused repository tests that image `src` files exist under `frontend/public/` and that product names/descriptions do not use unsupported commercial claims.

### Review result

**Pass.** 12 approved products. No invented products, prices, SKUs, inventory, variants, UOM, brand, reviews, or categories.

| Category | Count | Products |
|----------|-------|----------|
| baby-essentials | 4 | pink-white-pleated-baby-dress, sage-striped-baby-top-and-shorts, cream-grey-rose-tiered-baby-dress, grey-pinafore-baby-set |
| kids | 3 | kids-striped-shirts-burgundy-and-sage, kids-button-down-shirts-rose-and-burgundy, kids-linen-shirts-brown-and-sage |
| infants, teens, women | 0 | empty states kept |
| Uncategorized | 5 | navy-star-tan-bow-dress, olive-green-patterned-dress, beige-motif-pleated-dress, dusty-blue-floral-dress, cream-tiered-shirt-dress |

IDs and slugs unique and SEO-friendly. Existing slugs preserved. `kids-linen-shirts-brown-and-sage` storefront name remains “Brown and sage textured kids shirts” (does not claim linen). Uncategorized dresses stay uncategorized (age TBD). Toys still pending approved assets.

Assets: all product `src` values are approved SEO filenames in `frontend/public/`; root `public/` originals kept. Logo, heroes, Pigeon, hiring, and character-print are not products.

SEO: unique titles, canonical `/c/{slug}` and `/p/{slug}`, OpenGraph, one H1, crawlable links, no JSON-LD. Unknown `/c/` and `/p/` slugs are HTTP 404 + `noindex`. Empty categories remain indexable.

Architecture: UI → application → repository interface → static data. No `"use client"` on catalog pages. Filter/sort still deferred.

Mobile/a11y: 2-column cards → 3 → 4; wrapping category nav; `min-h` tap targets; skip link; `focus-visible`; breadcrumbs wrap. Landscape grey-pinafore photo uses global `object-contain` (letterbox) rather than a product-specific `cover` crop — documented in DESIGN_ASSETS, not changed here.

### Acceptance criteria

- UI does not import static JSON directly
- Unknown routes 404
- README/architecture match behavior
- Catalog pages are mobile-first (listing + PDP) with no horizontal scroll at mobile widths

### Testing requirements

Lint, unit tests, build. Unique id/slug, category id, and public image-path checks.

### Definition of Done

Sprint 2 completed in status files; S3-T01 recorded, not started. There is no S2-T08.
