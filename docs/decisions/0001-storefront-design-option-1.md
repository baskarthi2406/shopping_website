# ADR 0001 — Storefront Design Option 1

- **Status:** Accepted
- **Date:** 2026-08-11
- **Deciders:** Project owner (explicit: “app_design_suggestions image option 1 design is finalized”)

## Context

`public/app_design_suggestions.png` contains four Mini Mystiq homepage directions. Earlier docs mixed a low-fi HTML wireframe, a third-party “LittleWear” layout mockup, and “Design Option 1” as a label without a single Mini Mystiq homepage source of truth.

## Decision

**Option 1 (top-left)** in `app_design_suggestions.png` is the finalized customer storefront homepage design.

Canonical files:

- Original: `public/app_design_suggestions.png`
- SEO copy: `public/mini-mystiq-app-design-suggestions.png`
- Spec: `docs/project/DESIGN_OPTION_1.md`

Options 2–4 are rejected for the storefront.

Where Option 1 conflicts with `mini-mystiq-homepage-wireframe.html` or `layout-reference-homepage-mockup.png`, Option 1 wins. The wireframe may remain as historical IA; the LittleWear mockup is not Mini Mystiq identity.

Logo remains `mini-mystiq-logo.png` (not redrawn from the mockup).

## Consequences

- Homepage UI work (later sprints) must follow Option 1 structure: announcement bar, search header, five category circles, featured row, trust bar, hero headline/CTA.
- Implement mobile-first even though the mockup is desktop.
- Standalone hero and category images are not extracted yet; production must not slice the 4-up PNG.
- Header Wishlist/Account are visual; Phase 1 auth remains TBD.
- Exact CSS hex values to be taken from Option 1 in the first UI task, not from the old wireframe greens, unless they match.
