# Baby Clothes & Toys E-Commerce

Repository: **shopping**

**Mini Mystiq** — SEO-first, **mobile-first** e-commerce storefront for baby clothes and toys, with a later FastAPI + PostgreSQL backend and admin.

Tagline: **Delivering Style & Tech**

---

## Project purpose

Build a production-quality store that customers can find via search engines and browse by category and product, then (in later phases) purchase through a real backend, payments, and operations tooling.

## Business goal

Sell baby clothes and toys online with a crawlable catalog and a maintainable architecture.

Brand name, legal entity, domain, pricing, catalog taxonomy, and vendors are **TBD**.

---

## Technology stack

**Phase 1 — Frontend**

- Next.js
- React
- TypeScript
- Tailwind CSS

**Phase 2 — Backend**

- Python
- FastAPI
- PostgreSQL

---

## Architecture approach

SOLID and clean architecture:

- Domain and application layers independent of UI and persistence
- Repository abstractions
- Phase 1: static/mock repositories
- Phase 2: same interfaces backed by FastAPI + PostgreSQL

The storefront must not need a major rewrite when mock data is replaced by the API.

Customer storefront UX is **mobile-first** (Mobile → Tablet → Desktop). Desktop is an extension of mobile, not the starting point. Admin (Phase 2) may prioritize desktop but must remain responsive.

Approved logo and photos: `public/` — inventory in `docs/project/DESIGN_ASSETS.md`. Do not replace the Mini Mystiq logo.

Homepage UI follows **Design Option 1** (finalized): `docs/project/DESIGN_OPTION_1.md`.

See `docs/architecture/ARCHITECTURE.md` and `docs/requirements/MOBILE_REQUIREMENTS.md`.

---

## Phase roadmap

| Phase | Name | Sprints |
|-------|------|---------|
| Bootstrap | Project control | S0 |
| 1 | SEO-first storefront | S1–S4 |
| 2 | Backend + admin | S5–S8 |
| 3 | Commerce | S9 |
| 4 | Digital marketing | S10 |
| 5 | Production | S11 |

Details: `SPRINT_STATUS.md` and `docs/sprints/`.

---

## Repository structure

```
shopping/
├── PROJECT_DEVELOPMENT_RULES.md
├── PROJECT_STATUS.md
├── CURRENT_TASK.md
├── SPRINT_STATUS.md
├── README.md
├── docs/
│   ├── project/
│   ├── architecture/
│   ├── requirements/
│   ├── sprints/
│   └── decisions/
├── .cursor/rules/
├── frontend/          # Phase 1 Next.js storefront (initialized S1-T03)
└── backend/           # Phase 2 FastAPI (not started)
```

Do not create a nested `baby-store/` directory.

---

## How development works

1. One task at a time (`CURRENT_TASK.md`).
2. Workflow: Plan → Implement → Test → Review → Document → Update status → Commit → **Stop**.
3. Never start the next task automatically.
4. Cursor is the implementation tool.
5. Git is the source of truth.

---

## How a new ChatGPT conversation continues this project

Do **not** use previous conversation history.

Read, in order:

1. `PROJECT_DEVELOPMENT_RULES.md`
2. `PROJECT_STATUS.md`
3. `SPRINT_STATUS.md`
4. `CURRENT_TASK.md`
5. `docs/architecture/` (as relevant)
6. `docs/requirements/` (as relevant)
7. The current sprint file in `docs/sprints/`
8. `.cursor/rules/`
9. Existing source code

Then implement **only** the current task.

---

## How Cursor is used

- Open this repository in Cursor.
- Follow `.cursor/rules/` and `PROJECT_DEVELOPMENT_RULES.md`.
- Implement the task in `CURRENT_TASK.md` only.
- Do not scaffold Next.js or FastAPI unless that task explicitly requires it.

---

## Current project status

**Source of status:** `PROJECT_STATUS.md` (this section must stay aligned with it).

| Field | Value |
|-------|--------|
| Phase | Phase 1 — SEO-First Storefront |
| Overall status | SPRINT_1_IN_PROGRESS |
| Current sprint | Sprint 1 — Foundation & Architecture (**IN_PROGRESS**) |
| Last completed | S1-T06 — Configure Linting and Unit Tests |
| Current task | S1-T07 — Base Layout, Tokens, Semantic HTML Shell (**NOT_STARTED**) |

Do **not** start S1-T07 automatically.

Phase 2 backend implementation has **not** started. Frontend Next.js is initialized in `frontend/` (App Router at `frontend/app/`). Layer folders exist (S1-T04). Static catalog is behind `config/catalog.ts` (S1-T05). Unit tests: Vitest (`npm test`).
