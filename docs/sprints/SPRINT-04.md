# Sprint 4 — Customer Storefront + Dummy API Foundation

| Field | Value |
|-------|-------|
| Sprint ID | S4 |
| Phase | Phase 1 — Storefront + Dummy API |
| Objective | Align customer navigation and define a vendor-isolated dummy catalog API without regressing the storefront |
| Status | COMPLETED |
| Dependencies | S3-T01–S3-T09 completed; S3-T10 deferred |
| Task IDs | S4-T01 … S4-T12 (including S4-T10A, S4-T10B, S4-T10C) and fix S4-F01 |

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

**S4-T12 correction:** the “unknown category/product remain 404” test only
asserted source text. The route loading boundaries added here made production
return HTTP 200 (soft 404) for unknown slugs. Found in S4-T12, fixed by
S4-F01, and now guarded by `npm run test:http` (TD-001).

### Definition of Done

Loading, error, not-found, and empty states are in place without a storefront
redesign.

---

## S4-T10A — Classic-Modern Storefront UI Polish

**Status:** COMPLETED

### Objective

Classic boutique + modern ecommerce + friendly baby-store visual polish,
without changing information architecture, catalog data, or APIs.

### Implementation scope (as completed)

- Warmed design tokens: off-white background, soft pink secondary, soft purple
  accent, warmer charcoal/borders; primary green unchanged
- Self-hosted Source Sans 3 + Cormorant Garamond via `next/font` (swap +
  system fallbacks)
- Header/nav structure preserved; hover, open, and focus treatments refined
- Mega-menu: warm panel, rounded bottom corners, collection header, View all →,
  tighter three-column spacing, hover surfaces
- CSS-only 180ms color/zoom transitions with reduced-motion support
- Shared `.mm-btn-primary`; hero keeps existing CTA copy with a visual arrow
- Category circles and product cards: framing, hover zoom, no commerce fields
- Homepage section rhythm aligned; trust row simplified (existing claims only)
- Footer: brand, Shop, Collections, in-page Contact Us, verified contact/`tel:`,
  service claims, copyright
- Footer/nav still use `catalogSource` (S4-T11 remains next)

### Guardrails

No domain, API, repository, fixture, SEO, or Zoho changes. No invented email,
social, legal pages, prices, or trust badges. Header IA unchanged.

### Tests

- Footer nav split, `tel:` href, claims, no fake routes
- Mega-menu still data-driven; Escape/disclosures unchanged
- Tokens, self-hosted fonts, product cards without commerce fields
- Existing loading/error/empty, API, and SEO tests remain

### Validation

- `npm test`: 54 files, 252 tests passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed
- Manual (`next dev`): `/`, `/c/baby-essentials`, `/c/infants`,
  `/p/pink-white-pleated-baby-dress` 200; footer/tel/JSON-LD present; static
  chunks 200 (no 500); robots/sitemap 200
- Non-blocking npm warning: unknown user config `devdir`
- Non-blocking Next image `sizes` warning on the homepage promo

### Definition of Done

Classic-modern storefront UI polish completed. S4-T10B later refined the
mega-menu presentation. S4-T10C froze that visual design. S4-T11 is next and
remains **NOT_STARTED**.

---

## S4-T10B — Refine Mega Menu Boutique UI

**Status:** COMPLETED

### Objective

Final focused visual refinement of the existing desktop mega-menu toward a
modern boutique clothing-store panel, without changing navigation architecture.

### Implementation scope (as completed)

- Kept data-driven heading, Explore the collection, View all, 3-column children,
  keyboard/Escape/sibling-close behavior
- Added a generic “Shop by category” eyebrow; category title remains the heading
- Stronger brand-green View all action with hover/focus underline and arrow cue
- Child rows: warm/green hover and focus-visible surface, arrow on hover/focus
- Cream panel, thin primary top accent, soft shadow, rounded lower corners
- Open top-level summary uses a warm accent surface and primary text
- Mobile disclosure unchanged (not converted to a desktop mega-menu)

