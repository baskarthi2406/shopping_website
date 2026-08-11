# Project Development Rules

This file is binding. Cursor and any future AI session must follow it.

---

## 1. Source of Truth

The Git repository is the **permanent source of truth**.

The AI must **never** rely on previous ChatGPT (or other) conversation history.

The repository documentation and source code are the source of truth.

Do not invent project state from memory. If documentation and code disagree, stop and report the inconsistency before changing anything.

---

## 2. AI Continuation Protocol

A new conversation must be able to continue this project using **only** the repository.

Continuation order:

1. `PROJECT_DEVELOPMENT_RULES.md`
2. `PROJECT_STATUS.md`
3. `SPRINT_STATUS.md`
4. `CURRENT_TASK.md`
5. Relevant architecture documentation under `docs/architecture/`
6. Relevant requirements under `docs/requirements/`
7. Relevant sprint/task specification under `docs/sprints/`
8. Applicable Cursor rules under `.cursor/rules/`
9. Existing source code

After reading those files, determine:

- Current phase
- Current sprint
- Current task
- Task status
- Blockers
- What must **not** be built yet (especially Phase 2+ work during Phase 1)

If status files are missing, empty, or contradictory, **do not start implementation**. Report the gap and wait for confirmation.

---

## 3. New ChatGPT Conversation Protocol

When a new ChatGPT or Cursor conversation starts:

1. Read the files listed in Section 2.
2. Summarize current phase, sprint, and task from the files — not from prior chat.
3. Work **only** on the task in `CURRENT_TASK.md`.
4. Do not resume “remembered” work from an old conversation.
5. Do not skip documentation updates.
6. Do not start the next task when the current task completes.

---

## 4. Cursor Development Protocol

Cursor is the implementation tool.

- Follow `.cursor/rules/` in addition to this file.
- Cursor rules must not contradict this file. If they do, this file wins; report the conflict.
- Prefer small, reviewable diffs limited to the current task.
- Do not generate application code for documentation-only tasks.
- Do not install packages or scaffold frameworks unless the current task explicitly requires it.

---

## 5. Task Execution Rules

Work on **one task at a time**. The only implementable task is the one named in `CURRENT_TASK.md`.

**Never automatically start the next task.**

Workflow for every task:

```
PLAN
→ IMPLEMENT
→ TEST
→ REVIEW
→ DOCUMENT
→ UPDATE STATUS
→ COMMIT
→ STOP
```

After COMMIT, **stop**. Record the next task ID in status files only. Do not implement it.

Task IDs use the form `S{sprint}-T{number}`, for example `S0-T01`, `S1-T01`, `S2-T03`.

Every task specification must include:

- Objective
- Dependencies
- Requirements
- Files/modules affected
- Implementation details / scope
- Acceptance criteria
- Tests
- Definition of Done
- Status

---

## 6. Sprint Execution Rules

- Execute sprints in order unless status files explicitly record a change.
- A sprint is not started until its first task is the current task.
- Do not pull work from a later sprint into the current sprint.
- Phase 1 must not implement FastAPI, PostgreSQL, admin backends, payments, or marketing platforms.
- Phase 2 must not implement Phase 3+ commerce integrations unless the current task says so.
- Update `SPRINT_STATUS.md` when a task or sprint status changes.

---

## 7. Updating Project Status

After **every** completed task, update all of:

1. `CURRENT_TASK.md` — mark completed; set the recorded next task (do not start it)
2. `PROJECT_STATUS.md` — phase, sprint, current task, overall status, blockers
3. `SPRINT_STATUS.md` — task and sprint statuses
4. The sprint file under `docs/sprints/` — task status
5. `README.md` current-status section if it would otherwise be stale

Never leave status files describing a previous task as “in progress”.

---

## 8. SOLID Principles

- **S**ingle Responsibility: one reason to change per module.
- **O**pen/Closed: extend via new adapters/implementations, not by editing core domain rules for each infrastructure change.
- **L**iskov Substitution: repository and service implementations must honor their interfaces.
- **I**nterface Segregation: do not force callers to depend on unused methods.
- **D**ependency Inversion: domain and application layers must not import infrastructure (HTTP clients, ORM, Next.js internals, database drivers).

Do not put business rules in UI components, API route handlers, or database access code.

---

## 9. Clean Architecture / Separation of Concerns

