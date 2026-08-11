# Project Development Rules

This file is binding. Cursor and any future AI session must follow it.

------------------------------------------------------------------------

## 1. Source of Truth

The Git repository is the **permanent source of truth**.

The AI must **never** rely on previous ChatGPT (or other) conversation
history.

The repository documentation and source code are the source of truth.

Do not invent project state from memory. If documentation and code
disagree, stop and report the inconsistency before changing anything.

------------------------------------------------------------------------

## 2. AI Continuation Protocol

A new conversation must be able to continue this project using **only**
the repository.

The project uses a **two-level context loading strategy** so that a new
ChatGPT thread or Cursor session does not need to read every project
document on every task.

### 2.1 Mandatory Control Files

Every new AI/Cursor session MUST read these four files first:

1.  `PROJECT_DEVELOPMENT_RULES.md`
2.  `PROJECT_STATUS.md`
3.  `CURRENT_TASK.md`
4.  `SPRINT_STATUS.md`

These four files are the **control plane**. They establish:

-   Project rules
-   Current phase
-   Current sprint
-   Current task
-   Task status
-   Completed work
-   Pending work
-   Blockers
-   Phase guardrails
-   What must not be implemented yet

Do not start implementation until these four files have been read.

### 2.2 Task-Specific Documentation

After reading the four control files, read **only the documentation
relevant to the current task**.

At minimum, inspect:

1.  The current sprint specification under `docs/sprints/`
2.  Relevant architecture documentation under `docs/architecture/`
3.  Relevant requirements under `docs/requirements/`
4.  Relevant ADRs under `docs/decisions/`, when applicable
5.  Applicable Cursor rules under `.cursor/rules/`
6.  Relevant project/design documentation under `docs/project/`, when
    applicable
7.  Existing source code relevant to the current task

Do **not** unnecessarily read unrelated project documentation.

Examples:

-   A frontend task should normally read frontend architecture, relevant
    requirements, the sprint task, and frontend Cursor rules.
-   A backend task should normally read backend architecture, relevant
    requirements, the sprint task, relevant ADRs, and backend Cursor
    rules.
-   A documentation-only task should read the relevant documentation and
    control files, but does not need unrelated implementation files.

### 2.3 Current-State Determination

After reading the control files and task-specific documentation,
determine:

-   Current phase
-   Current sprint
-   Current task
-   Task status
-   Completed tasks
-   Blockers
-   Relevant architectural constraints
-   What must **not** be built yet

The AI MUST work only on the task recorded in `CURRENT_TASK.md`.

If status files are missing, empty, contradictory, or inconsistent with
the relevant sprint/task documentation, **do not start implementation**.
Report the inconsistency and wait for confirmation.

### 2.4 Source Code Verification

After understanding the task, inspect existing source code relevant to
that task.

The repository's implemented code is also a source of truth.

If documentation and implementation disagree:

1.  Do not silently choose one.
2.  Report the discrepancy.
3.  Determine whether the current task can proceed safely.
4.  Update documentation only when the task explicitly permits it or the
    discrepancy is resolved.

### 2.5 Conversation Independence

Previous ChatGPT/Cursor conversation history is optional context only.

The project MUST remain continuable when:

-   A completely new ChatGPT thread is opened.
-   A different Cursor session is used.
-   The original developer is unavailable.
-   The previous conversation is no longer accessible.

No task may depend on instructions that exist only in chat history.

### 2.6 Continuation Summary

At the beginning of a new session, the AI should briefly report:

``` text
Phase:
Sprint:
Current Task:
Task Status:
Relevant Documents:
Blockers:
Next Allowed Action:
```

Then proceed only if the current task is valid and authorized.

------------------------------------------------------------------------

## 3. New ChatGPT Conversation Protocol

When a new ChatGPT or Cursor conversation starts:

1.  Read the four mandatory control files from Section 2.1.
2.  Determine the current phase, sprint, and task from the repository
    --- never from prior chat.
