# Baby Clothes & Toys E-Commerce

Repository: **shopping**

**Mini Mystiq** — SEO-first, **mobile-first** ecommerce storefront for baby
clothes and toys, with stable application/API contracts, dummy development
adapters, and a later production/Zoho integration path.

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

**Planned production backend (Sprint 6)**

- Python
- FastAPI
- PostgreSQL

---

## Architecture approach

SOLID and clean architecture:

- Domain and application layers independent of UI and persistence
- Repository abstractions
- Current: static/mock repositories
- Sprint 4: dummy APIs behind the same application-owned contracts
- Sprint 6: production backend behind the same interfaces
- Sprint 7: Zoho POS adapter isolated from the storefront

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
| 1 | Storefront + dummy API + commerce UI | S1–S5 |
| 2 | Production backend + Zoho + operations | S6–S8 |
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
└── backend/           # Production backend docs only (implementation Sprint 6)
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
| Phase | Phase 1 — Customer Storefront + Dummy API Foundation |
| Overall status | SPRINT_4_IN_PROGRESS |
| Current sprint | Sprint 4 — Customer Storefront + Dummy API Foundation (**IN_PROGRESS**) |
| Last completed | S4-T10 — Loading/Error/Empty States |
| Current task | S4-T11 — API-driven Navigation (**NOT_STARTED**) |

Do **not** start S4-T11 automatically. S3-T10 Image Optimization and the
original SEO URL strategy are deferred.

S4-T10 added storefront loading skeletons, sanitized catalog errors, not-found
for unknown slugs, and explicit empty collections. Null pricing/inventory and
empty variants remain valid. Header navigation still uses the static backing
composition until S4-T11.
