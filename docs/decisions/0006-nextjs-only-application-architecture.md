# ADR 0006 — Next.js-only Application Architecture

- **Status:** Accepted (explicit human decision recorded in S6-T02)
- **Date:** 2026-09-29
- **Supersedes:** ADR 0003 (modular-monolith FastAPI + PostgreSQL backend)

## Context

ADR 0003 planned a separate Python/FastAPI service with PostgreSQL for
Sprint 6. None of it was built: `backend/` contains only a README, and no
Python code, database driver, ORM, or migration exists. The storefront already
runs server-side code in Next.js 16 (Server Components, Route Handlers for the
S4 dummy catalog API, an in-process API dispatch in `config/`).

The project owner decided to keep the UI and all server-side functionality in
Next.js and not to introduce a separate FastAPI backend. The planned Zoho POS
integration needs a server boundary for credentials and request budgeting; that
boundary can live in Next.js server-only code.

## Decision

1. **One application.** `frontend/` is the single deployable application. It
   owns UI and server-side functionality. There is no FastAPI or other
   separate backend service. `backend/` is retained only as a documentation
   placeholder that points here; it must not receive application code.
2. **Server mechanisms.** Server Components and server-only modules for
   reads; Route Handlers for HTTP endpoints; Server Functions only when a
   separately approved mutation requires one (none exists). The default
   Node.js runtime is used for server modules; the Edge runtime needs a new
   decision.
3. **Server-only boundary.** Modules that read secrets or call external
   services begin with `import "server-only"` (Next.js resolves it natively in
   16.3; test-runner resolution is settled in the implementing task). Secrets
   never use the `NEXT_PUBLIC_` prefix. Client Components receive view models
   only; they never import `config/`, `infrastructure/`, or provider code.
4. **Layering stays.** Domain → application (use cases, repository ports) →
   infrastructure (static, dummy, future provider adapters) → `config/`
   composition root → `app/` pages and Route Handlers. New abstractions are
   added only when a second implementation or a test needs them.
5. **Catalog contract.** `docs/architecture/STOREFRONT_CONTRACTS.md` stays
   authoritative (ADR 0005). The dummy Route Handlers
   (`GET /api/categories`, `GET /api/products`, `GET /api/products/{slug}`)
   and the in-process dispatch remain the storefront default until an approved
   task replaces or adapts them. A provider-backed implementation must pass
   the same contract tests and be selected only in `config/`.
6. **Public routes and provider budget.** No public Route Handler or page
   render may trigger a provider (Zoho) request per incoming request. Provider
   data is served from a cache or snapshot refreshed under a request budget
   (ADR 0009). Route Handlers never act as a pass-through proxy to a provider.
7. **Versioning.** No URL version prefix while the only consumer is this
   storefront. A prefix is introduced only if an external consumer is approved.
8. **Hosting.** One Next.js deployment. Host, runtime model (long-running Node
   server or serverless), and deployment pipeline are **TBD** (Sprint 11).
   Caching and persistence choices that depend on the host are decided in
   ADR 0008 and ADR 0009 once the host is known.

## Open items (not decided here)

- Whether the `/api/*` catalog routes stay publicly reachable in production,
  and whether they are backed by provider data or kept as development-only.
- Hosting provider and runtime model; production domain (`NEXT_PUBLIC_SITE_URL`).
- Persistence (ADR 0008) and provider access specifics (ADR 0009).

## Consequences

- ADR 0003 is superseded. ADR 0004 and ADR 0005 remain valid; their
  references to a “production backend” now mean Next.js server-only
  implementations behind the same repository seam.
- Sprint 6 is replanned without a FastAPI skeleton, a separate deployment, or
  database tasks.
- Python, FastAPI, and PostgreSQL are removed from the planned stack;
  PostgreSQL remains only one candidate in ADR 0008.
- Future auth, admin, cart, or order work (Sprint 8+) is also expected to live
  in Next.js, subject to its own ADRs.
