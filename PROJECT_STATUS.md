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

**Name:** Baby Clothes & Toys E-Commerce  
**Repository:** `shopping` (root directory; do not nest `baby-store/`)  
**Purpose:** SEO-first storefront for baby clothes and toys, later backed by FastAPI + PostgreSQL and admin.

---

## Current Phase

**Phase 1 — SEO-First Storefront**

Phase 1 builds a crawlable Next.js storefront with repository abstractions over static/mock data.  
**Do not** implement FastAPI, PostgreSQL, or admin during this phase.

---

## Current Sprint

**Sprint 1 — Foundation & Architecture**  
Sprint status: **NOT_STARTED** (do not begin S1-T01 until explicitly instructed).

---

## Current Task

**S1-T01 — Document Target Architecture**  
Status: **NOT_STARTED**

Details: `CURRENT_TASK.md` and `docs/sprints/SPRINT-01.md`.

---

## Bootstrap Task

**S0-T01 — Initialize Project-Control Documentation**  
Status: **COMPLETED**

---

## Overall Status

**READY_FOR_SPRINT_1**

---

## Technology

### Frontend (Phase 1)

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend (Phase 2 — not started)

- Python
- FastAPI
- PostgreSQL

### Architecture

- SOLID
- Clean Architecture principles
- Domain / Application / Infrastructure separation
- Repository abstraction
- Service / application layer
- Phase 1 static/mock repositories replaced in Phase 2 by API repositories without a storefront rewrite

---

## Completed work

- S0-T01 — Initialize Project-Control Documentation

## In progress

- None. Do not start S1-T01 automatically.

## Pending

- S1-T01 — Document Target Architecture (next)
- Remainder of Sprint 1–11 as listed in `SPRINT_STATUS.md`

## Blockers

- None for starting S1-T01 (documentation).
- Business requirements (brand, domain, catalog taxonomy, vendors) remain **TBD** and must not be invented in S1-T01.

## Next task (do not start automatically)

**S1-T01 — Document Target Architecture**