3.  Read only the task-specific documentation required by Section 2.2.
4.  Inspect relevant existing source code before modifying it.
5.  Work **only** on the task in `CURRENT_TASK.md`.
6.  Do not resume "remembered" work from an old conversation.
7.  Do not skip required documentation updates.
8.  Do not start the next task when the current task completes.
9.  If the repository state is inconsistent, stop and report the
    inconsistency.
10. Do not ask the user to paste previous conversation history when the
    required project state can be obtained from the repository.

------------------------------------------------------------------------

## 4. Cursor Development Protocol

Cursor is the implementation tool.

-   Follow `.cursor/rules/` in addition to this file.
-   Cursor rules must not contradict this file. If they do, this file
    wins; report the conflict.
-   Prefer small, reviewable diffs limited to the current task.
-   Do not generate application code for documentation-only tasks.
-   Do not install packages or scaffold frameworks unless the current
    task explicitly requires it.
-   At the start of a session, use the continuation protocol in Section
    2 rather than reading the entire repository indiscriminately.
-   Cursor must inspect only the task-relevant documentation and source
    code needed to safely implement the current task.

------------------------------------------------------------------------

## 5. Task Execution Rules

Work on **one task at a time**. The only implementable task is the one
named in `CURRENT_TASK.md`.

**Never automatically start the next task.**

Workflow for every task:

    PLAN
    → IMPLEMENT
    → TEST
    → REVIEW
    → DOCUMENT
    → UPDATE STATUS
    → COMMIT
    → STOP

After COMMIT, **stop**. Record the next task ID in status files only. Do
not implement it.

Task IDs use the form `S{sprint}-T{number}`, for example `S0-T01`,
`S1-T01`, `S2-T03`.

Every task specification must include:

-   Objective
-   Dependencies
-   Requirements
-   Files/modules affected
-   Implementation details / scope
-   Acceptance criteria
-   Tests
-   Definition of Done
-   Status

------------------------------------------------------------------------

## 6. Sprint Execution Rules

-   Execute sprints in order unless status files explicitly record a
    change.
-   A sprint is not started until its first task is the current task.
-   Do not pull work from a later sprint into the current sprint.
-   Phase 1 must not implement FastAPI, PostgreSQL, admin backends,
    payments, or marketing platforms.
-   Phase 2 must not implement Phase 3+ commerce integrations unless the
    current task says so.
-   Update `SPRINT_STATUS.md` when a task or sprint status changes.

------------------------------------------------------------------------

## 7. Updating Project Status

After **every** completed task, update all of:

1.  `CURRENT_TASK.md` --- mark completed; set the recorded next task (do
    not start it)
2.  `PROJECT_STATUS.md` --- phase, sprint, current task, overall status,
    blockers
3.  `SPRINT_STATUS.md` --- task and sprint statuses
4.  The sprint file under `docs/sprints/` --- task status
5.  `README.md` current-status section if it would otherwise be stale

Never leave status files describing a previous task as "in progress".

------------------------------------------------------------------------

## 8. SOLID Principles

-   **S**ingle Responsibility: one reason to change per module.
-   **O**pen/Closed: extend via new adapters/implementations, not by
    editing core domain rules for each infrastructure change.
-   **L**iskov Substitution: repository and service implementations must
    honor their interfaces.
-   **I**nterface Segregation: do not force callers to depend on unused
    methods.
-   **D**ependency Inversion: domain and application layers must not
    import infrastructure (HTTP clients, ORM, Next.js internals,
    database drivers).

Do not put business rules in UI components, API route handlers, or
database access code.

------------------------------------------------------------------------

## 9. Clean Architecture / Separation of Concerns

Intended layers:

-   **Domain** --- entities, value objects, domain rules
-   **Application** --- use cases / services
-   **Infrastructure** --- repositories, HTTP, CMS, database, filesystem
-   **Interface / API** --- Next.js pages/routes (Phase 1), FastAPI
    endpoints (Phase 2)

Rules:

-   UI talks to application services or use cases, not to data stores.
-   Repositories are abstractions. Phase 1 may use static/mock data.
    Phase 2 may use FastAPI + PostgreSQL.
