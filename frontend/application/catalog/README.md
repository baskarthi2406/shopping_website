# `application/catalog`

Catalog use cases and repository interfaces (S1-T05).

**Ports:** `ProductRepository`, `CategoryRepository`, `UomRepository`.

**Use cases:** get/list products and categories; `getCategoryPage` (S2-T01) returns category + products or `null`. View-model mappers: `toCategoryPageViewModel`. No search, pricing, or inventory engines.

Depends on domain + these interfaces only. Bind implementations in `config/catalog.ts`.
