# Architecture Decision Records

Significant architectural changes must be documented here before implementation.

## When to write an ADR

- Framework or routing model change (e.g. App Router vs Pages)
- Layering or repository pattern change
- Phase 1 ↔ Phase 2 integration change
- Auth model, database access from the frontend, or new major vendor
- Anything that would force a storefront rewrite

## Format

Each ADR file: `NNNN-short-title.md`

Suggested sections:

- Status: Proposed | Accepted | Superseded
- Date
- Context
- Decision
- Consequences

## Current ADRs

| ID | Title | Status |
|----|--------|--------|
| [0001](0001-storefront-design-option-1.md) | Storefront Design Option 1 | Accepted |
| [0002](0002-nextjs-app-router-server-components.md) | App Router + Server Components | Accepted |
| [0003](0003-modular-monolith-backend.md) | Modular monolith backend | Accepted |
| [0004](0004-repository-swap-static-to-http.md) | Static → HTTP repository swap | Accepted |
| [0005](0005-stable-storefront-contracts-and-zoho-adapter.md) | Stable storefront contracts and Zoho adapter boundary | Accepted |

Baseline architecture in `docs/architecture/` was established during S1-T01.
FastAPI/PostgreSQL remain the planned production-backend stack. ADR 0005 records
the revised dummy-API timing and vendor-isolation boundary.