-   Replacing a static repository with an API repository must not
    require a storefront rewrite.
-   Do not bypass layers "for convenience".
-   Do not redesign architecture without an ADR.

------------------------------------------------------------------------

## 10. Repository / Service / Domain Boundaries

  -----------------------------------------------------------------------------
  Layer            May depend on              Must not depend on
  ---------------- -------------------------- ---------------------------------
  Domain           nothing (stdlib/types      Next.js, FastAPI, DB, Tailwind,
                   only)                      fetch

  Application      Domain                     UI, ORM, route handlers

  Infrastructure   Domain, Application        UI components
                   interfaces                 

  UI / HTTP        Application                SQL, ORM, other UI frameworks'
  adapters                                    internals
  -----------------------------------------------------------------------------

Phase 1 data flow:

    Next.js UI → Application → Repository interface → Static/mock repository

Phase 2 data flow:

    Next.js UI → Application → Repository interface → API client
        → FastAPI → Application/Domain → Repository → PostgreSQL

------------------------------------------------------------------------

## 11. Next.js + React Rules (Phase 1+)

-   Application lives in `frontend/`.
-   Use Next.js App Router unless an ADR changes this.
-   Prefer Server Components for crawlable catalog/content pages.
-   Use Client Components only for interactive islands (cart controls,
    forms).
-   Do not fetch from a FastAPI backend until Phase 2 tasks require it.
-   Keep page files thin: compose domain/application modules; do not
    embed catalog rules in `page.tsx`.
-   Semantic HTML is required.
-   Storefront UI is mobile-first (Mobile → Tablet → Desktop). See
    Section 14.
-   Visual identity is Mini Mystiq. Logo: `public/mini-mystiq-logo.png`.
    See `docs/project/DESIGN_ASSETS.md`.
-   Do not initialize Next.js unless the current task explicitly
    requires it.

------------------------------------------------------------------------

## 12. TypeScript Rules

-   TypeScript is required in `frontend/`.
-   Prefer explicit types at module boundaries (repositories, services,
    API DTOs).
-   Do not use `any` without a short justification comment. Prefer
    `unknown` + narrowing.
-   Domain types must not leak Next.js or React types.
-   Shared catalog types should be reusable by a future API client.

------------------------------------------------------------------------

## 13. SEO Rules

SEO is a **first-class** requirement for the storefront.

The storefront must eventually support:

-   SEO-friendly URLs
-   Dynamic metadata
-   Canonical URLs
-   Sitemap
-   `robots.txt`
-   Product structured data
-   Breadcrumb structured data
-   Organization structured data
-   OpenGraph
-   Image optimization
-   SEO-friendly image filenames (see below)
-   Semantic HTML
-   Internal linking
-   Crawlable product and category pages

Do not ship client-only catalog pages that search engines cannot crawl.

Brand name is **Mini Mystiq** (documented). Domain and legal entity
remain **TBD** unless documented in requirements.

### SEO image filenames

Storefront `src` must use SEO-friendly names documented in
`docs/project/DESIGN_ASSETS.md`.

-   lowercase; hyphen-separated words; no spaces or special characters
-   describe the actual image; do not guess; mark **TBD** if unclear
-   no generic names (`IMG_1234`, `product1`, WhatsApp timestamps)
-   logo is stable: `mini-mystiq-logo.png` --- do not rename it again
-   keep original files; do not delete them
-   `alt` describes the image in words; do not use the filename as alt
-   mapping table: Original Filename \| SEO Filename \| Type \| Usage \|
    Status

------------------------------------------------------------------------

## 14. Mobile-First Rules

Mobile-first is **mandatory** for the customer storefront.

Responsive priority:

    Mobile → Tablet → Desktop

Mobile customers are the primary audience. Desktop is an extension of
the mobile-first design, not the other way around.

Every storefront task must consider:

-   Mobile layout
-   Touch-friendly interactions
-   Responsive typography
-   Responsive images
-   No horizontal scrolling
-   Mobile navigation
-   Mobile product browsing
-   Mobile product detail
-   Mobile cart
-   Mobile performance
-   Core Web Vitals

