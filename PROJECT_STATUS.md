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
**Purpose:** SEO-first, mobile-first storefront, later FastAPI + PostgreSQL modular monolith and admin.

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

**S1-T02 — Document Frontend Layer Boundaries**  
Status: **NOT_STARTED**

Details: `CURRENT_TASK.md` and `docs/sprints/SPRINT-01.md`.

---

## Bootstrap Task

**S0-T01** — COMPLETED

---

## Overall Status

**SPRINT_1_IN_PROGRESS**

---

## Technology

### Frontend (Phase 1)

- Next.js App Router (ADR 0002) — **not initialized**
- React, TypeScript, Tailwind CSS

### Backend (Phase 2 — not started)

- Python, FastAPI **modular monolith** (ADR 0003), PostgreSQL

### Architecture

- SOLID, clean layers, repository swap static → HTTP (ADR 0004)
- Design Option 1 finalized (ADR 0001)
- Mobile-first storefront; admin desktop-priority but responsive

---

## Completed work

- S0-T01 — Initialize Project-Control Documentation
- S1-T01 — Document Target Architecture

## In progress

- None. Do not start S1-T02 automatically.

## Pending

- S1-T02 — Document Frontend Layer Boundaries (next)
- Remainder of Sprint 1–11

## Blockers

- None for S1-T02 (documentation).
- Next.js still not initialized (S1-T03).
- Business TBD: domain, legal entity, catalog taxonomy, vendors, Pigeon/Careers/character-print, navy/tan category, dedicated category/hero lifestyle art.

## Next task (do not start automatically)

**S1-T02 — Document Frontend Layer Boundaries**
