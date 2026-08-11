# Sprint 1 — Foundation & Architecture

| Field | Value |
|-------|--------|
| Sprint ID | S1 |
| Phase | Phase 1 — SEO-First Storefront |
| Objective | Document target architecture and establish the Next.js storefront foundation with clean layers and mock repositories |
| Status | NOT_STARTED |
| Dependencies | S0-T01 completed |

Do not implement these tasks until they are the current task. Do not start S1-T01 automatically after S0-T01.

---

## S1-T01 — Document Target Architecture

**Status:** NOT_STARTED

### Objective

Produce the agreed Phase 1/Phase 2 architecture document: layers, repository abstraction, SEO-first rendering, and evolution path from mock data to API.

### Dependencies

S0-T01 completed.

### Requirements

- Align with `docs/architecture/` and `PROJECT_DEVELOPMENT_RULES.md`
- Do not invent business requirements; mark TBD
- Significant deviations from the decided stack need an ADR

### Implementation scope

Documentation only. Update architecture docs and, if needed, one ADR. No Next.js init.

### Expected files/modules

- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/FRONTEND_ARCHITECTURE.md`
- `docs/architecture/BACKEND_ARCHITECTURE.md`
- `docs/decisions/*` only if a decision changes
- Status files

### Acceptance criteria

- Target architecture is explicit enough to scaffold `frontend/` in later S1 tasks
- Phase 1 vs Phase 2 data flow is documented
- Folder structure proposal is recorded
- No application code

### Testing requirements

Documentation review and consistency with development rules.

### Definition of Done

Docs updated; status files point to S1-T02; S1-T02 not started.

---

## S1-T02 — Document Frontend Layer Boundaries

**Status:** NOT_STARTED

### Objective

Specify domain, application, infrastructure, and UI module boundaries for `frontend/`, including repository interface rules.

### Dependencies

S1-T01.

### Requirements

Clean architecture and SOLID as in project rules. Phase 1 mock repositories; Phase 2 HTTP repositories.

### Implementation scope

Documentation only.

### Expected files/modules

- `docs/architecture/FRONTEND_ARCHITECTURE.md`
- Optional `docs/architecture/FRONTEND_LAYERS.md` if the existing file would become too large

### Acceptance criteria

- Each layer’s allowed dependencies are listed
- Catalog use cases to be implemented in Sprint 2 are named at a high level
- No application code

### Testing requirements

Documentation review.

### Definition of Done

Layer doc accepted in-repo; next task recorded only.

---

## S1-T03 — Initialize Next.js + TypeScript + Tailwind

**Status:** NOT_STARTED

### Objective

Initialize the Next.js application inside `frontend/` with TypeScript and Tailwind CSS.

### Dependencies

S1-T01, S1-T02.

### Requirements

- App lives in `frontend/`
- TypeScript and Tailwind required
- No FastAPI, no extra features (catalog, cart, SEO suite)

### Implementation scope

Official Next.js scaffold in `frontend/` only. Minimal hello/root page. No domain modules yet beyond what the scaffold creates.

### Expected files/modules

- `frontend/package.json`
- Next.js + Tailwind + tsconfig files as generated/adjusted
- `frontend/README.md` updated with run instructions

### Acceptance criteria

- `frontend` dev build starts (documented command)
- TypeScript strictness: do not weaken without an ADR
- No backend code
- No catalog features

### Testing requirements

Document how to run the app. Add a trivial sanity check if the chosen test runner is not yet present (full test setup is S1-T06).

### Definition of Done

Scaffold committed; README run steps work; status updated; next task not started.

---

## S1-T04 — Establish Frontend Project Structure

**Status:** NOT_STARTED

### Objective

Create the agreed domain/application/infrastructure/UI folders and wiring conventions without building catalog pages.

### Dependencies

S1-T03.

### Requirements

Match S1-T01/S1-T02 docs. Page files stay thin.

### Implementation scope

Folders, index barrels if needed, placeholder modules that compile. No product UI.

### Expected files/modules

- `frontend` source directories per architecture doc
- Short structure note in `docs/architecture/FRONTEND_ARCHITECTURE.md` updated to “as implemented”

### Acceptance criteria

- Structure matches documentation
- App still builds
- No FastAPI

### Testing requirements

Build succeeds.

### Definition of Done

Structure exists and is documented as implemented.

---

## S1-T05 — Repository Interfaces and Static Data Source

**Status:** NOT_STARTED

### Objective

Define product/category repository interfaces and a static/mock implementation with minimal sample data.

### Dependencies

S1-T04.

### Requirements

- Interfaces in application/domain, not in UI
- Sample catalog data is placeholder-only (names/slugs TBD as real merchandising)
- No HTTP backend

### Implementation scope

Types, interfaces, static repository, a few fixture products/categories.

### Expected files/modules

- Domain types for Product, Category (fields TBD kept minimal)
- Repository interfaces
- Static repository + fixtures
- Optional thin application query functions

### Acceptance criteria

- UI still does not need to import fixture files directly
- Replacing the static repo later would not change use-case signatures
- No real business catalog claimed as final

### Testing requirements

Unit tests for the static repository (list/get by slug or id).

### Definition of Done

Interfaces + mock impl + tests; status updated.

---

## S1-T06 — Configure Linting and Unit Tests

**Status:** NOT_STARTED

### Objective

Add linting/formatting and a unit test runner for `frontend/`.

### Dependencies

S1-T03 (can proceed after S1-T05 if tests already need a runner; do not skip if S1-T05 added tests via a temporary command).

### Requirements

Tool choices currently **TBD** — select common Next.js-compatible tools in this task and document them in `docs/project/TECH_STACK.md`. Do not add unrelated libraries.

### Implementation scope

ESLint, formatter, unit test runner, npm scripts, brief docs.

### Expected files/modules

- Lint/test config in `frontend/`
- `docs/project/TECH_STACK.md` updated
- Scripts in `package.json`

### Acceptance criteria

- `lint` and `test` scripts documented and succeed on current code
- S1-T05 tests run under the chosen runner

### Testing requirements

The task *is* test infrastructure; prove with existing unit tests green.

### Definition of Done

Tooling documented and green.

---

## S1-T07 — Base Layout, Tokens, Semantic HTML Shell

**Status:** NOT_STARTED

### Objective

Create a minimal accessible layout shell (header/footer landmarks) and Tailwind tokens. No catalog pages.

### Dependencies

S1-T04.

### Requirements

Semantic HTML, keyboard-focusable header links (even if targets are placeholders). Visual brand is **TBD**.

### Implementation scope

Root layout, basic navigation placeholders, CSS tokens. Home page remains a shell, not a merchandising page.

### Expected files/modules

- Root layout and shared shell components
- Tailwind theme tokens (colors **TBD** — use neutral placeholders)

### Acceptance criteria

- Valid landmark structure
- No cart/catalog feature work beyond placeholder nav labels
- Crawlable document shell (real `<header>`, `<main>`, `<footer>`)

### Testing requirements

Lint + build. Optional simple render test of the layout.

### Definition of Done

Shell merged; no Sprint 2 catalog scope included.

---

## S1-T08 — Foundation Review and Documentation Sync

**Status:** NOT_STARTED

### Objective

Review Sprint 1 against architecture docs; sync README and architecture “as implemented”; confirm Phase 2 code was not introduced.

### Dependencies

S1-T03 through S1-T07.

### Requirements

Documentation accuracy. No new features.

### Implementation scope

Docs and small structural fixes only.

### Expected files/modules

- `README.md`, `docs/architecture/*`, `frontend/README.md`
- Status files

### Acceptance criteria

- Docs match the repo
- No backend implementation
- Sprint 1 tasks either completed or explicitly blocked with reason

### Testing requirements

Lint, unit tests, build.

### Definition of Done

Sprint 1 marked completed in status files only after this task; next recorded task is S2-T01, not started.