Rules:

-   Design and implement the smallest viewport first; enhance for tablet
    and desktop.
-   Do not ship desktop-only storefront layouts that are merely squeezed
    onto phones.
-   Interactive controls on the storefront must be usable with touch
    (not hover-only).
-   Catalog and cart pages must not require horizontal scrolling at
    mobile widths.
-   Navigation, product listing, product detail, and cart must have
    explicit mobile treatments.
-   Prefer CSS (Tailwind) responsive utilities over separate mobile
    sites or user-agent forks.
-   Exact breakpoint pixel values are **TBD** (Tailwind defaults may be
    used when a UI task starts, and must then be documented).
-   Numeric Core Web Vitals budgets are **TBD**; storefront work must
    still avoid known CWV regressions (oversized images, blocked
    rendering, layout shift from unsized media).

Admin UI (Phase 2) may prioritize desktop usability but **must remain
responsive**.

Details: `docs/requirements/MOBILE_REQUIREMENTS.md`.

------------------------------------------------------------------------

## 15. FastAPI Rules (Phase 2)

-   Backend lives in `backend/`.
-   Phase 2 shape is a **modular monolith** (ADR 0003), not
    microservices.
-   Do **not** implement FastAPI during Phase 1.
-   FastAPI handles HTTP only: validation, authn/authz hooks, status
    codes.
-   Business rules belong in application/domain modules, not in route
    functions.
-   Use a documented error model and API versioning strategy (details
    TBD until Sprint 5).
-   Do not let FastAPI routers import SQL/ORM models directly if a
    repository layer exists.

------------------------------------------------------------------------

## 16. PostgreSQL Rules (Phase 2)

-   PostgreSQL is the Phase 2 system of record.
-   Schema changes go through migrations (tool TBD in Sprint 5).
-   Do not access the database from Next.js in Phase 2; go through the
    API.
-   Do not invent schema for undecided business fields; mark them TBD.

------------------------------------------------------------------------

## 17. Testing Rules

-   Every task that changes behavior must include tests named in the
    task spec.
-   Documentation-only tasks do not require runtime tests; they require
    a file/consistency review.
-   Prefer tests at application and domain boundaries over UI snapshot
    noise.
-   Phase 1: unit tests for domain/application and repository mocks; add
    component tests when UI exists.
-   Phase 2: API tests and repository tests against a documented
    strategy (tooling TBD in Sprint 5).
-   Do not merge a task that fails its stated acceptance tests.

------------------------------------------------------------------------

## 18. Git Workflow

-   Repository root is `shopping/`. Do not create a nested `baby-store/`
    directory.
-   Create a branch for the current task before implementation.
-   Do not commit secrets (`.env`, credentials, keys).
-   Do not push unless asked.
-   Do not use destructive git commands unless explicitly requested.
-   Commit only the files that belong to the current task.

### Branch naming

    s{sprint}-t{number}-{short-kebab-description}

Examples: `s0-t01-project-control-docs`, `s1-t01-target-architecture`

### Commit conventions

    type(scope): short summary

Types: `docs`, `feat`, `fix`, `refactor`, `test`, `chore`, `arch`

Examples:

-   `docs(s0-t01): initialize project-control documentation`
-   `feat(catalog): add product detail page`

------------------------------------------------------------------------

## 19. Documentation Rules

-   Keep `docs/` in sync with implemented reality.
-   Do not silently invent business requirements. Use **TBD**.
-   Architecture proposals are allowed; significant changes require an
    ADR.
-   Sprint files are the task catalog. Status files are the live index.
-   README current status must match `PROJECT_STATUS.md`.

------------------------------------------------------------------------

## 20. ADR Rules

-   ADRs live in `docs/decisions/`.
-   Write an ADR before changing: framework choice, layering, data
    ownership, auth model, or Phase 1↔Phase 2 integration.
-   An ADR must include: status, context, decision, consequences, and
    date.
-   Do not implement a significant architectural change without an
    accepted ADR.

------------------------------------------------------------------------

## 21. Dependency Rules

