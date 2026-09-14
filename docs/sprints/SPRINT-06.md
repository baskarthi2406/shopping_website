# Sprint 6 — Production Backend

| Field | Value |
|-------|-------|
| Sprint ID | S6 |
| Phase | Phase 2 — Production Backend |
| Objective | Implement the production Mini Mystiq API and persistence behind S4 contracts |
| Status | NOT_STARTED |
| Dependencies | Sprint 5 completed; production requirements approved |
| Task IDs | TBD before Sprint 6 starts |

## Planned scope

- Production API application skeleton, configuration, health, versioning, and
  error contract
- Modular domain/application/infrastructure/API boundaries
- Production persistence and migrations
- Catalog/category/product/variant/pricing/inventory repositories as approved
- Operational security, secrets, logging, and deployment readiness
- Frontend production repository adapter using the stable Mini Mystiq API

FastAPI + PostgreSQL remain the accepted planned stack (ADR 0003) unless a later
ADR changes it.

## Guardrails

- Thin HTTP routers; business rules stay in application/domain code.
- Frontend never accesses the database.
- Do not copy raw dummy or Zoho payload shapes into UI contracts.
- Do not invent schema fields or seed commercial values.
- Auth, admin, order, and checkout scope must be explicitly scheduled before
  implementation.

## Exit criteria

Detailed tasks, migrations/testing strategy, and operational requirements must
be written and approved before Sprint 6 starts. Do not start Sprint 7
automatically.