Intended layers:

- **Domain** — entities, value objects, domain rules
- **Application** — use cases / services
- **Infrastructure** — repositories, HTTP, CMS, database, filesystem
- **Interface / API** — Next.js pages/routes (Phase 1), FastAPI endpoints (Phase 2)

Rules:

- UI talks to application services or use cases, not to data stores.
- Repositories are abstractions. Phase 1 may use static/mock data. Phase 2 may use FastAPI + PostgreSQL.
- Replacing a static repository with an API repository must not require a storefront rewrite.
- Do not bypass layers “for convenience”.
- Do not redesign architecture without an ADR.

---

## 10. Repository / Service / Domain Boundaries

| Layer | May depend on | Must not depend on |
|-------|----------------|--------------------|
| Domain | nothing (stdlib/types only) | Next.js, FastAPI, DB, Tailwind, fetch |
| Application | Domain | UI, ORM, route handlers |
| Infrastructure | Domain, Application interfaces | UI components |
| UI / HTTP adapters | Application | SQL, ORM, other UI frameworks’ internals |

Phase 1 data flow:

```
Next.js UI → Application → Repository interface → Static/mock repository
```

Phase 2 data flow:

```
Next.js UI → Application → Repository interface → API client
    → FastAPI → Application/Domain → Repository → PostgreSQL
```

---

## 11. Next.js + React Rules (Phase 1+)

- Application lives in `frontend/`.
- Use Next.js App Router unless an ADR changes this.
- Prefer Server Components for crawlable catalog/content pages.
- Use Client Components only for interactive islands (cart controls, forms).
- Do not fetch from a FastAPI backend until Phase 2 tasks require it.
- Keep page files thin: compose domain/application modules; do not embed catalog rules in `page.tsx`.
- Semantic HTML is required.
- Do not initialize Next.js unless the current task explicitly requires it.

---

## 12. TypeScript Rules

- TypeScript is required in `frontend/`.
- Prefer explicit types at module boundaries (repositories, services, API DTOs).
- Do not use `any` without a short justification comment. Prefer `unknown` + narrowing.
- Domain types must not leak Next.js or React types.
- Shared catalog types should be reusable by a future API client.

---

## 13. SEO Rules

SEO is a **first-class** requirement for the storefront.

The storefront must eventually support:

- SEO-friendly URLs
- Dynamic metadata
- Canonical URLs
- Sitemap
- `robots.txt`
- Product structured data
- Breadcrumb structured data
- Organization structured data
- OpenGraph
- Image optimization
- Semantic HTML
- Internal linking
- Crawlable product and category pages

Do not ship client-only catalog pages that search engines cannot crawl.

Business SEO copy, brand name, and domain are **TBD** unless documented in requirements.

---

## 14. FastAPI Rules (Phase 2)

- Backend lives in `backend/`.
- Do **not** implement FastAPI during Phase 1.
- FastAPI handles HTTP only: validation, authn/authz hooks, status codes.
- Business rules belong in application/domain modules, not in route functions.
- Use a documented error model and API versioning strategy (details TBD until Sprint 5).
- Do not let FastAPI routers import SQL/ORM models directly if a repository layer exists.

---

## 15. PostgreSQL Rules (Phase 2)

- PostgreSQL is the Phase 2 system of record.
- Schema changes go through migrations (tool TBD in Sprint 5).
- Do not access the database from Next.js in Phase 2; go through the API.
- Do not invent schema for undecided business fields; mark them TBD.

---

## 16. Testing Rules

- Every task that changes behavior must include tests named in the task spec.
- Documentation-only tasks do not require runtime tests; they require a file/consistency review.
- Prefer tests at application and domain boundaries over UI snapshot noise.
- Phase 1: unit tests for domain/application and repository mocks; add component tests when UI exists.
- Phase 2: API tests and repository tests against a documented strategy (tooling TBD in Sprint 5).
- Do not merge a task that fails its stated acceptance tests.

---

## 17. Git Workflow

- Repository root is `shopping/`. Do not create a nested `baby-store/` directory.
- Create a branch for the current task before implementation.
- Do not commit secrets (`.env`, credentials, keys).
- Do not push unless asked.
- Do not use destructive git commands unless explicitly requested.
- Commit only the files that belong to the current task.

### Branch naming

