# `infrastructure/catalog`

Phase 1 static catalog (S1-T05): `StaticProductRepository`, `StaticCategoryRepository`, `StaticUomRepository`.

Raw records live in `data/`. Mappers produce domain models. UI and `app/` must not import this folder or `data/`.

S4-T02 category records contain the supplied customer taxonomy as flat
`parentId` relationships. `mapCategories` derives recursive children and
rejects duplicate ids, unknown parents, and cycles. Empty categories are valid.

S4-T03 static product mapping now preserves unknown commerce data as null and
missing variants as `[]`; it does not synthesize SKU, UOM, pricing, inventory,
or default variants. Future external DTO parsing and mapping stays in this
layer and must satisfy the domain validators.

S4-T04 reuses `StaticCategoryRepository` as the dummy category data source for
`GET /api/categories`. This avoids a duplicate repository or taxonomy while
the existing UI remains bound to the same static implementation.

S4-T05 similarly reuses `StaticProductRepository` and the 12 approved product
records for `GET /api/products`. Pagination and summary mapping remain in the
application layer; infrastructure does not create API response envelopes.

S4-T06 reuses the same repository `getBySlug` path for
`GET /api/products/[slug]`. Detail envelope construction stays in the
application layer.

Planned evolution: S4-T09 added `HttpProductRepository` and
`HttpCategoryRepository` plus a provider-neutral catalog API client. Dummy
route handlers still use the static repositories through `catalogSource`.
Production repositories arrive in Sprint 6 and Zoho adapters in Sprint 7.
Bind implementations in `config/` (ADR 0004/0005). Keep raw API/vendor DTOs in
infrastructure and do not add FastAPI here.
