# Sprint 4 — Customer Storefront + Dummy API Foundation

| Field | Value |
|-------|-------|
| Sprint ID | S4 |
| Phase | Phase 1 — Storefront + Dummy API |
| Objective | Align customer navigation and define a vendor-isolated dummy catalog API without regressing the storefront |
| Status | IN_PROGRESS |
| Dependencies | S3-T01–S3-T09 completed; S3-T10 deferred |
| Task IDs | S4-T01 … S4-T12 (including S4-T10A) |

The dummy API is a development adapter, not Zoho integration or a production
backend. Follow ADR 0005. Raw dummy/Zoho-shaped DTOs must not reach pages or
components.

## S4-T01 — Backend/API Audit & Cleanup

**Status:** COMPLETED

### Objective

Audit the repository for backend/API implementation, remove only proven
obsolete code, assess catalog boundaries, and align the roadmap.

### Dependencies

S3-T09.

### Requirements

- Do not implement a dummy API, Zoho integration, cart, checkout, or auth.
- Retain domain types, repository interfaces, static repositories, catalog
  fixtures, pages, components, and SEO.
- Remove code/dependencies only with evidence that they are obsolete and unused.

### Implementation scope (as completed)

- Repository-wide code, manifest, and dependency audit
- Catalog/domain/repository/navigation architecture assessment
- ADR 0005 for stable storefront contracts and a Zoho anti-corruption boundary
- Roadmap/status documentation alignment
- No application code, package, or dependency changes

### Findings

- No backend/API/server implementation exists.
- `backend/` contains only its README.
- No API route handlers, server actions, HTTP repositories, databases, ORM,
  migrations, controllers, auth infrastructure, or mock API servers exist.
- No obsolete backend dependency exists in `frontend/package.json`.
- Current category navigation is data-driven from repository data; category
  names are not hardcoded in React.
- Current repository boundaries are suitable for replacement. Hierarchy,
  richer product/variant fields, and DTO mappings are explicitly later work.

Detailed evidence: `docs/architecture/BACKEND_API_AUDIT.md`.

### Acceptance criteria

- Findings classified as Keep / Remove / Refactor later / Do not touch
- Obsolete backend code removed only if proven (none found)
- Existing storefront and SEO unchanged
- Revised S4–S8 roadmap documented

### Testing requirements

Documentation/consistency review plus existing frontend test, typecheck, lint,
and production build.

### Validation results

- `npm test`: passed (31 files, 123 tests)
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed
- `npm install`: not required; manifests unchanged and dependencies present
- Non-blocking npm warning: unknown user config `devdir`

### Definition of Done

Audit recorded, no unjustified cleanup performed, and S4-T02 recorded
**NOT_STARTED**.

---

## S4-T02 — Customer Navigation/Category Hierarchy

**Status:** COMPLETED

### Objective

Implement the customer-reference taxonomy and prominent, responsive,
hierarchical ecommerce navigation without hardcoding categories in React.

### Implementation scope (as completed)

- Extended `Category` with `parentId`, recursive `children`, `visibility`, and
  `showInMenu`.
- Kept infrastructure records flat and derived arbitrary-depth trees in the
  category mapper with duplicate, orphan, and cycle protection.
- Added only customer-supplied category names. The duplicated Women “Nighties”
  entry maps to one category/URL.
- Preserved the five existing top-level category URLs and added reference routes
  for Kid's Wear, Boy's Wear, Girl's Wear, Boutique, and supplied descendants.
- Added tablet/desktop primary navigation with hierarchy dropdowns and a
  scroll-safe single-row treatment.
- Added a compact mobile Menu disclosure with the same recursive hierarchy.
- Added clearly disabled Search, Account, Cart, and Track Your Order visual
  entry points; no fake routes or behavior.
- Kept homepage category tiles limited to top-level categories with approved
  imagery, preserving the existing five tiles.

### Guardrails

- Taxonomy exists only in static infrastructure records; components receive
  recursive view-model props.
- No API endpoint, dummy backend, Zoho type, search/cart/account/order behavior,
  product fixture, or S3-T10 work.
- Existing `/c/{slug}` routing, catalog pages, sitemap, metadata, and SEO remain
  the only category URL mechanism.

### Accessibility and responsive behavior

