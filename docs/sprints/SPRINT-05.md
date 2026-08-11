# Sprint 5 — FastAPI Backend Foundation

| Field | Value |
|-------|--------|
| Sprint ID | S5 |
| Phase | Phase 2 — Backend + Admin |
| Objective | FastAPI app, PostgreSQL, backend layers, API contract, frontend API repository adapter |
| Status | NOT_STARTED |
| Dependencies | Sprint 4 completed |

Do not start this sprint during Phase 1.

---

## S5-T01 — Initialize FastAPI Project

**Status:** NOT_STARTED

### Objective

Create the Python FastAPI application skeleton in `backend/` with a health route.

### Dependencies

Sprint 4 completed; explicit start of Phase 2.

### Requirements

Python + FastAPI. No product domain yet beyond health. Dependency/lock tooling **TBD** in this task (document choice).

### Implementation scope

Backend project files, health endpoint, `backend/README.md` run instructions.

### Expected files/modules

- FastAPI app entry
- Dependency manifest
- README

### Acceptance criteria

- Health endpoint returns success
- No Next.js rewrite
- No business tables required yet

### Testing requirements

API test for health.

### Definition of Done

Backend runs locally as documented.

---

## S5-T02 — PostgreSQL Bootstrap and Migrations

**Status:** NOT_STARTED

### Objective

Connect PostgreSQL and establish a migration tool (choice **TBD** in this task).

### Dependencies

S5-T01.

### Requirements

No invented business schema beyond a migrations baseline (empty or health/meta). Credentials via env, not Git.

### Implementation scope

DB config, migration tool, sample env file without secrets.

### Expected files/modules

- Migration directory
- DB config module
- `.env.example`

### Acceptance criteria

- Migration runs against local Postgres (documented)
- Secrets not committed

### Testing requirements

Documented migration command; optional smoke test.

### Definition of Done

Migrations pipeline exists.

---

## S5-T03 — Backend Clean Architecture Layers

**Status:** NOT_STARTED

### Objective

Create domain/application/infrastructure/api package layout matching architecture docs.

### Dependencies

S5-T01.

### Requirements

Routers do not import SQL models directly once repositories exist.

### Implementation scope

Packages + a sample pattern (e.g. health as a use case) if useful.

### Expected files/modules

- Backend layer packages
- `docs/architecture/BACKEND_ARCHITECTURE.md` updated as implemented

### Acceptance criteria

- Layout documented and present
- No catalog API required yet (that is Sprint 6)

### Testing requirements

Import/structure tests or a trivial service test.

### Definition of Done

Layers exist.

---

## S5-T04 — API Versioning and Error Model

**Status:** NOT_STARTED

### Objective

Decide and implement API prefix and error envelope. Write an ADR.

### Dependencies

S5-T03.

### Requirements

Do not silently pick breaking formats later. Document in ADR.

### Implementation scope

ADR + exception handlers + versioned router prefix.

### Expected files/modules

- `docs/decisions/` ADR
- Error handler
- Versioned routes

### Acceptance criteria

- Health lives under the versioned prefix (or documented exception)
- Errors return the documented shape

### Testing requirements

API tests for error shape (e.g. 404/validation).

### Definition of Done

ADR accepted in-repo; handlers live.

---

## S5-T05 — Backend Config and Operational Health

**Status:** NOT_STARTED

### Objective

Typed config from environment; readiness vs liveness **TBD** — at least DB-aware readiness or documented deferral.

### Dependencies

S5-T02, S5-T04.

### Requirements

No secrets in repo. Fail fast on missing required config in non-dev **TBD**.

### Implementation scope

Config module + health/readiness as decided.

### Expected files/modules

- Config
- Health/readiness endpoints

### Acceptance criteria

- App reads DB URL from env
- README lists required variables

### Testing requirements

Config unit tests with dummy env.

### Definition of Done

Config documented.

---

## S5-T06 — Frontend HTTP Repository Adapter

**Status:** NOT_STARTED

### Objective

Add a frontend repository implementation that calls FastAPI while keeping use-case interfaces stable. Default Phase 2 wiring **TBD** (env flag mock vs API).

### Dependencies

S5-T04; catalog API may still be stub/empty until Sprint 6 — if so, adapter targets health or a stub catalog and Sprint 6 switches to real product endpoints.

### Requirements

UI must not change use-case signatures. Do not access PostgreSQL from Next.js.

### Implementation scope

HTTP client + repository impl + env flag. If product API is not ready, document adapter as skeleton and complete in S6.

### Expected files/modules

- Frontend `HttpProductRepository` (or skeleton)
- Env example
- Architecture note

### Acceptance criteria

- Application layer still depends on interfaces
- Mock repo remains available behind a flag until APIs exist
- No storefront rewrite

### Testing requirements

HTTP repo tests with a mocked fetch.

### Definition of Done

Adapter pattern in place; catalog API completion may continue in Sprint 6.
