# Stable Storefront Contracts

**Status:** Implemented by S4-T03; pricing/inventory invariants finalized by S4-T08
**Decision:** ADR 0005
**Scope:** Provider-independent catalog domain and application response shapes

## Boundary

Mini Mystiq owns the contract consumed by storefront application code:

```text
Static record / dummy payload / future Zoho DTO
  → infrastructure adapter and mapper
  → Mini Mystiq domain model
  → application result or view model
  → storefront
```

Provider field names, identifiers, nullability, and errors stop at the
infrastructure boundary. A future Zoho adapter may map concepts such as
`item_id`, `rate`, `stock_on_hand`, or item-group attributes, but those names
must not enter domain, application, or UI types.

## Category

`Category` has an application-owned `id`, SEO `slug`, `name`, nullable
`parentId`, recursive `children`, `visibility`, `showInMenu`, nullable
`description`, and nullable `image`.

- Hierarchy depth is unlimited by the contract.
- Taxonomy is data, not a TypeScript union or component constant.
- Root categories have `parentId: null`.
- Child order and root response order are presentation-significant.
- Hidden categories and categories omitted from menus remain valid entities.
- Empty categories and leaf categories have `children: []`.
- The category list response contains ordered roots with recursive descendants.
  Categories are not paginated because the response is the navigation tree, not
  a product-sized collection.

Infrastructure `mapCategories` validates non-empty identity fields, unique IDs
and slugs, known parents, valid slug syntax, and an acyclic hierarchy while
deriving `children` from flat records.

## Product list and detail

`ProductSummary` is the list-facing product contract. It contains:

- application-owned `id` and public SEO `slug`
- `name`, `description`, `images`, and zero or more `categoryIds`
- nullable product-level `sku`, `uom`, `pricing`, and `inventory`
- catalog publication `status`

`Product` extends that summary with `variants`. Product lists use summaries so
variant detail is not duplicated across a page. Product detail returns the full
product.

Unknown fixture values are represented as `null`, and missing real variants as
an empty array. Mappers must not fabricate SKU, UOM, price, stock, or default
variant data.

## Variants, SKU, and UOM

`ProductVariant` has its own application ID, nullable SKU, generic ordered
`attributes`, nullable pricing and inventory, and publication status.

Each `VariantAttribute` is a `name`/`value` pair. Size, color, age, material,
style, or a future item-group option uses the same structure. There are no
domain fields named `size` or `color`.

Attribute names are unique within a variant after trim and case-insensitive
comparison. Two variants on the same product may not share the same attribute
combination; order and name casing do not create a distinct option set.

Empty `variants: []` is valid. A variant may also have an empty attributes
array when a source has no options. SKU, pricing, and inventory stay nullable.
Current approved fixtures intentionally contain no populated variants.

Provider-specific option IDs, item-group names, and Zoho field names stay in
adapters. Pricing and inventory stay on the generic variant; there are no
size- or color-specific commerce fields.

SKU may be product-level, variant-level, both when a provider legitimately
supplies both concepts, or absent. `Uom` is a nullable product-level
`code`/`label` value. Provider-specific SKU and unit fields require adapter
mapping.

## Pricing

`Pricing` contains a current `price` and nullable `compareAtPrice`. Each `Money`
contains a non-negative major-unit `amount` (`number`) and a three-letter
uppercase `currency`. This is the S4-T03 representation; the domain does not
store minor units and does not perform rounding beyond that numeric type.

The current price is required whenever a `Pricing` object exists. Compare-at
price may be `null`. When both amounts are valid, compare-at must not be less
than the current price and both values must use the same currency. That
relationship is a consistency check only: the domain does not calculate a
discount, percentage off, tax, currency conversion, or rounded sale price.

Product and variant pricing are independently nullable. Current approved
fixtures keep `pricing: null` because no authoritative commerce source has
supplied values. Do not invent catalog prices to exercise the model.

## Inventory and status

`Inventory` is a nullable snapshot containing nullable `stockOnHand`,
`availableToSell`, and `reserved` quantities plus `status`:
`unknown`, `in_stock`, or `out_of_stock`.

Null quantity means unknown and is distinct from zero. Mappers must not convert
`null` to `0`, and unknown inventory must not be treated as in stock, out of
stock, or unavailable. Quantities, when present, are non-negative integers.

When the relevant values are known, they must be internally consistent:

- reserved must not exceed on-hand
- available-to-sell must not exceed on-hand
- available-to-sell plus reserved must not exceed on-hand
- `in_stock` is invalid when the known sellable quantity is `0`
- `out_of_stock` is invalid when the known sellable quantity is greater than `0`

Sellable quantity is `availableToSell` when that field is present, otherwise
`stockOnHand`. `unknown` remains valid even when quantities are known. The
contract does not invent a warehouse/location model, reservation workflow,
stock deduction, synchronization, or availability state machine.

Product and variant inventory are independently nullable. Current approved
fixtures keep `inventory: null`.

Product and variant publication status is deliberately limited to `active` and
`inactive`. “Unavailable” is not a product lifecycle state: sellability is
represented by inventory status. This avoids mixing merchandising visibility
with stock availability.

## Application response conventions

The types in `frontend/application/catalog/catalog-contracts.ts` are
transport-neutral. They do not choose routes, status codes, or a server
framework.

- Category list success: `{ data: Category[] }`, containing ordered roots.
- Category detail success: `{ data: Category }`.
- Product list success:
  `{ data: ProductSummary[], pagination: { page, pageSize, total, hasNext } }`.
