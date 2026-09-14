# Stable Storefront Contracts

**Status:** Implemented by S4-T03
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

Each `VariantAttribute` is a `name`/`value` pair. Size, color, age range, or a
future item-group option uses the same structure; option names and values are
not hardcoded into domain types.

SKU may be product-level, variant-level, both when a provider legitimately
supplies both concepts, or absent. `Uom` is a nullable product-level
`code`/`label` value. Provider-specific SKU and unit fields require adapter
mapping.

## Pricing

`Pricing` contains a current `price` and nullable `compareAtPrice`. Each `Money`
contains a non-negative numeric `amount` and three-letter uppercase `currency`.

The current price can represent a sale price when reference pricing exists.
There is no separate discount percentage, tax behavior, currency conversion,
or discount calculation. Those policies are not approved requirements.
Product and variant pricing are independently nullable.

## Inventory and status

`Inventory` is a nullable snapshot containing nullable `stockOnHand`,
`availableToSell`, and `reserved` quantities plus `status`:
`unknown`, `in_stock`, or `out_of_stock`.

Quantities are capabilities, not promises that every provider supplies all
three. The contract does not calculate availability, reserve stock, synchronize
inventory, or enforce relationships among provider quantities.

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
- optional SKU and UOM values are null or non-empty
- money is finite and non-negative; current/reference currencies match
- represented inventory quantities are finite and non-negative
- pagination values are valid integers

External adapters remain responsible for parsing untrusted DTOs before mapping
and applying these application invariants.

## Intentionally deferred

S4-T03 does not implement API routes, select an HTTP runtime, alter repository
bindings, call Zoho, create persistence, or add commerce behavior.

S4-T04–S4-T06 will implement dummy category/product responses. S4-T07 and
S4-T08 may populate and exercise variant/pricing/inventory behavior without
replacing these provider-independent shapes. S4-T09 will introduce the
repository swap; S4-T10 owns rendered loading/error/empty states. Actual Zoho
DTOs, authentication, and mapping belong to Sprint 7.
