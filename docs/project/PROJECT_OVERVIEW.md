# Project Overview

## Name

**Mini Mystiq** — Baby Clothes & Toys E-Commerce

Tagline: **Delivering Style & Tech**

## Repository

`shopping` — this is the repository root. Do not nest a `baby-store/` directory.

## Purpose

Deliver an SEO-first public storefront for baby clothes and toys, define stable
Mini Mystiq application/API contracts with dummy implementations, then add a
production backend and Zoho POS integration without rebuilding the UI.

## Business goal

Enable customers to discover, browse, and (in later phases) purchase baby clothes and toys.

## Decided

- Git is the source of truth.
- Cursor is the implementation tool.
- One task at a time.
- Current storefront: Next.js + React + TypeScript + Tailwind with mock/static
  repositories.
- Storefront is mobile-first (Mobile → Tablet → Desktop). Admin (Phase 2) may be desktop-priority but must stay responsive.
- Brand: Mini Mystiq. Approved logo and photos live in `public/`. See `docs/project/DESIGN_ASSETS.md`. Do not replace the logo or invent stock imagery.
- Homepage visual design: **Option 1 finalized** (`docs/project/DESIGN_OPTION_1.md`, ADR 0001).
- Sprint 4: customer navigation hierarchy, stable contracts, and dummy catalog
  APIs.
- Sprint 6: Next.js server-side foundations; no separate backend (ADR 0006)
  and no database selected (ADR 0008).
- Sprint 7: Zoho POS integration behind server-only repository adapters
  (ADR 0005, ADR 0009).
- Sprint 8: orders, checkout, and operations as requirements are confirmed.
- Phases 3–5: commerce, marketing, production.

## TBD (do not invent)

- Legal entity (wireframe footer shows “Enn2Gee” — **TBD**)
- Trading name vs Mini Mystiq on invoices/legal pages
- Domain and hosting
- Target markets and languages
- Catalog taxonomy (exact full hierarchy/order and menu visibility)
- Pricing, tax, shipping, returns
- Payment, email, SMS, analytics vendors
- Inventory and fulfillment model
- Zoho API capabilities, credentials, identifiers, rate limits, and sync model
- Content and merchandising strategy

## Related documents

- `docs/project/TECH_STACK.md`
- `docs/project/DEVELOPMENT_GUIDELINES.md`
- `docs/architecture/ARCHITECTURE.md`
- `docs/requirements/` (including `MOBILE_REQUIREMENTS.md` and `SEO_REQUIREMENTS.md`)
- `docs/project/DESIGN_ASSETS.md`
- `docs/project/DESIGN_OPTION_1.md`
- `docs/sprints/`
