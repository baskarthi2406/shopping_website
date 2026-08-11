# Application

Use cases / services. Orchestration and mapping: domain → view models for pages.

**May depend on:** domain, repository **interfaces**.

**Must not depend on:** `react`, `next`, presentation, static JSON, infrastructure implementations.

## Repository interfaces

Contracts such as `ProductRepository`, `CategoryRepository`, `UomRepository`, and later `CartRepository` live **next to these use cases** (S1-T02 §2.6).

There is **no** top-level `frontend/repositories/` tree. Implementations belong in `infrastructure/`.

| Folder | Later contents |
|--------|----------------|
| `catalog/` | GetProductBySlug, list/search/featured; product/category/uom ports |
| `cart/` | Add/update/remove/read cart |
| `seo/` | Metadata, canonical, JSON-LD builders invoked from `generateMetadata` |

Do not implement complete services in S1-T04. S1-T05 adds catalog ports and static data.