- Semantic category navigation, links, native `details`/`summary` disclosures
- Escape closes an open disclosure and restores summary focus
- Focus leaving a disclosure closes it; opening one desktop dropdown closes its
  sibling
- 44px minimum mobile/disclosure targets and visible global focus styles
- Mobile: compact header + scrollable recursive menu
- Tablet: single-row, horizontally overflow-safe category bar with tighter
  spacing
- Desktop: prominent category bar with full-width dropdown/mega-menu panels

### Testing requirements and results

- Recursive mapper tests: record order, arbitrary depth, empty roots, duplicate
  ids, missing parents, cycles
- Repository tests: top-level order, nested relationships, empty categories,
  stable slugs
- Application tests: recursive nav URLs and visibility/menu filtering
- Presentation contract tests: mobile/desktop treatments, semantic disclosures,
  Escape handling, no hardcoded category names, no fake utility routes
- `npm test`: passed (33 files, 132 tests)
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed
- Responsive review: closed mobile (500 CSS px), tablet (820px), and desktop
  (1440px); open mobile panel measured full-width with 54 category/view-all
  links and bounded vertical scrolling
- Non-blocking npm warning: unknown user config `devdir`

### Definition of Done

Customer-reference hierarchy and responsive navigation are implemented through
existing repository/domain/application boundaries. S4-T03 is recorded
**NOT_STARTED**.

---

## S4-T03 — API/Domain Contracts

**Status:** COMPLETED

### Objective

Define stable Mini Mystiq category, product, variant, pricing, inventory, and
application response contracts plus an explicit external-provider boundary.

### Scope

Implemented provider-independent:

- recursive category entities with visibility/menu configuration
- product summary/detail models with separate IDs and SEO slugs
- generic variant attributes and nullable product/variant SKU
- nullable UOM, current/compare-at pricing, and inventory snapshots
- active/inactive publication status separated from stock availability
- ordered category collection, paginated product list, detail, and error
  envelopes
- contract validation for hierarchy, IDs/slugs, attributes, monetary values,
  quantities, and pagination

Unknown fixture values remain null and missing variants remain empty. Existing
static records map into the evolved domain without fabricated commerce data.
The response contract is transport-neutral; dummy routes, runtime, status-code
mapping, and default product page size remain implementation details for the
scheduled dummy API tasks.

### Guardrails

Do not expose Zoho DTOs to UI/application consumers. No real Zoho calls.

### Tests

- Category hierarchy validation and arbitrary nesting
- Product/variant, optional pricing/inventory, SKU/UOM, and slug invariants
- Collection/detail, pagination, empty collection, and not-found shapes
- Full storefront regression suite

### Validation

- `npm test`: 35 files, 146 tests passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed
- Non-blocking npm warning: unknown user config `devdir`

### Definition of Done

Stable catalog contracts and external-provider boundaries are documented and
validated. S4-T04 is recorded as the next task and remains **NOT_STARTED**.

---

## S4-T04 — Dummy Category API

**Status:** COMPLETED

### Objective

Implement the S4-T03 category contract using development data, including the
approved hierarchy/menu semantics.

### Scope

- Added force-static `GET /api/categories` in the Next.js App Router.
- Reused approved category records, `mapCategories`, and
  `StaticCategoryRepository`; no duplicate fixture or repository was created.
- Added `getCategoryCollection` to return ordered roots with recursive
  descendants in the stable `{ data }` envelope.
- Added a thin handler factory that maps stable application errors to HTTP and
  sanitizes unexpected repository failures.
- Kept all existing storefront pages on their current static composition.

### Guardrails

No production database or Zoho integration. Static repositories remain
available during migration.

### HTTP behavior

- `200`: successful recursive category collection
- `400`: stable `invalid_request` mapping (not currently produced; no inputs)
- `404`: stable `not_found` mapping (not currently produced; no detail lookup)
- `500`: unexpected load failure as safe `temporarily_unavailable`

The endpoint has no body, query parameters, auth, secrets, or custom caching
infrastructure. Its force-static response is deterministic from approved dummy
records.

### Tests

- Repository hierarchy, empty categories, relationships, and deterministic data
- Application root/tree success, empty collection, and failure propagation
- Route response envelope, hierarchy, status mapping, sanitized failure, and no
  fixture/Zoho detail leakage

