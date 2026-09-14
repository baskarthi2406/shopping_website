# Sprint 4 — Customer Storefront + Dummy API Foundation

| Field | Value |
|-------|-------|
| Sprint ID | S4 |
| Phase | Phase 1 — Storefront + Dummy API |
| Objective | Align customer navigation and define a vendor-isolated dummy catalog API without regressing the storefront |
| Status | IN_PROGRESS |
| Dependencies | S3-T01–S3-T09 completed; S3-T10 deferred |
| Task IDs | S4-T01 … S4-T12 |

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

**Status:** NOT_STARTED

### Objective

Implement the S4-T03 category contract using development data, including the
approved hierarchy/menu semantics.

### Guardrails

No production database or Zoho integration. Static repositories remain
available during migration.

---

## S4-T05 — Dummy Product API

**Status:** NOT_STARTED

### Objective

Implement list/query product responses using the S4-T03 contract and approved
catalog data.

### Guardrails

Do not invent products, categories, prices, SKU, inventory, or status values.

---

## S4-T06 — Dummy Product Detail API

**Status:** NOT_STARTED

### Objective

Implement product-detail lookup and not-found behavior through the stable API
contract.

### Guardrails

Preserve `/p/{slug}`, metadata, and product structured data behavior.

---

## S4-T07 — Variant/Size/Color Model

**Status:** NOT_STARTED

### Objective

Define variant identity and generic option/attribute semantics.

### Guardrails

Sizes, colors, SKU values, and option vocabularies remain TBD until confirmed.

---

## S4-T08 — Pricing/Inventory Model

**Status:** NOT_STARTED

### Objective

Define nullable pricing and inventory contracts without inventing commercial
facts.

### Guardrails

Currency, tax, discounts, stock quantities, reservations, and availability
policies require confirmed requirements.

---

## S4-T09 — Connect UI to Dummy API

**Status:** NOT_STARTED

### Objective

Add repository adapters/composition wiring so current pages consume the dummy
API without changing presentation contracts.

### Guardrails

Keep catalog HTML server-rendered and SEO behavior stable. Retain a controlled
static fallback until the migration is verified.

---

## S4-T10 — Loading/Error/Empty States

**Status:** NOT_STARTED

### Objective

Handle API loading, repository failure, not-found, and valid empty catalog
states.

### Guardrails

Do not convert crawlable pages into client-only shells.

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