-   Do not add a dependency unless the current task requires it.
-   Prefer the existing stack: Next.js, React, TypeScript, Tailwind
    (Phase 1); Python, FastAPI, PostgreSQL (Phase 2).
-   New libraries need a short justification in the task notes or an ADR
    if they affect architecture.
-   Do not install packages during documentation-only tasks.

------------------------------------------------------------------------

## 22. Security Rules

-   Never commit secrets.
-   Do not log personal data unnecessarily. Customer PII handling is TBD
    until Sprint 8.
-   Admin and RBAC belong to Phase 2.
-   Validate all external input at API boundaries (Phase 2).
-   Do not disable security tooling to "make the task pass".

------------------------------------------------------------------------

## 23. Performance Rules

-   Catalog pages must remain server-renderable.
-   Optimize images through the Next.js image pipeline once the
    storefront exists.
-   Use approved files in repository `public/`
    (`docs/project/DESIGN_ASSETS.md`). Do not generate, download, or
    replace the Mini Mystiq logo or product photos.
-   Do not fetch unnecessary client-side data for SEO-critical pages.
-   Storefront performance is mobile-first: consider Core Web Vitals on
    every storefront UI task.
-   Numeric CWV, Lighthouse, and hosting budgets are **TBD**.

------------------------------------------------------------------------

## 24. Accessibility Rules

-   Use semantic HTML and correct heading order.
-   Interactive controls must be keyboard accessible and, on the
    storefront, touch-friendly.
-   Images require meaningful `alt` text (or empty alt when decorative).
-   Color must not be the only means of conveying information.
-   Detailed WCAG target is **TBD** (proposed: WCAG 2.2 AA --- not
    approved until an ADR or requirement says so).

------------------------------------------------------------------------

## 25. Definition of Done

A task is done only when **all** of the following are true:

1.  Scope matches the task specification --- no extra features.
2.  Acceptance criteria are met.
3.  Required tests exist and pass (or documentation review is complete
    for docs-only tasks).
4.  Architecture and layering rules are respected.
5.  SEO, accessibility, mobile-first, and security rules that apply to
    the changed files are respected.
6.  Documentation is updated.
7.  `PROJECT_STATUS.md`, `SPRINT_STATUS.md`, `CURRENT_TASK.md`, and the
    sprint file are updated.
8.  No Phase 2+ implementation leaked into a Phase 1 task.
9.  Changes are committed on the task branch (when the user requests or
    the workflow allows a commit).

------------------------------------------------------------------------

## 26. Stop Rule (No Automatic Next Task)

Completing a task does **not** authorize starting the next one.

After a task is completed:

-   Record the next task ID in status files.
-   Leave `CURRENT_TASK.md` pointing at the next task with status
    `NOT_STARTED` (or equivalent), unless a human sets it to
    `IN_PROGRESS`.
-   Wait for an explicit instruction to begin that task.

------------------------------------------------------------------------

## 27. Phase Guardrails

  ------------------------------------------------------------------------
  Phase             Allowed                Not allowed
  ----------------- ---------------------- -------------------------------
  Phase 1           SEO-first Next.js      FastAPI, PostgreSQL, admin
                    storefront,            implementation, payments
                    static/mock            
                    repositories           

  Phase 2           FastAPI, PostgreSQL,   Payment/email/shipping
                    admin, auth,           providers unless a Phase 2 task
                    inventory, orders      explicitly includes a stub

  Phase 3           Payment, email,        Production cutover
                    messaging, shipping    

  Phase 4           Segmentation,          Unrelated storefront rewrites
                    campaigns, analytics   

  Phase 5           Production readiness   New major product features
                    and deployment         
  ------------------------------------------------------------------------

------------------------------------------------------------------------

## 28. Undecided Requirements

If a business, brand, legal, or vendor decision is not in `docs/`, mark
it **TBD**.

Do not silently choose:

-   Legal entity, brand name, domain, pricing, tax, shipping rates
-   Payment, email, SMS, or analytics vendors
-   Inventory valuation method, return policy, coupon rules
-   Auth provider, hosting, CI vendor