### Validation

- `npm test`: 37 files, 156 tests passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed
- Manual `GET /api/categories`: HTTP 200, JSON, 9 ordered roots, nested infant
  grandchild confirmed
- Non-blocking npm warning: unknown user config `devdir`

### Definition of Done

The dummy category endpoint satisfies the S4-T03 contract without changing UI
data access. S4-T05 is next and remains **NOT_STARTED**.

---

## S4-T05 — Dummy Product API

**Status:** COMPLETED

### Objective

Implement list/query product responses using the S4-T03 contract and approved
catalog data.

### Scope

- Added `GET /api/products` using the existing Next.js dummy API convention.
- Reused the 12 approved records and `StaticProductRepository`; no duplicate
  product model, repository, or fixture source was created.
- Added `getProductCollection` for deterministic slicing and
  `Product` → `ProductSummary` mapping.
- Implemented one-based `page`/`pageSize` pagination with defaults 1/12.
- Kept existing storefront pages on their current static composition.

### Guardrails

Do not invent products, categories, prices, SKU, inventory, or status values.

### Request and HTTP behavior

- Supported query parameters: positive safe integers `page`, `pageSize`
- `200`: product summaries plus stable pagination, including empty pages
- `400`: malformed, duplicate, unsafe, or unsupported query parameters
- `500`: unexpected repository failure as sanitized `temporarily_unavailable`
- No filtering, search, sorting, product detail, auth, database, or Zoho

Responses vary by query, so the route is dynamic; fixture order and results are
deterministic.

### Tests

- Repository count/order, category relationships, and nullable fields
- Application summary mapping, pagination, empty pages, invalid input, and
  repository failure propagation
- Route defaults, later/terminal/beyond pages, malformed queries, safe 500,
  contract shape, determinism, and no internal/Zoho leakage

### Validation

- `npm test`: 39 files, 171 tests passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed
- Manual API: default returned 12/12; page 2 size 5 returned 5 with `hasNext`;
  page 4 returned empty; invalid page returned HTTP 400
- Non-blocking npm warning: unknown user config `devdir`

### Definition of Done

The dummy product collection satisfies the S4-T03 summary/pagination contract
without changing UI data access. S4-T06 is next and remains **NOT_STARTED**.

---

## S4-T06 — Dummy Product Detail API

**Status:** COMPLETED

### Objective

Implement product-detail lookup and not-found behavior through the stable API
contract.

### Scope

- Added `GET /api/products/[slug]` using the existing Next.js dummy API
  convention.
- Reused `getBySlug`, the 12 approved records, and
  `StaticProductRepository`; no duplicate product model or fixture source.
- Added `getProductDetail` to validate catalog-slug syntax, look up by public
  SEO slug, and return the S4-T03 `{ data: Product }` envelope or `not_found`.
- Kept existing storefront pages, including `/p/{slug}`, on their current
  static composition.

### Guardrails

Preserve `/p/{slug}`, metadata, and product structured data behavior.

### Request and HTTP behavior

- Lookup key: public SEO slug; no Zoho identifiers
- `200`: existing product in the detail envelope, including empty variants
- `404`: well-formed unknown slug as `not_found`
- `400`: invalid slug syntax or unsupported query parameters
- `500`: unexpected repository failure as sanitized `temporarily_unavailable`
- No invented commerce values, variant expansion, auth, database, or Zoho

Lookups vary by slug, so the route is dynamic; fixture results are
deterministic.

### Tests

- Repository slug lookup and determinism
- Application detail envelope, unknown slug, invalid syntax, and failure
  propagation
- Route 200 fixture match, nullable fields, 404, 400, sanitized 500, no
  pagination envelope, and no internal/Zoho leakage

### Validation

- `npm test`: 41 files, 186 tests passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed
- Manual API: approved slug returned 200 detail; unknown slug returned 404;
  invalid slug returned 400
- Non-blocking npm warning: unknown user config `devdir`

### Definition of Done

The dummy product-detail endpoint satisfies the S4-T03 contract without
changing UI data access. S4-T07 is next and remains **NOT_STARTED**.

---

## S4-T07 — Variant/Size/Color Model

**Status:** COMPLETED

### Objective

Define variant identity and generic option/attribute semantics.

