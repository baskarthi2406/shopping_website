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

None yet.

Baseline architecture in `docs/architecture/` is a **proposed** starting point. S1-T01 may promote or amend it; if S1-T01 changes a decided stack item (Next.js, FastAPI, PostgreSQL), write an ADR.
