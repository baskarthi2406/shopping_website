# Backend

Phase 2 API and persistence for the Baby Clothes & Toys project.

## Planned stack

- Python
- FastAPI
- PostgreSQL

## Current state

**Backend implementation has NOT started.**

This directory contains documentation only. Do **not** create FastAPI apps, Python packages, Docker files, or database schemas until Phase 2 (Sprint 5+) and the current task explicitly requires it.

## Architecture intent

```
Next.js
  → API client (frontend infrastructure)
  → FastAPI (HTTP boundary)
  → Application / Domain
  → Repository
  → PostgreSQL
```

Route handlers must stay thin. Domain rules must not live in FastAPI routers or ORM models.

## Rules

- Follow `PROJECT_DEVELOPMENT_RULES.md` and `.cursor/rules/backend.mdc`.
- Phase 1 must not implement this backend.
- Admin APIs belong to Phase 2.

Details: `docs/architecture/BACKEND_ARCHITECTURE.md`.