```
s{sprint}-t{number}-{short-kebab-description}
```

Examples: `s0-t01-project-control-docs`, `s1-t01-target-architecture`

### Commit conventions

```
type(scope): short summary
```

Types: `docs`, `feat`, `fix`, `refactor`, `test`, `chore`, `arch`

Examples:

- `docs(s0-t01): initialize project-control documentation`
- `feat(catalog): add product detail page`

---

## 18. Documentation Rules

- Keep `docs/` in sync with implemented reality.
- Do not silently invent business requirements. Use **TBD**.
- Architecture proposals are allowed; significant changes require an ADR.
- Sprint files are the task catalog. Status files are the live index.
- README current status must match `PROJECT_STATUS.md`.

---

## 19. ADR Rules

- ADRs live in `docs/decisions/`.
- Write an ADR before changing: framework choice, layering, data ownership, auth model, or Phase 1↔Phase 2 integration.
- An ADR must include: status, context, decision, consequences, and date.
- Do not implement a significant architectural change without an accepted ADR.

---

## 20. Dependency Rules

- Do not add a dependency unless the current task requires it.
- Prefer the existing stack: Next.js, React, TypeScript, Tailwind (Phase 1); Python, FastAPI, PostgreSQL (Phase 2).
- New libraries need a short justification in the task notes or an ADR if they affect architecture.
- Do not install packages during documentation-only tasks.

---

## 21. Security Rules

- Never commit secrets.
- Do not log personal data unnecessarily. Customer PII handling is TBD until Sprint 8.
- Admin and RBAC belong to Phase 2.
- Validate all external input at API boundaries (Phase 2).
- Do not disable security tooling to “make the task pass”.

---

## 22. Performance Rules

- Catalog pages must remain server-renderable.
- Optimize images through the Next.js image pipeline once the storefront exists.
- Do not fetch unnecessary client-side data for SEO-critical pages.
- Performance budgets and hosting limits are **TBD**.

---

## 23. Accessibility Rules

- Use semantic HTML and correct heading order.
- Interactive controls must be keyboard accessible.
- Images require meaningful `alt` text (or empty alt when decorative).
- Color must not be the only means of conveying information.
- Detailed WCAG target is **TBD** (proposed: WCAG 2.2 AA — not approved until an ADR or requirement says so).

---

## 24. Definition of Done

A task is done only when **all** of the following are true:

1. Scope matches the task specification — no extra features.
2. Acceptance criteria are met.
3. Required tests exist and pass (or documentation review is complete for docs-only tasks).
4. Architecture and layering rules are respected.
5. SEO/a11y/security rules that apply to the changed files are respected.
6. Documentation is updated.
7. `PROJECT_STATUS.md`, `SPRINT_STATUS.md`, `CURRENT_TASK.md`, and the sprint file are updated.
8. No Phase 2+ implementation leaked into a Phase 1 task.
9. Changes are committed on the task branch (when the user requests or the workflow allows a commit).

---

## 25. Stop Rule (No Automatic Next Task)

Completing a task does **not** authorize starting the next one.

After a task is completed:

- Record the next task ID in status files.
- Leave `CURRENT_TASK.md` pointing at the next task with status `NOT_STARTED` (or equivalent), unless a human sets it to `IN_PROGRESS`.
- Wait for an explicit instruction to begin that task.

---

## 26. Phase Guardrails

| Phase | Allowed | Not allowed |
|-------|---------|-------------|
| Phase 1 | SEO-first Next.js storefront, static/mock repositories | FastAPI, PostgreSQL, admin implementation, payments |
| Phase 2 | FastAPI, PostgreSQL, admin, auth, inventory, orders | Payment/email/shipping providers unless a Phase 2 task explicitly includes a stub |
| Phase 3 | Payment, email, messaging, shipping | Production cutover |
| Phase 4 | Segmentation, campaigns, analytics | Unrelated storefront rewrites |
| Phase 5 | Production readiness and deployment | New major product features |

---

## 27. Undecided Requirements

If a business, brand, legal, or vendor decision is not in `docs/`, mark it **TBD**.

Do not silently choose:

- Legal entity, brand name, domain, pricing, tax, shipping rates
- Payment, email, SMS, or analytics vendors
- Inventory valuation method, return policy, coupon rules
- Auth provider, hosting, CI vendor