### Guardrails

No API, domain, fixture, header IA, footer, or catalog data changes.

### Tests

- Mega-menu panel/link/view-all classes, focus-visible, reduced-motion
- Existing navigation, Escape, no hardcoded taxonomy, no fake tool routes

### Validation

- `npm test`: 54 files, 252 tests passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed
- Manual (`next dev`): `/`, `/c/baby-essentials`, `/c/infants`,
  `/p/pink-white-pleated-baby-dress` 200; View all for Baby Essentials/Infants/
  Women present; static chunks 200 (no 500)
- Non-blocking npm warning: unknown user config `devdir`

### Definition of Done

Mega-menu boutique refinement completed. S4-T10C later froze the visual design.
S4-T11 remains **NOT_STARTED**.

---

## S4-T10C — Final Mega Menu Visual Refinement

**Status:** COMPLETED

### Objective

Final visual polish of the desktop mega-menu toward a premium local boutique
storefront. After this task, the mega-menu visual design is frozen.

### Implementation scope (as completed)

- Kept the approved T10A/T10B direction: warm cream panel, green accent line,
  serif category heading, Shop by category / Explore the collection / View all,
  three-column children, keyboard/Escape behavior
- Constrained the panel to the storefront content width (`inset-inline: 0` of
  the container nav, `max-width: 100%`); tablet tabs wrap instead of clipping
  the panel
- Tightened header/panel spacing about 10–15%; lighter header divider
- Balanced three-column grid (`items-start`, `auto-rows-min`, narrower column
  gap); no column cards or hardcoded taxonomy
- Refined link hover/focus: subtle warm-green tint, arrow, visible focus ring
- Slightly more premium View all (green, medium weight, underline + arrow)
- Open parent tab stacks above the panel (`z-50`) with warm accent + primary
  text so it reads as attached
- Soft one-layer shadow; no extra decorative motif beyond the existing green
  top line
- Mobile disclosure unchanged (not converted to the desktop mega-menu)

### Guardrails

No API, domain, fixture, header IA, footer, or catalog data changes.
Mega-menu visual design is frozen.

### Tests

- Mega-menu panel/header/link/view-all classes, content-width, 3-column grid,
  focus rings, reduced-motion, active parent stacking
- Existing navigation, Escape, no hardcoded taxonomy, no fake tool routes

### Validation

- `npm test`: 54 files, 252 tests passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed
- Manual (`next dev`): `/`, `/c/baby-essentials`, `/c/infants`,
  `/p/pink-white-pleated-baby-dress` 200; View all for Baby Essentials/Infants/
  Women present; static chunks 200 (no 500)
- Non-blocking npm warning: unknown user config `devdir`

### Definition of Done

Final mega-menu visual refinement completed and mega-menu visual design frozen.
S4-T11 later moved navigation onto the category API boundary. S4-T12 remains
**NOT_STARTED**.

---

## S4-T11 — API-driven Navigation

**Status:** COMPLETED

### Objective

Move remaining catalog-derived storefront navigation from the static catalog
composition onto the existing dummy category API/application boundary, without
changing the frozen S4-T10C visual design.

### Implementation scope (as completed)

- Layout loads categories via `catalog.listCategories()` (HTTP category
  repository → in-process `GET /api/categories` dispatch → existing handler →
  `catalogSource` → `StaticCategoryRepository` → fixtures)
- Header mega-menu and footer Shop/Collections still use
  `toCatalogNavItems` / `toFooterNavViewModel`; presentation markup and CSS
  were not changed
- Category tree reads are request-memoized in `config/catalog.ts` so header,
  footer, and pages share one category collection
- Catalog load failures do not invent fallback categories (empty nav/footer;
  existing sanitized unavailability copy remains on pages)
- Sitemap remains on `catalogSource` for deterministic static generation
  without a self-origin fetch; URL set unchanged
