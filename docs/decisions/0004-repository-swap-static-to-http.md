# ADR 0004 — Repository swap (static → HTTP)

- **Status:** Accepted
- **Date:** 2026-08-11

Extended by ADR 0005 (stable storefront contracts and Zoho adapter boundary).
Under ADR 0006, “production” implementations are Next.js server-only code, not
a separate backend.

## Context

The current storefront has no API server. Introducing dummy HTTP and later
production/Zoho implementations must not rewrite the storefront. UI must not
bind to JSON files, vendor DTOs, or `fetch` URLs.

## Decision

- Application layer depends on **repository interfaces** (`ProductRepository`,
  `CategoryRepository`, later cart/order).
- Phase 1 infrastructure: static/mock repositories + fixtures (image paths = SEO filenames).
- HTTP repositories call the Mini Mystiq API contract with the **same
  application interfaces**. Sprint 4 first exercises this boundary with a dummy
  API; later production/Zoho adapters replace it.
- Production backend repositories remain behind the same domain ideas.
- Composition root (config/env) selects the implementation. Pages never choose.

## Consequences

- S1-T05 introduces interfaces + static impl + tests.
- S4-T03 defines the API/domain contract; S4-T04–S4-T09 introduce and connect
  dummy implementations. Production/Zoho adapters arrive in later sprints.
- S4-T09 binds storefront pages to HTTP repositories that consume the dummy
  API envelopes. Dummy route handlers keep the static backing composition so
  the API cannot recurse into itself. S4-T11 moved layout/footer navigation
  onto the same HTTP category client; sitemap remains on the backing
  composition for deterministic static generation.
- Bypassing the interface from a page is an architecture violation.
- Vendor DTOs are mapped inside infrastructure and do not become UI contracts
  (ADR 0005).