### Scope

- Reused the S4-T03 `ProductVariant` / `VariantAttribute` types. Size and color
  are generic `name`/`value` pairs, not typed domain fields.
- Exported `validateVariant` and `variantAttributeSignature`.
- Enforced unique attribute names per variant and unique attribute
  combinations per product (order and name casing ignored).
- Kept SKU, pricing, and inventory nullable. Did not invent option values.
- Left all 12 approved products at `variants: []`.
- Did not add API endpoints, UI selectors, or Zoho types.

### Guardrails

Sizes, colors, SKU values, and option vocabularies remain TBD until confirmed.

### Tests

- One attribute, multiple attributes, size, color, size+color, material/style/age
- Empty name/value, duplicate names, duplicate combinations
- Nullable SKU/pricing/inventory
- Existing fixtures remain valid with empty variants
- No Zoho/provider field leakage

### Validation

- `npm test`: 42 files, 198 tests passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed
- Non-blocking npm warning: unknown user config `devdir`

### Definition of Done

The generic variant model is validated without fabricated commerce data.
S4-T08 is next and remains **NOT_STARTED**.

---

## S4-T08 — Pricing/Inventory Model

**Status:** COMPLETED

### Objective

Finalize the provider-independent pricing and inventory domain model already
introduced in S4-T03, without inventing commercial facts.

### Scope

- Reused S4-T03 `Money`, `Pricing`, and `Inventory` types. Did not add parallel
  models or change the major-unit `amount: number` representation.
- Exported `validateMoney`. Current price remains required; compare-at remains
  nullable; matching currencies and compare-at ≥ current are enforced when
  both amounts are valid.
- Inventory quantities remain nullable and distinct from zero. Known values
  must be non-negative integers and internally consistent with availability.
- Product and variant continue to own independent nullable pricing/inventory.
  Generic variant attributes are unchanged; no size/color commerce fields.
- Left all 12 approved products at `sku`, `uom`, `pricing`, `inventory` null
  and `variants: []`.
- Did not add API endpoints, UI wiring, Zoho types, discounts, tax, FX,
  reservation, deduction, or inventory synchronization.

### Guardrails

Catalog prices, currency display, tax, discounts, stock counts, reservations,
and availability policies remain TBD until an authoritative source supplies
them. This task defines invariants for values that exist; it does not invent
those values.

### Tests

- Valid/invalid money amounts and currencies
- Valid current price; nullable, valid, and invalid compare-at
- Compare-at must not be below current price; no discount calculation
- Valid on-hand, available-to-sell, and reserved quantities
- Null inventory remains distinct from zero; negatives and inconsistent
  quantity/availability relationships are rejected
- Variant nullable and populated pricing/inventory on generic attributes
- Existing Product model, 12 fixtures, and dummy APIs remain compatible
- No Zoho/provider DTO leakage

### Validation

- `npm test`: 44 files, 215 tests passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed
- Non-blocking npm warning: unknown user config `devdir`

### Definition of Done

The pricing and inventory model is validated without fabricated commerce data.
S4-T09 is next and remains **NOT_STARTED**.

---

## S4-T09 — Connect UI to Dummy API

**Status:** COMPLETED

### Objective

Add repository adapters/composition wiring so current pages consume the dummy
API without changing presentation contracts.

### Scope

- Split composition: `catalogSource` backs dummy route handlers, sitemap, and
  layout navigation; `catalog` is the storefront HTTP composition.
- Added a provider-neutral catalog API client that understands collection,
  pagination, and detail envelopes and sanitizes non-2xx failures.
- `HttpCategoryRepository` and `HttpProductRepository` implement the existing
  ports against `GET /api/categories`, `GET /api/products`, and
  `GET /api/products/[slug]`.
- Homepage, category pages, and PDPs keep calling `catalog.*` use cases as
  Server Components. No UI redesign, commerce UI, filters, variant selectors,
  or invented prices/stock.
- Layout navigation remains on `catalogSource` until S4-T11.
- Fixtures were not deleted; they remain the dummy API backing store.

### Guardrails

Catalog HTML stays server-rendered. Dedicated loading/error/empty UX is S4-T10.
API-driven navigation is S4-T11.

### Tests