- No new endpoints, query parameters, category models, or Zoho types

### Guardrails

No visual redesign. No API contract change. No taxonomy change. No Sprint 5
commerce work.

### Tests

- Layout/footer use `@/config/catalog`, not `catalogSource` or fixtures
- Presentation does not import `StaticCategoryRepository` or Zoho fields
- HTTP navigation view models match the backing catalog source (roots, nested
  children, leaves, visibility/showInMenu, deterministic order, `/c/{slug}`)
- Existing sitemap URL-set, API, accessibility, and SEO tests kept

### Validation

- `npm test`: 54 files, 254 tests passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed
- Manual (`next dev`): `/`, `/c/baby-essentials`, `/c/infants`,
  `/p/pink-white-pleated-baby-dress`, `/sitemap.xml`, `/robots.txt` 200
- Non-blocking npm warning: unknown user config `devdir`

### Definition of Done

Navigation now obtains catalog-derived category data through the API/application
boundary. Sitemap retains server-side `catalogSource` usage. S4-T12 is next and
remains **NOT_STARTED**.

---

## S4-F01 — Production Soft-404 Correction

**Status:** COMPLETED

### Objective

Fix the verified production defect (found during S4-T12) where unknown
category and product URLs returned HTTP 200 instead of 404. Register:
`docs/project/TECHNICAL_DEBT.md` TD-001.

### Root cause

S4-T10 added `app/loading.tsx` at the root segment plus `c/[slug]` and
`p/[slug]` `loading.tsx`. Those Suspense fallbacks streamed before the pages
called `notFound()`, so the response was committed as 200 (with an injected
`noindex`). Next.js 16 documents that the status cannot change after
streaming begins. The root boundary also wrapped every catalog route, so a
segment-level check alone would not have been enough.

### Implementation scope (as completed)

- Moved the homepage and its skeleton into the `app/(home)/` route group so the
  homepage loading boundary no longer wraps `/c/*` or `/p/*` (URL unchanged)
- Added `app/c/[slug]/layout.tsx` and `app/p/[slug]/layout.tsx`: resolve the
  slug through `catalog.getCategoryBySlug` / `catalog.getProductBySlug` and call
  `notFound()` before the segment `loading.tsx` streams
- Request-memoized product detail reads in `config/catalog.ts` (same pattern as
  the category tree) so the layout check and page share one lookup
- Category/product skeletons, not-found UI, metadata, canonicals, JSON-LD,
  sitemap, robots, APIs, contracts, fixtures, and mega-menu unchanged

### Guardrails

No Zoho, contract, fixture, SEO-content, sitemap, or visual changes. No new
packages.

### Tests

- New `app/storefront-http-status.http.test.ts` (`npm run test:http`, config
  `vitest.http.config.mts`): starts `next start` on the production build and
  asserts existing `/`, `/c/baby-essentials`, `/c/infants`,
  `/c/infants-baby-girl-frock`, `/p/pink-white-pleated-baby-dress` → 200
  without not-found title/`noindex`; `/c/does-not-exist`, `/p/does-not-exist`,
  `/c/Bad_Slug` → 404 with not-found title, `noindex`, and no Product/
  BreadcrumbList JSON-LD — for browser and Googlebot user agents
- Against the original build: 4 of 14 failed (missing slugs returned 200)
- Route-state contract test: no root `loading.tsx`; layouts resolve slugs via
  `@/config/catalog` without client/Suspense/static-source imports
- Existing homepage/data-boundary tests updated for the `(home)` path;
  catalog composition test asserts memoized product detail reads

### Validation

- `npm test`: 54 files, 255 tests passed
- `npm run test:http`: 16 tests passed (after build)
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed (after removing stale generated `.next/dev/types`;
  TD-007)
- Production smoke (`next start`, browser + Googlebot): existing homepage,
  category, nested category, empty category, and PDPs 200; missing and
  malformed `/c` and `/p` slugs 404 with not-found UI and `noindex`; APIs,
  sitemap (67 URLs), robots 200; canonicals and Product/BreadcrumbList/
  Organization JSON-LD unchanged; static assets 200
