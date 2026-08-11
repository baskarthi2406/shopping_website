# ADR 0004 — Repository swap (static → HTTP)

- **Status:** Accepted
- **Date:** 2026-08-11

## Context

Phase 1 has no FastAPI. Phase 2 must not rewrite the storefront. UI must not bind to JSON files or `fetch` URLs.

## Decision

- Application layer depends on **repository interfaces** (`IProductRepository`, `ICategoryRepository`, later cart/order).
- Phase 1 infrastructure: static/mock repositories + fixtures (image paths = SEO filenames).
- Phase 2 frontend infrastructure: HTTP repositories calling FastAPI with the **same interfaces**.
- Phase 2 backend: SQL repositories behind the same domain ideas.
- Composition root (config/env) selects the implementation. Pages never choose.

## Consequences

- S1-T05 introduces interfaces + static impl + tests.
- S5-T06 adds HTTP adapters; UI use cases stay.
- Bypassing the interface from a page is an architecture violation.
