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

Planned evolution: add dummy HTTP repositories in Sprint 4, production
repositories in Sprint 6, and Zoho adapters in Sprint 7. Bind implementations
in `config/catalog.ts` (ADR 0004/0005). Keep raw API/vendor DTOs in
infrastructure and do not add FastAPI here.