- Non-blocking npm warning: unknown user config `devdir`

### Definition of Done

Unknown catalog slugs return HTTP 404 in production for all user agents.
S4-T12 review resumes only on explicit request.

---

## S4-T12 — Sprint Review

**Status:** COMPLETED

### Objective

Verify the storefront, dummy API boundary, hierarchy, responsive behavior, and
SEO regressions; synchronize documentation.

### Guardrails

Review and documentation only. No features, Zoho client, database, auth, or
unrelated fixes. Do not start Sprint 5 automatically.

### Verdict

**Sprint 4: COMPLETED — objective met, with recorded technical debt.** One
production defect (soft 404, introduced by S4-T10) was found during this review
and corrected by S4-F01 before closeout. No open defect blocks Sprint 5
planning. The reference-storefront inspection and Zoho data verification were
**not completed** (see below) and are not claimed.

### Per-task status

| Task | Status | Review note |
|------|--------|-------------|
| S4-T01 | COMPLETED | Audit recorded in `BACKEND_API_AUDIT.md` |
| S4-T02 | COMPLETED | Taxonomy in fixtures only; recursive nav |
| S4-T03 | COMPLETED | Contracts in `catalog-contracts.ts` / `STOREFRONT_CONTRACTS.md` |
| S4-T04–T06 | COMPLETED | Dummy category/product/detail APIs; safe error envelopes |
| S4-T07–T08 | COMPLETED | Generic variants; null pricing/inventory ≠ 0 |
| S4-T09 | COMPLETED | Pages read through HTTP repositories |
| S4-T10 | COMPLETED (corrected by S4-F01) | 404 claim was source-only; see note in S4-T10 |
| S4-T10A–C | COMPLETED | Visual polish; mega-menu design frozen |
| S4-T11 | COMPLETED | Header/footer nav via `catalog.listCategories()` |
| S4-F01 | COMPLETED | Commit `feed5fe596b744650d0f95dc363946fefe40d198` |

### Validation (HEAD `feed5fe`, branch `s4-f01-production-soft-404`)

- Working tree clean before review (excluding generated `frontend/.next`)
- `npm test`: 54 files, 255 tests passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed; `/c/[slug]`, `/p/[slug]`, `/api/products*` dynamic;
  `/`, `/api/categories`, `/robots.txt`, `/sitemap.xml` static
- `npm run test:http`: 16 tests passed (production server; browser and
  Googlebot user agents)
- Non-blocking npm warning: unknown env config `devdir`

### S4-F01 evidence

Root cause, fix, and tests: see S4-F01 above and TD-001. Production HTTP
evidence (`next start`, browser and Googlebot):

| Request | Before S4-F01 | After S4-F01 |
|---------|---------------|--------------|
| `/`, `/c/baby-essentials`, `/c/infants`, `/c/infants-baby-girl-frock`, `/p/pink-white-pleated-baby-dress` | 200 | 200, no `noindex` |
| `/c/does-not-exist`, `/p/does-not-exist`, `/c/Bad_Slug` | **200** + `noindex` | **404** + not-found UI + `noindex`, no Product/BreadcrumbList JSON-LD |
| `/api/categories`, `/api/products` | 200 | 200 |
| `/api/products/does-not-exist` | 404 | 404 |
| `/sitemap.xml` (67 URLs), `/robots.txt` | 200 | 200 |

`test:http` failed 4 of 14 against the pre-fix build and passes 16 of 16 now.

### Review checks

