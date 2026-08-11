# Infrastructure

Concrete adapters. Implements application repository interfaces. Maps raw static/API records → domain.

**May depend on:** domain, repository interfaces.

**Must not depend on:** `app/` pages, presentation components.

| Folder | Phase 1 | Phase 2 |
|--------|---------|---------|
| `catalog/` | `Static*Repository` + fixtures (S1-T05) | `Api*Repository` + HTTP client |
| `cart/` | Browser storage adapter (Sprint 4) | HTTP cart repository (Sprint 7) |

Do not add FastAPI, PostgreSQL, or HTTP clients in Phase 1. Do not implement the static catalog in S1-T04.