- Product detail success: `{ data: Product }`.
- Failure:
  `{ error: { code: "not_found" | "invalid_request" |
  "temporarily_unavailable", message } }`.

An empty list is successful `data: []`; for products its pagination has
`total: 0` and `hasNext: false`. A missing detail is a `not_found` error, not a
nullable successful entity.

Product pagination is one-based and page-number based. `page` and `pageSize`
must be positive integers; `total` is a non-negative integer. Cursor
pagination, sorting, filters, transport status codes, and default page size are
deferred until a demonstrated requirement or the implementing dummy API task.

## Dummy category API implementation

S4-T04 implements `GET /api/categories` as a Next.js App Router route:

- no request body, query parameters, credentials, or authentication
- `200` with `{ data: Category[] }` for successful retrieval
- ordered root categories with all descendants recursively nested
- `500` with the stable `temporarily_unavailable` error when category loading
  fails unexpectedly
- shared transport mapping also maps stable `invalid_request` to `400` and
  `not_found` to `404`; the collection endpoint currently produces neither
  because it accepts no input and performs no detail lookup

The route is force-static and deterministic. It uses
`getCategoryCollection` → `CategoryRepository` → the existing
`StaticCategoryRepository` → approved category records. The handler never
imports fixture records. Existing storefront pages still use their current
static composition directly; API repository/UI integration remains S4-T09.

This is dummy development data, not a Zoho representation. A future repository
may replace the static implementation without changing the application result
or public response contract.

## Dummy product collection implementation

S4-T05 implements `GET /api/products` as a query-aware Next.js App Router
route:

- supported query parameters: positive integer `page` and `pageSize`
- defaults: `page=1`, `pageSize=12`
- success:
  `{ data: ProductSummary[], pagination: { page, pageSize, total, hasNext } }`
- a page beyond the catalog returns successful empty `data` with the requested
  page metadata and `hasNext: false`
- malformed, duplicate, unsafe-integer, or unsupported query parameters return
  `400` with `invalid_request`
- unexpected product loading failures return sanitized `500` with
  `temporarily_unavailable`

The route is dynamic because output varies by query, but ordering and results
are deterministic. `getProductCollection` owns slicing and summary mapping:

```text
GET /api/products
  → getProductCollection
    → ProductRepository
      → StaticProductRepository
        → approved 12-product records
```

The route does not access fixtures and never returns product `variants`.
Category relationships remain `categoryIds`; the category tree is not
duplicated. Filtering, search, sorting, and UI/API integration are
intentionally deferred.

## Dummy product detail implementation

S4-T06 implements `GET /api/products/{slug}` as a Next.js App Router route:

- lookup key is the public SEO slug already used by `/p/{slug}`
- no request body, credentials, authentication, or supported query parameters
- `200` with `{ data: Product }` for an existing slug
- `404` with `not_found` for a well-formed unknown slug
- `400` with `invalid_request` for invalid slug syntax or unsupported query
  parameters
- unexpected product loading failures return sanitized `500` with
  `temporarily_unavailable`

The route is dynamic because output varies by slug, but lookups are
deterministic. `getProductDetail` owns slug validation and the detail envelope:

```text
GET /api/products/{slug}
  → getProductDetail
    → ProductRepository.getBySlug
      → StaticProductRepository
        → approved 12-product records
```

The response is the full product, including empty `variants` where no confirmed
option data exists. Unknown SKU, UOM, pricing, and inventory remain null.
Category relationships remain `categoryIds`. The storefront PDP at `/p/{slug}`
does not fetch this endpoint; UI/API integration remains S4-T09. S4-T08
finalized pricing/inventory invariants without populating fixture commerce
values.

## IDs and SEO slugs

IDs identify entities and relationships inside application contracts. Slugs
identify public storefront resources:

```text
future Zoho item_id
  → adapter-owned identity mapping
  → Mini Mystiq product.id
  → Mini Mystiq product.slug
  → /p/{product-slug}
```

The same rule applies to `/c/{category-slug}`. A provider ID must never silently
become a public URL segment. Product IDs and slugs are independently unique;
valid values need not be equal.

## Invariants

Current runtime validation enforces:

- category IDs and routing slugs are unique, parents exist, and hierarchy has
  no cycles
- catalog slugs use the existing lowercase hyphenated slug rule
- product IDs and slugs are unique across a product catalog
- category IDs and variant IDs are unique within their scopes
- variant attribute names are non-empty and unique per variant; values are
  non-empty
- variant attribute combinations are unique per product regardless of
  attribute order or name casing
- optional SKU and UOM values are null or non-empty
- money is a finite, non-negative major-unit number; currency is a three-letter
  uppercase code; current and compare-at currencies match
- when both current and compare-at amounts are valid, compare-at must not be
  less than the current price
- represented inventory quantities are null or non-negative integers; null is
  distinct from zero
- known reserved/available quantities must not exceed on-hand, including their
  sum; availability status must not contradict a known sellable quantity
- pagination values are valid integers

External adapters remain responsible for parsing untrusted DTOs before mapping
and applying these application invariants.

## Intentionally deferred

S4-T03 does not implement API routes, select an HTTP runtime, alter repository
bindings, call Zoho, create persistence, or add commerce behavior.

S4-T04–S4-T06 implemented dummy category/product collection and detail
responses. S4-T07 confirmed the generic variant attribute model without
populating fixture option values. S4-T08 finalized pricing and inventory
invariants without inventing catalog prices, stock, SKU, or availability.
S4-T09 will introduce the repository swap; S4-T10 owns rendered
loading/error/empty states. Actual Zoho DTOs, authentication, and mapping
belong to Sprint 7.
