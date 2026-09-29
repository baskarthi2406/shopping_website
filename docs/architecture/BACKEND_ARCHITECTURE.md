# Server-side Architecture (Next.js)

**Status:** Revised in S6-T02. ADR 0006 supersedes the earlier FastAPI +
PostgreSQL plan (ADR 0003). There is **no separate backend service**. This file
keeps its historical name so existing links still resolve.

---

## Decisions

| Item | Choice | Source |
|------|--------|--------|
| Application | One Next.js application in `frontend/` owns UI and server-side functionality | ADR 0006 (Accepted) |
| Server mechanisms | Server Components, server-only modules, Route Handlers; Server Functions only for approved mutations | ADR 0006 |
| Runtime | Default Node.js runtime; Edge needs a new decision | ADR 0006 |
| Catalog contract | `STOREFRONT_CONTRACTS.md` (S4) | ADR 0005 |
| Persistence | None in Sprint 6; any store needs evidence (PostgreSQL not selected) | ADR 0008 (Proposed) |
| Field ownership and provenance | Per-field owners open; four provenance states proposed | ADR 0007 (Proposed) |
| Provider (Zoho) access | Server-only, budgeted, cached, bounded retries | ADR 0009 (Proposed) |
| Hosting, runtime model, CI | **TBD** | Sprint 11 / open decisions |

---

## Request flow

```text
Browser
  → Next.js page (Server Component)         Route Handler (app/api/…)
      → application use case                    → application use case
        → repository port                         → repository port
          → implementation chosen in config/        → backing implementation
             (today: HTTP repository → in-process dummy dispatch
              → dummy Route Handlers → static repositories)
             (future: provider-backed implementation reading a cache or
              snapshot; never a per-request provider call)
```

- Route Handlers and pages are thin: validation, status codes, composition.
- Business rules stay in `domain/` and `application/`.
- Provider DTOs stay in `infrastructure/` behind mappers (ADR 0005).
- Browser code never receives credentials and never calls provider endpoints.

---

## Server-only boundary

- Modules that read secrets or call external services start with
  `import "server-only"`. Next.js 16.3 resolves this import natively; Vitest
  resolution is decided in the implementing task (no dependency is added
  during planning).
- Secret environment variables never use `NEXT_PUBLIC_`. The only public
  variable today is `NEXT_PUBLIC_SITE_URL` (not a secret).
- `"use client"` modules must not import `config/`, `infrastructure/`, or
  provider code. They receive precomputed view models (as the S5-T04 variant
  selector does).

---

## Current state (verified in S6-T02)

- Dummy API: `GET /api/categories`, `GET /api/products`,
  `GET /api/products/{slug}` as Route Handlers over static repositories.
- The storefront uses an in-process dispatch (`config/catalog-api-dispatch.ts`);
  it makes no network calls.
- No secrets, provider code, database, or persistent writes exist.
- The API client has no timeout/retry policy (TD-008); acceptable while
  dispatch is in-process.

---

## Testing

- Domain and application: Vitest unit tests with fakes.
- Route Handlers: handler tests plus `npm run test:http` against
  `next start` (manual; TD-006).
- Provider adapters (Sprint 7): mapper and contract tests with fakes or
  redacted recordings; never real provider calls in automated tests.
- Secret isolation: import-boundary tests and a build-output check (planned in
  Sprint 6).

---

## Security

- Secrets only in host environment variables; never in Git.
- Validate all external input at Route Handler boundaries and all provider
  responses in adapters.
- No personal data in logs. Customer data handling is TBD (Sprint 8).
- Auth, admin, and RBAC are future Next.js work requiring their own ADRs
  (Sprint 8).
