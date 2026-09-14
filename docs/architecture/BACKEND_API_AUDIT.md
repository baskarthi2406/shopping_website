# Backend/API Audit — S4-T01

**Date:** 2026-09-14  
**Status:** COMPLETED  
**Scope:** Repository-wide backend/API audit and architecture alignment. No API implementation.

## Outcome

No obsolete backend implementation exists to remove.

The repository contains a working Next.js storefront, framework-free catalog
domain/application code, repository interfaces, static repository adapters, and
documentation for a future backend. There are no API route handlers, server
actions, Python application files, database drivers, ORM models, migrations,
controllers, authentication modules, HTTP repository implementations, or mock
API servers.

## Inventory and classification

### Keep

- `frontend/domain/catalog/`: framework-free `Product`, `Category`,
  `ProductVariant`, `Uom`, image, inventory-status, and slug types.
- `frontend/application/catalog/`: catalog use cases, repository interfaces,
  page data, and view-model mapping.
- `frontend/infrastructure/catalog/`: static repositories, raw development
  records, and raw-record-to-domain mappers.
- `frontend/config/catalog.ts`: the composition root that binds repository
  interfaces to static implementations.
- `frontend/app/` and `frontend/components/`: working storefront consumers of
  application contracts/view models.
- `frontend/application/seo/`, sitemap, robots, metadata, and JSON-LD:
  independent working SEO behavior.
- `backend/README.md`: documentation placeholder only; it contains no backend
  implementation.

### Remove

None. There is no proven obsolete backend code or dependency. Removing the
static repositories, domain types, interfaces, or fixtures would destroy the
current storefront and the intended replacement seam.

### Refactor later

These are model/contract gaps, not defects to fix in S4-T01:

- `Category` is flat. S4-T02/S4-T03 must define nullable/optional `parentId`,
  hierarchy projection (`children` should normally be derived rather than
  duplicated), `visibility`, `showInMenu`, and category SEO fields.
- `CategoryRepository.list()` and the flat `toCatalogNavItems()` are sufficient
  for today's navigation but need a documented hierarchy/menu contract.
- `Product` already has images, category ids, variants, UOM, and inventory
  status. Future contracts need nullable/optional SKU, pricing, richer
  inventory, publication/status, and an explicit category relationship.
- `ProductVariant` currently has only `id`, optional `size`, and optional
  `color`. Future contracts need nullable/optional SKU, generic
  attributes/options, pricing, inventory, and status.
- `listByCategorySlug` needs descendant-category semantics to be decided before
  hierarchical category listings are implemented.
- `StaticProductRepository.listByCategorySlug()` directly imports static
  category records to resolve slug → id. Keep it for the current fixture
  implementation; later HTTP/Zoho repositories should use an API query,
  category id, or application orchestration instead of copying this
  cross-fixture coupling.
- Dummy transport DTOs, stable Mini Mystiq API DTOs, domain models, view models,
  and future Zoho DTOs must be separate types with explicit mappers.

Unknown values must remain nullable/optional. This audit does not add fields or
invent catalog values.

### Do not touch

Homepage, category and product pages, catalog data, current routes, responsive
UI, breadcrumbs, metadata, canonicals, sitemap, robots, Product JSON-LD,
BreadcrumbList JSON-LD, Organization JSON-LD, and OpenGraph.

## Navigation audit

Customer category names are not hardcoded in React components.

`app/layout.tsx` loads `catalog.listCategories()`;
`toCatalogNavItems()` maps domain categories to `{ label, href }`; and
`CatalogNavigation` renders only the supplied items. Category names live in the
static infrastructure records and tests. The generic disclosure label
“Categories” is UI copy, not taxonomy data.

The current UI contract is flat. Supporting `Infants → Baby Girl/Baby Boy → …`
requires a hierarchical navigation view model in S4-T02/S4-T11, but no
component currently depends on Zoho response objects or hardcoded customer
taxonomy.

## Dependency audit

`frontend/package.json` contains only Next.js, React, Tailwind, TypeScript,
ESLint, Vitest, and type packages. The lockfile contains no direct backend,
database, ORM, auth, or HTTP-client dependency. No dependency was removed.

`npm install` was not required because dependencies are already installed and
the manifests were unchanged.

## Architecture assessment

The current flow is clean:

```
Next.js pages/layout
  → application use cases and view-model mappers
    → repository interfaces
      → static repository implementations
        → static records
```

This can evolve without rebuilding the UI:

```
Storefront
  → Mini Mystiq application/API contract
    → domain/application models
      → repository interfaces
        → dummy adapter (development)
        → production/Zoho adapter (future)
```

A Zoho-shaped payload must not become the storefront contract. If dummy payloads
model Zoho closely to test future integration assumptions, that shape stays
inside infrastructure and is mapped through an anti-corruption boundary to
Mini Mystiq-owned domain/API contracts.

## Risks and follow-ups

- The exact Zoho POS API schema, authentication, rate limits, pagination, and
  availability are unverified; they remain TBD until S7.
- The dummy API runtime and transport are TBD until S4-T03. S4-T01 does not
  choose Next.js route handlers, FastAPI, or another server.
- A recursive category graph needs cycle/orphan handling and deterministic menu
  ordering in later contracts.
- Product/category cardinality and whether category listings include descendants
  must be explicit before API implementation.
- Pricing currency, tax, inventory quantities, status values, variant option
  vocabulary, and SKU ownership remain TBD.
- Search, account, cart, and Track Your Order are customer navigation goals, not
  implemented behavior in this task.

## Validation

S4-T01 changed documentation only; `npm install` was not required because
dependencies were already installed and manifests were unchanged.

- `npm test`: passed — 31 files, 123 tests
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed — `/`, dynamic `/c/[slug]`, dynamic `/p/[slug]`,
  `/robots.txt`, and `/sitemap.xml` built successfully

Non-blocking environment warning: npm reports unknown user config `devdir`,
which may stop being supported in a future npm major version.
