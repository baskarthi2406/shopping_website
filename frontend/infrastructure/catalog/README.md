# `infrastructure/catalog`

Phase 1 static catalog (S1-T05): `StaticProductRepository`, `StaticCategoryRepository`, `StaticUomRepository`.

Raw records live in `data/`. Mappers produce domain models. UI and `app/` must not import this folder or `data/`.

Phase 2: replace these classes in `config/catalog.ts` with API repositories (ADR 0004). Do not add FastAPI here.
