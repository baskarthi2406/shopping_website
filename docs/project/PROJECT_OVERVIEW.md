# Project Overview

## Name

**Mini Mystiq** — Baby Clothes & Toys E-Commerce

Tagline: **Delivering Style & Tech**

## Repository

`shopping` — this is the repository root. Do not nest a `baby-store/` directory.

## Purpose

Deliver an SEO-first public storefront for baby clothes and toys, then a FastAPI + PostgreSQL backend, admin, commerce integrations, marketing, and production deployment.

## Business goal

Enable customers to discover, browse, and (in later phases) purchase baby clothes and toys.

## Decided

- Git is the source of truth.
- Cursor is the implementation tool.
- One task at a time.
- Phase 1: Next.js + React + TypeScript + Tailwind storefront with mock/static repositories.
- Storefront is mobile-first (Mobile → Tablet → Desktop). Admin (Phase 2) may be desktop-priority but must stay responsive.
- Brand: Mini Mystiq. Approved logo and photos live in `public/`. See `docs/project/DESIGN_ASSETS.md`. Do not replace the logo or invent stock imagery.
- Homepage visual design: **Option 1 finalized** (`docs/project/DESIGN_OPTION_1.md`, ADR 0001).
- Phase 2: FastAPI + PostgreSQL **modular monolith** (not microservices); admin implementation.
- Phases 3–5: commerce, marketing, production.

## TBD (do not invent)

- Legal entity (wireframe footer shows “Enn2Gee” — **TBD**)
- Trading name vs Mini Mystiq on invoices/legal pages
- Domain and hosting
- Target markets and languages
- Catalog taxonomy (exact categories)
- Pricing, tax, shipping, returns
- Payment, email, SMS, analytics vendors
- Inventory and fulfillment model
- Content and merchandising strategy

## Related documents

- `docs/project/TECH_STACK.md`
- `docs/project/DEVELOPMENT_GUIDELINES.md`
- `docs/architecture/ARCHITECTURE.md`
- `docs/requirements/` (including `MOBILE_REQUIREMENTS.md` and `SEO_REQUIREMENTS.md`)
- `docs/project/DESIGN_ASSETS.md`
- `docs/project/DESIGN_OPTION_1.md`
- `docs/sprints/`