- Homepage/category/PDP consume `config/catalog`, not fixtures
- Dummy routes bind `catalogSource` to prevent recursion
- Unknown product remains a missing page result
- API failures do not leak internal details
- Existing SEO wiring and API contract tests remain valid
- Presentation-layer import boundary against fixtures, static product/category
  repositories, and Zoho field names

### Validation

- `npm test`: 49 files, 229 tests passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed
- Manual (`next start`): homepage/category/PDP 200; unknown product 404 without internals;
  dummy APIs 200; sitemap/robots 200; titles/canonicals remain; Product and
  Organization JSON-LD remain; no invented price/SKU/stock/variant UI
- Non-blocking npm warning: unknown user config `devdir`

### Definition of Done

Storefront pages consume the dummy APIs through the application/API client.
S4-T10 is next and remains **NOT_STARTED**.

---

## S4-T10 — Loading/Error/Empty States

**Status:** COMPLETED

### Objective

Handle API loading, repository failure, not-found, and valid empty catalog
states.

### Scope

- Route `loading.tsx` skeletons for homepage, category, and PDP using existing
  surface tokens.
- Shared `error.tsx` catalog failure UI: “Catalog is temporarily unavailable”,
  Try again, no internals.
- Homepage keeps hero/promo/intro/trust when catalog reads fail.
- Valid empty collections show explicit empty copy; unknown slugs stay on
  `not-found.tsx`.
- Null pricing/inventory and `variants: []` remain valid product data.

### Guardrails

Pages stay server-rendered. No client-side catalog fetching, filter/sort,
variant/price/stock UI, or invented fallback catalog.

### Tests

- Loading boundaries and no leaked internals
- Generic failure UI, retry control, no stack/repository/provider details
- Empty homepage/category collections vs API failure
- Unknown category/product remain 404
- Null commerce fields do not error
- Existing homepage/category/PDP, SEO, and API contract tests remain

### Validation

- `npm test`: 52 files, 242 tests passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed
- Manual (`next start`): homepage/category/PDP 200; `/c/infants` empty collection
  copy; unknown category/product render `not-found` without internals; no fake
  price/SKU/stock UI
- Non-blocking npm warning: unknown user config `devdir`

### Definition of Done

Loading, error, not-found, and empty states are in place without a storefront
redesign.

---

## S4-T10A — Storefront Footer and UI Polish

**Status:** COMPLETED

### Objective

Perform a focused customer-facing UI polish pass, primarily the footer and
small visual details, without changing architecture or catalog data.

### Implementation scope (as completed)

- Structured footer: brand, Shop, Collections, Contact, service claims, copyright
- Shop/Collections columns derived from existing category data (image-backed
  top-level menu categories vs remaining top-level menu categories)
- Contact uses verified organization name, address, and a `tel:` phone link
- Service strip reuses announcement claims only
- No Customer Care/policy/account links (those routes do not exist)
- Header/navigation, homepage, category, and PDP presentation left unchanged
- Footer data still comes from `catalogSource` (S4-T11 remains next)

### Guardrails

No domain, API, repository, fixture, SEO, or Zoho changes. No invented email,
social, legal pages, or commerce values.

### Tests

- Footer nav view-model split and filtering
- Footer renders category links from props, verified `tel:` href, existing
  claims, semantic structure, no fake routes

### Validation

- `npm test`: 53 files, 248 tests passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed
- Manual (`next dev`): homepage, category, and PDP footers include Shop,
  Collections, contact address, `tel:09025799377`, and copyright; header
  unchanged; robots/sitemap unchanged
- Non-blocking npm warning: unknown user config `devdir`

### Definition of Done

Focused storefront footer/UI polish completed without architectural/API
changes. S4-T11 is next and remains **NOT_STARTED**.

---

## S4-T11 — API-driven Navigation

**Status:** NOT_STARTED

### Objective

Render the approved hierarchy from API/application navigation contracts.

### Guardrails

Customer category names and nesting come from data. Search, account, cart, and
Track Your Order behavior remain separate tasks unless explicitly included.

---

## S4-T12 — Sprint Review

**Status:** NOT_STARTED

### Objective

Verify the storefront, dummy API boundary, hierarchy, responsive behavior, and
SEO regressions; synchronize documentation.

### Guardrails

Do not start Sprint 5 automatically.
