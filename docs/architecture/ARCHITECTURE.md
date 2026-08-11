# Target Architecture

Status: **proposed baseline** for Phase 1. S1-T01 will refine this document. Significant changes require an ADR.

---

## Goals

- SEO-first public storefront
- SOLID and clean separation of concerns
- Testable domain and application layers
- Replace Phase 1 static repositories with Phase 2 API repositories without rewriting the UI

---

## Evolution

### Phase 1

```
Next.js
  ↓
Domain / Application abstractions
  ↓
Repository interface
  ↓
Static / mock data
```

### Phase 2

```
Next.js
  ↓
API client (frontend infrastructure implementing the same repository interface)
  ↓
FastAPI
  ↓
Application / Domain
  ↓
Repository
  ↓
PostgreSQL
```

The frontend application layer must depend on **interfaces**, not on mock files or HTTP clients.

---

## Layers

| Layer | Responsibility |
|-------|----------------|
| Interface | Next.js pages/layouts (Phase 1); FastAPI routers (Phase 2) |
| Application | Use cases (list products, get product, cart operations) |
| Domain | Entities, value objects, catalog/cart rules that do not depend on frameworks |
| Infrastructure | Mock JSON, API clients, ORM, mail, payment adapters |

## Boundaries

- Domain must not import Next.js, React, FastAPI, SQL, or Tailwind.
- UI must not query PostgreSQL or read ad-hoc JSON except through a repository.
- Admin is Phase 2 and must not be built in the Phase 1 storefront except as documented later.

## Repository abstraction

Each aggregate (Product, Category, and later Cart/Order/Customer) is accessed through a repository interface defined in the application or domain layer.

Phase 1: `StaticProductRepository`  
Phase 2: `HttpProductRepository` (frontend) + `SqlProductRepository` (backend)

## TBD

- Exact folder names inside `frontend/` (decide in S1-T01 / S1-T04)
- Backend package layout (decide in Sprint 5)
- Auth, caching, and CMS (not Phase 1)

See also:

- `FRONTEND_ARCHITECTURE.md`
- `BACKEND_ARCHITECTURE.md`
