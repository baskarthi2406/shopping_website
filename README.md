# Baby Clothes & Toys E-Commerce

Repository: **shopping**

**Mini Mystiq** — SEO-first, **mobile-first** ecommerce storefront for baby
clothes and toys, with stable application/API contracts, dummy development
adapters, and a later production/Zoho integration path.

Tagline: **Delivering Style & Tech**

---

## Project purpose

Build a production-quality store that customers can find via search engines and browse by category and product, then (in later phases) purchase through real server-side commerce, payments, and operations tooling.

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

**Server-side (Sprint 6 onward)**

- The same Next.js application (Server Components, server-only modules, Route
  Handlers). No separate backend service (ADR 0006).
- No database selected (ADR 0008).

---

## Architecture approach

SOLID and clean architecture:

- Domain and application layers independent of UI and persistence
- Repository abstractions
- Current: static/mock repositories
- Sprint 4: dummy APIs behind the same application-owned contracts
- Sprint 6: Next.js server-side foundations behind the same interfaces
- Sprint 7: server-only Zoho POS adapter isolated from the storefront

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
| 2 | Next.js server-side foundation + Zoho + operations | S6–S8 |
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
└── backend/           # Retired placeholder README (no separate backend; ADR 0006)
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
- Do not scaffold new frameworks or services unless that task explicitly requires it (no separate backend; ADR 0006).

---

## Current project status

**Source of status:** `PROJECT_STATUS.md` (this section must stay aligned with it).

| Field | Value |
|-------|--------|
| Phase | Phase 1 — Customer Storefront + Dummy API Foundation (Phase 2 / Sprint 6 in progress) |
| Overall status | SPRINT_6_IN_PROGRESS |
| Current sprint | Sprint 6 — Next.js Server-side Foundation (**IN PROGRESS**) |
| Last completed | S6-T13 — Field Provenance Rules |
| Current task | None; next proposed S6-T14 — Outbound Request Policy (**NOT_STARTED**, gate G2) |

Sprint 4 is complete. Sprint 5 is complete for Track A (purchasability rules,
PDP price/availability panel, variant selector); the local cart (Track B) is
deferred. No price renders until locale/currency is approved. ADR 0006 keeps
UI and server-side code in one Next.js application (no FastAPI backend); no
database is selected. S6-T11 guards server configuration with
`import "server-only"` and verifies it with production builds. S6-T12 adds a
reusable catalog API conformance suite. S6-T13 adds pure field provenance
rules (not yet wired in). Do **not** start S6-T14 automatically. S3-T10 Image Optimization and the original SEO URL
strategy are deferred.
