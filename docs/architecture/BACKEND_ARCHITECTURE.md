# Backend Architecture

Production backend. **Not started.** Scheduled for Sprint 6. Sprint 4 dummy API
work must not be mistaken for this production backend.

---

## Stack (decided)

| Item | Choice |
|------|--------|
| Language | Python |
| HTTP | FastAPI |
| Database | PostgreSQL |
| Shape | **Modular monolith** (ADR 0003) |

ORM and migrations: **TBD** in Sprint 6. S4-T03 defined transport-neutral
storefront domain and response contracts. S4-T04 selected Next.js route
handlers for the development dummy API only. Production versioning, endpoint
paths, and transport status-code mapping remain future decisions.

ADR 0005 requires raw dummy and Zoho DTOs to remain behind infrastructure
mappers.

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
- Schema via migrations (tool TBD in Sprint 6 planning)
- **Only** backend infrastructure talks to Postgres
- Next.js never uses a DB driver
- Undecided columns stay TBD — do not invent catalog fields

---

## API boundary

The Mini Mystiq-owned API contract was defined before implementation in S4-T03.
Version/prefix are TBD; `/api/v1/` is only a prior proposal.

The implemented dummy endpoints are `GET /api/categories`, paginated
`GET /api/products`, and `GET /api/products/{slug}` in Next.js. They do not
imply that the production FastAPI URL prefix or deployment topology is fixed.

Frontend `Http*Repository` implementations consume this API from the storefront.
Pages/components do not consume transport DTOs directly.

CORS, rate limits, auth: TBD Sprint 6/8.

## Dummy and Zoho adapters

- S4-T04–S4-T06: dummy catalog APIs implementing the stable S4-T03 contract.
- S7: Zoho POS transport DTOs, mappings, and repository adapters.
- Dummy payloads may resemble verified Zoho responses inside infrastructure,
  but Zoho field names/nullability/identifiers do not become UI contracts.
- No real Zoho calls in CI.

---

## Admin

- Same application/domain modules as the public API where practical
- Admin UI host and schedule TBD
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
