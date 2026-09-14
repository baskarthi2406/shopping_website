# `application/catalog`

Catalog use cases and repository interfaces (S1-T05).

**Ports:** `ProductRepository`, `CategoryRepository`, `UomRepository`.

**Use cases:** get/list products and categories; `getCategoryPage` (S2-T01) returns category + products or `null`; `getProductPage` (S2-T03) returns product + known categories or `null`. View-model mappers: `toCategoryPageViewModel`, `toProductPageViewModel`, `toCatalogNavItems` (S2-T04). No search, pricing, or inventory engines.

Depends on domain + these interfaces only. Bind implementations in `config/`.
Storefront pages use `config/catalog.ts` (HTTP repositories). Dummy API routes
use `config/catalog-source.ts` (static repositories).

**S4-T01 audit:** retain all ports/use cases. They are the clean swap boundary
for static, dummy API, production, and Zoho-backed repositories.

**S4-T02:** `toCatalogNavItems` selects visible, menu-enabled roots and maps
recursive domain children to `/c/{slug}` navigation view models. It contains no
customer taxonomy constants.

**S4-T03:** `catalog-contracts.ts` defines transport-neutral collection, detail,
pagination, and error envelopes. Category lists are ordered recursive trees;
product lists contain `ProductSummary` plus minimal page pagination; details
contain full products. Dummy/Zoho DTOs must not be added here.

**S4-T04:** `getCategoryCollection` obtains categories through
`CategoryRepository`, selects ordered roots, and returns the S4-T03 collection
envelope. Repository failures propagate to the HTTP adapter for safe mapping.

**S4-T05:** `getProductCollection` obtains the stable repository order, applies
one-based page slicing, maps only `ProductSummary`, and returns the S4-T03
pagination envelope. Default page/page size are 1/12 at the API boundary.

**S4-T06:** `getProductDetail` looks up one product by public SEO slug and
returns the S4-T03 detail envelope or `not_found`. Invalid catalog-slug syntax
is `invalid_request`. Repository failures propagate to the HTTP adapter.

Full semantics: `docs/architecture/STOREFRONT_CONTRACTS.md`.
