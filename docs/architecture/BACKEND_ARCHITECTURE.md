# Backend Architecture

Phase 2. **Not started.** Do not implement during Phase 1.

## Stack

Python + FastAPI + PostgreSQL.

## Intended flow

```
FastAPI routers (validation, status codes, auth dependencies)
  → Application services / use cases
  → Domain
  → Repository interfaces
  → PostgreSQL implementation
```

## Rules

- Routers stay thin.
- Domain does not import FastAPI or SQLAlchemy/SQL drivers (ORM choice TBD).
- Schema changes use migrations (tool TBD in S5-T02).
- Frontend never accesses PostgreSQL directly.

## API boundary

- Versioning strategy TBD in Sprint 5 (proposal: `/api/v1/...` — not approved until S5-T04).
- Error envelope TBD in Sprint 5.
- CORS, auth, and rate limits TBD.

## Admin

Admin modules consume the same application services where practical. Admin UI technology is **TBD** (options: Next.js admin app vs separate UI — decide via ADR in Phase 2).

Planned modules: `docs/requirements/ADMIN_REQUIREMENTS.md`.

## Persistence

PostgreSQL is the system of record for products, categories, UOM, inventory, carts, orders, customers, users, and audit logs once those sprints land.

Exact schema is **TBD**.
