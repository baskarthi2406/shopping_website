# Current Task

Only this task may be implemented. Do not start it until a human explicitly requests S1-T05.

---

## Last completed task

| Field | Value |
|-------|--------|
| Task ID | S1-T04 |
| Task | Establish Frontend Project Structure |
| Status | **COMPLETED** |
| Scope | Layer folders and boundary READMEs under `frontend/`. No catalog, cart, or storefront UI. No FastAPI. |

---

## Task ID

S1-T05

## Task

Repository Interfaces and Static Data Source

## Status

**NOT_STARTED**

Do **not** implement S1-T05 automatically.

## Objective

Define product/category repository interfaces and a static/mock implementation with minimal sample data.

## Scope

See `docs/sprints/SPRINT-01.md` → S1-T05. Interfaces in application/domain, not in UI. Placeholder catalog only. No HTTP backend.

## Dependencies

S1-T04.

## Requirements

See `docs/sprints/SPRINT-01.md` → S1-T05. UI must not import fixture files. Same use-case signatures must survive a later API repository.

## Acceptance criteria

See `docs/sprints/SPRINT-01.md` → S1-T05.

## Tests

Unit tests for the static repository (list/get by slug or id). Full test runner is S1-T06 if not yet present.

## Definition of Done

See `docs/sprints/SPRINT-01.md` → S1-T05.

## Next task after S1-T05 (do not start)

S1-T06 — Configure Linting and Unit Tests
