# Project Status

This file is the live index of project state. A new AI session must read it after `PROJECT_DEVELOPMENT_RULES.md` and must not infer state from prior chat history.

---

## How to determine current state

1. Read **Current Phase**, **Current Sprint**, and **Current Task** below.
2. Read `SPRINT_STATUS.md` for task-level statuses.
3. Read `CURRENT_TASK.md` for the single task that may be implemented.
4. Read `docs/sprints/` for the full task specification.
5. If these files disagree, stop and report the conflict. Do not guess.

---

## Project

**Name:** Mini Mystiq — Baby Clothes & Toys E-Commerce  
**Repository:** `shopping`

---

## Current Phase

**Phase 1 — SEO-First Storefront**

Do **not** implement FastAPI, PostgreSQL, or admin during this phase.

---

## Current Sprint

**Sprint 1 — Foundation & Architecture**  
Status: **IN_PROGRESS**

---

## Current Task

**S1-T07 — Base Layout, Tokens, Semantic HTML Shell**  
Status: **NOT_STARTED**

Details: `CURRENT_TASK.md` and `docs/sprints/SPRINT-01.md`.

---

## Overall Status

**SPRINT_1_IN_PROGRESS**

---

## Technology

### Frontend (Phase 1)

- Next.js 16.3.0 App Router (ADR 0002) — initialized in `frontend/`
- React 19.2.8, TypeScript 5.9.3 (`strict: true`), Tailwind CSS 4.3.3
- ESLint 9.39.5 (`eslint-config-next` 16.3.0)
- Vitest 4.1.10 — `npm test` / `npm run test:watch`; colocate `*.test.ts`
- Layer folders (S1-T04) + static catalog (S1-T05): `config/catalog.ts` → ports → `Static*Repository`
- Layer contract: `docs/architecture/FRONTEND_ARCHITECTURE.md`

### Backend (Phase 2 — not started)

- Python, FastAPI modular monolith (ADR 0003), PostgreSQL

---

## Completed work

- S0-T01 — Initialize Project-Control Documentation
- S1-T01 — Document Target Architecture
- S1-T02 — Document Frontend Layer Boundaries
- S1-T03 — Initialize Next.js + TypeScript + Tailwind
- S1-T04 — Establish Frontend Project Structure
- S1-T05 — Repository Interfaces and Static Data Source
- S1-T06 — Configure Linting and Unit Tests

## In progress

- None. Do not start S1-T07 automatically.

## Pending

- S1-T07 — Base Layout, Tokens, Semantic HTML Shell (next)
- Remainder of Sprint 1–11

## Blockers

- None for starting S1-T07 when explicitly requested.
- Business TBD: domain, legal entity, catalog taxonomy, vendors, Pigeon/Careers/character-print, navy/tan category, dedicated category/hero lifestyle art, pricing, UOM, variants, inventory display.

## Next task (do not start automatically)

**S1-T07 — Base Layout, Tokens, Semantic HTML Shell**