| Area | Result | Evidence |
|------|--------|----------|
| API/domain contracts | PASS | Contracts/domain last changed in S4-T08 (`5b32881`); unchanged by S4-T09–S4-F01 |
| Repository boundaries | PASS | `domain/` has no Next/React/app-layer imports; `application/` production code imports only domain/ports; pages use `config/catalog` |
| Dummy data integrity | PASS | Fixtures last changed in S4-T02 (`931a936`); 12 products; commerce values null, `variants: []`, nothing invented |
| UI/API separation | PASS | No page/component imports `catalog-source`, fixture records, or Zoho names; only API routes, dispatch, and sitemap use `catalogSource` (by design) |
| API-driven navigation | PASS | Layout/footer use `catalog.listCategories()`, memoized with one category request; empty-nav fallback on failure |
| Loading/error/empty/not-found | PASS after S4-F01 | Skeletons, sanitized `error.tsx`, empty copy; real 404 status verified by `test:http` |
| Accessibility | PASS (source + manual) | Disclosures, Escape/focus handling, `aria-*`, 44px targets, focus-visible, reduced motion, per S4-T02/T10A–C tests. No automated a11y tool or WCAG target (TBD) |
| Responsive UI | PASS (manual, recorded) | 500/820/1440 CSS px review in S4-T02; mobile disclosure kept in S4-T10B/C. Not re-measured in S4-T12 |
| Technical SEO | PASS | Canonicals, metadata, Product/BreadcrumbList/Organization JSON-LD, sitemap, robots unchanged; 404s now correct |
| Build readiness | PASS with risks | Build and all checks green; see release risks |

### Remaining technical debt

Recorded in `docs/project/TECHNICAL_DEBT.md`:

- TD-002 category listing scans the whole catalog (`listByCategorySlug`, `getById`)
- TD-003 external/provider product images unsupported
- TD-004 no inventory-by-location model
- TD-005 no stable, persistent SEO slug source for Zoho items
- TD-006 `test:http` not run automatically in CI
- TD-007 stale generated `.next/dev/types` after route moves (accepted)
- TD-008 API client has no timeout/retry/caching policy for a real network
- TD-009 menu order relies on record order; no menu-order field

### Release and repository risks (not code defects)

- Local `main` is still at the initial commit (`d31f07a`). Sprint 3–4 work
  lives on stacked task branches ending at `s4-f01-production-soft-404`; most
  Sprint 3–4 branches are not pushed. Integrating into `main` and pushing need
  an explicit human decision.
- Production domain, hosting, and CI remain TBD.

### Reference-storefront inspection

**NOT COMPLETED.** A read-only browser inspection of
`https://minimystiq.zakyastore.in/` was started during S4-T12 but returned no
results and saved no screenshots. No observations are recorded, and none may be
assumed. Repeat it as a separate, explicitly requested task if still needed.

### Zoho data-access status

**NOT VERIFIED.** No authorized Zoho POS API access, credentials, API
documentation, or sample responses were available to this review. No Zoho
fields, identifiers, pagination, rate limits, image hosting, stock locations, or
slug sources have been verified. ADR 0005 and Sprint 7 prerequisites stand.
The dummy API must not be assumed to match Zoho.

### Recommended next task (do not start)

**Sprint 5 planning — write and approve Sprint 5 task specifications** (Sprint
5 task IDs are TBD).

Acceptance criteria:

- `docs/sprints/SPRINT-05.md` lists task IDs, objectives, dependencies, tests,
  and Definitions of Done for approved Commerce UI scope
- Search, account, cart, Track Your Order, and variant-selection behavior stay
  TBD unless the business approves them. Nothing is invented
- No Zoho, production backend, auth, or payment implementation is scheduled
- Each task names its checks, including `npm run build && npm run test:http`
  for route-affecting work
- Human approval recorded before any S5 task becomes `IN_PROGRESS`

In parallel, the business owner should decide on integrating and pushing
Sprint 3–4 branches, and should gather authorized Zoho API access and
documentation for Sprint 7 planning.

### Definition of Done

Review recorded with evidence, technical debt registered, status documents
synchronized, and Sprint 4 marked **COMPLETED**. Sprint 5 remains
**NOT_STARTED**.
