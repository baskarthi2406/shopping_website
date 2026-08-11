# ADR 0003 — Modular monolith backend

- **Status:** Accepted
- **Date:** 2026-08-11

## Context

Phase 2 introduces FastAPI + PostgreSQL. Microservices would add operational cost before the domain is proven. Domain boundaries still matter so modules can evolve.

## Decision

Build the backend as a **modular monolith**:

- One FastAPI application
- One PostgreSQL database
- Internal modules: catalog, inventory, ordering, identity, audit, …
- Module code: domain / application / infrastructure
- No separate microservice deployables in Phase 2–5 unless a future ADR says so

## Consequences

- Sprint 5 scaffolds one Python project, not many services.
- Modules must not share ORM models across boundaries.
- A later extract of a module into a service is possible; it is **not** the starting architecture.
