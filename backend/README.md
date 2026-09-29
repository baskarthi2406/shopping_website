# Backend

Planned production API and persistence for Mini Mystiq.

## Planned stack

- Python
- FastAPI
- PostgreSQL

## Current state

**Backend implementation has NOT started. S4-T01 verified this directory is
documentation-only.**

This directory contains documentation only. Do **not** create FastAPI apps,
Python packages, Docker files, or database schemas until Sprint 6 and the
current task explicitly requires it.
Production backend work is now scheduled for Sprint 6. Sprint 4 dummy API tasks
do not authorize Python/PostgreSQL implementation here. S4-T03 kept the
storefront contract transport-neutral and did not select this directory as the
dummy API runtime.

## Architecture intent

```
Next.js
  → Mini Mystiq application/API contract
  → dummy adapter (Sprint 4 development)
  → FastAPI production boundary (Sprint 6)
  → Application / Domain
  → Repository
  → PostgreSQL and/or Zoho adapter as explicitly designed
```

Route handlers must stay thin. Domain rules must not live in FastAPI routers or ORM models.

## Rules

- Follow `PROJECT_DEVELOPMENT_RULES.md` and `.cursor/rules/backend.mdc`.
- Sprint 4 dummy API work must not implement this production backend.
- Zoho integration belongs to Sprint 7 and must stay behind adapters (ADR 0005).
- Admin/API operations remain TBD in the revised roadmap.

Details: `docs/architecture/BACKEND_ARCHITECTURE.md` and
`docs/architecture/BACKEND_API_AUDIT.md`.
