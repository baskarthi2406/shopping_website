# ADR 0003 — Modular monolith backend

- **Status:** Superseded by ADR 0006 (2026-09-29, S6-T02). No FastAPI service
  or PostgreSQL database will be built under this ADR; it is kept for history.
- **Date:** 2026-08-11

Schedule revised by S4-T01: production backend work now starts in Sprint 6.
ADR 0005 adds the Zoho adapter boundary; it does not change the modular-monolith
decision.

## Context

The planned production backend introduces FastAPI + PostgreSQL. Microservices
would add operational cost before the domain is proven. Domain boundaries still
matter so modules can evolve.

## Decision

Build the backend as a **modular monolith**:

- One FastAPI application
- One PostgreSQL database
- Internal modules: catalog, inventory, ordering, identity, audit, …
- Module code: domain / application / infrastructure
- No separate microservice deployables unless a future ADR says so

## Consequences

- Sprint 6 scaffolds one Python project, not many services.
- Modules must not share ORM models across boundaries.
- A later extract of a module into a service is possible; it is **not** the starting architecture.
