# Backend Architecture

Phase 2. **Not started.** Do not implement in Phase 1.

---

## Stack (decided)

| Item | Choice |
|------|--------|
| Language | Python |
| HTTP | FastAPI |
| Database | PostgreSQL |
| Shape | **Modular monolith** (ADR 0003) |

ORM, migrations, and API error envelope: **TBD** in Sprint 5 (then ADR if needed).

---

## Modular monolith (not microservices)

One FastAPI process. One PostgreSQL database. Multiple **modules** with clear domain boundaries:

```
backend/
  app/
    api/                      # HTTP only: /api/v1/...
      catalog/
      inventory/
      ordering/
      identity/
    modules/
      catalog/
        domain/
        application/
        infrastructure/       # SQL repositories
      inventory/
      ordering/
      identity/
      audit/
    shared/                   # config, errors, auth dependencies
```

Modules may call each other only through **application** APIs, not by importing another module’s SQL models.

This allows a later split into services **without** designing microservices now.

---

## Request flow

```
FastAPI router (validate, status codes, auth dependency)
  → Application use case
    → Domain
    → Repository interface
      → PostgreSQL implementation
```

Routers do not contain business rules and do not import ORM models.

---

## PostgreSQL boundary

- System of record for catalog, UOM, inventory, carts, orders, customers, users, audit (as those sprints land)
- Schema via migrations (tool TBD S5-T02)
- **Only** backend infrastructure talks to Postgres
- Next.js never uses a DB driver
- Undecided columns stay TBD — do not invent catalog fields

---

## API boundary

Proposal for Sprint 5 (not implemented): `/api/v1/`. Confirm in S5-T04 + ADR.

Frontend `Http*Repository` is the only consumer of this API from the storefront.

CORS, rate limits, auth: TBD Sprint 5/8.

---

## Admin

- Same application/domain modules as the public API where practical
- Admin UI host TBD (ADR in S6-T04): Next.js app vs separate
- Desktop-priority, responsive, `noindex`, auth + RBAC (Sprint 8)
- Planned modules: `docs/requirements/ADMIN_REQUIREMENTS.md`

---

## Testing

- Use-case tests with fake repositories
- API tests for routes and error shape
- Repository tests against a documented DB strategy (Sprint 5)

---

## Security

- Secrets in env, never Git
- Authn/authz at the API edge
- Audit log for admin mutations (Sprint 8)
- No password/PII in logs
