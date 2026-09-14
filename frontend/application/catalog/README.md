# `application/catalog`

Catalog use cases and repository interfaces (S1-T05).

**Ports:** `ProductRepository`, `CategoryRepository`, `UomRepository`.

**Use cases:** get/list products and categories; `getCategoryPage` (S2-T01) returns category + products or `null`; `getProductPage` (S2-T03) returns product + known categories or `null`. View-model mappers: `toCategoryPageViewModel`, `toProductPageViewModel`, `toCatalogNavItems` (S2-T04). No search, pricing, or inventory engines.

Depends on domain + these interfaces only. Bind implementations in
`config/catalog.ts`.

**S4-T01 audit:** retain all ports/use cases. They are the clean swap boundary
for static, dummy API, production, and Zoho-backed repositories.

**S4-T02:** `toCatalogNavItems` selects visible, menu-enabled roots and maps
recursive domain children to `/c/{slug}` navigation view models. It contains no
customer taxonomy constants. API/transport contracts remain S4-T03; transport
and Zoho DTOs must not be added here.
