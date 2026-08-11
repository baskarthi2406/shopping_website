# Sprint 0 — Project Control

| Field | Value |
|-------|--------|
| Sprint ID | S0 |
| Phase | Bootstrap |
| Objective | Create the documentation and project-control foundation |
| Status | COMPLETED |
| Dependencies | None |

---

## S0-T01 — Initialize Project-Control Documentation

**Status:** COMPLETED

### Objective

Create complete project-control files, docs tree, sprint catalog, Cursor rules, and frontend/backend README placeholders so future AI sessions can continue from Git alone.

### Dependencies

None.

### Requirements

- Documentation and project-control only
- Repository root remains `shopping/`
- No application code, Next.js init, npm install, FastAPI, or database code

### Implementation scope

Rewrite/create control files; create `docs/`, `.cursor/rules/`, `frontend/README.md`, `backend/README.md`.

### Expected files/modules

- `PROJECT_DEVELOPMENT_RULES.md`
- `PROJECT_STATUS.md`
- `SPRINT_STATUS.md`
- `CURRENT_TASK.md`
- `README.md`
- `docs/project/*`, `docs/architecture/*`, `docs/requirements/*`, `docs/decisions/*`
- `docs/sprints/SPRINT-00.md` … `SPRINT-11.md`
- `.cursor/rules/*.mdc`
- `frontend/README.md`, `backend/README.md`

### Acceptance criteria

- Required files exist and are consistent
- Rules cover continuation, Cursor, SOLID, clean architecture, Next.js, FastAPI, SEO, testing, Git, sprints, DoD, no auto-next-task, status updates
- No future task marked completed
- No application code created

### Testing requirements

Manual validation: file inventory, consistency check, confirm no `package.json`, no Python app, no Next.js config.

### Definition of Done

Acceptance criteria met; after validation, S0-T01 marked COMPLETED; next task recorded as S1-T01 and **not** started.
