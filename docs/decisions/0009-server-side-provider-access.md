# ADR 0009 — Server-side Provider (Zoho) Access Policy

- **Status:** Proposed — principles for acceptance; all Zoho specifics
  unverified. **Minimum boundary amendment accepted** for the S6-T14
  feasibility demo (2026-10-04, project owner authorization).
- **Date:** 2026-09-29 (amended 2026-10-04)

## Context

Zoho POS is the intended provider (Sprint 7). No API access, documentation
review, sample response, or credential has been verified. A Zoho allowance of
**7,500 requests per month** has been reported for this project but is **not
verified** (TD-010). As arithmetic only, that averages about 250 per day or 10
per hour, far below storefront traffic, so provider calls cannot be made per
page view. ADR 0006 places all server-side code in Next.js.

## Decision (proposed principles)

1. **Location.** Provider transport types, clients, and mappers live in
   server-only modules under `frontend/infrastructure/` (e.g.
   `infrastructure/zoho/`). Pages, components, and application use cases never
   import them (ADR 0005). Selection happens in `config/`.
2. **Secrets.** Credentials come from host environment variables without the
   `NEXT_PUBLIC_` prefix, are read only in server-only modules, are never
   logged or serialized to the client, and appear in `.env.example` only as
   empty placeholders. Where refreshed tokens are stored is open (ADR 0008 P5).
3. **Authorization.** The storefront has no user authentication. Provider calls
   are made by the server as the application, with the least-privilege,
   read-only scopes Zoho offers (scopes unverified). Any Route Handler exposing
   provider-derived data is read-only, accepts only validated parameters, and
   never forwards arbitrary requests.
4. **Validation.** Provider responses are untrusted. They are parsed and
   validated in the adapter, mapped to the S4 contract invariants, and given
   provenance (ADR 0007). Whether invalid records are skipped or fail the batch
   is open.
5. **Errors.** Provider failures become sanitized contract errors
   (`temporarily_unavailable`, `not_found`); the storefront keeps its existing
   error UI. Serving last-known data during an outage is open, limited by the
   stale rules in ADR 0007.
6. **Caching.** Page renders and public Route Handlers read cached or
   snapshot data only. Refresh frequency is derived from the verified quota
   and page size; the mechanism depends on hosting (ADR 0008 P3).
7. **Retries.** Bounded: idempotent reads only, a small maximum attempt count,
   exponential backoff with jitter, `Retry-After` honored, and no retry on
   authorization or validation failures. Exact numbers are set in the
   implementing task.
8. **Rate limiting.** A concurrency limit on outbound calls and a budget guard
   that stops non-essential calls near a configured threshold.
9. **Observability.** Every outbound provider request (including token
   requests, if they count against the quota — unverified) is counted and
   logged with an endpoint label and outcome, without secrets, tokens, or
   personal data. Durable counting depends on ADR 0008 P4.
10. **Testing.** Fakes and redacted recorded responses only; no real provider
    calls in automated tests or CI; a build check verifies secrets are absent
    from client bundles.

## Not decided (require verified information)

Account quota and reset period; endpoints and permissions available to this
account; authentication flow and token lifetime; pagination; item, variant,
price, currency, and stock field mapping; stock per location (TD-004); whether
order or inventory write operations exist and are ever in scope.

## Amendment — S6-T14 Zoho request boundary (accepted 2026-10-04)

The project owner authorized a 3-day Zoho POS feasibility demo. For that, the
following minimum rules are accepted now; principles 3–9 above stay proposed.

- Zoho credentials are server-only, read from non-`NEXT_PUBLIC_` environment
  variables (`ZOHO_API_BASE_URL`, `ZOHO_ACCESS_TOKEN`,
  `ZOHO_REQUEST_TIMEOUT_MS`) in `import "server-only"` modules.
- Browser/client code never receives credentials, tokens, authorization
  headers, or raw provider authentication details.
- Zoho requests originate only from trusted Next.js server-side code, through
  `frontend/infrastructure/zoho/zoho-client.ts`, which keeps every request on
  the configured origin and base path and applies an explicit timeout.
- Normalized errors carry method, path, status, and redacted provider
  code/message only; never tokens, headers, query values, or bodies.
- Raw provider responses stay behind the integration boundary (returned as
  untrusted data for a server-side adapter); the public catalog API is
  unchanged.

S6-T14 establishes the server-side Zoho integration boundary. Actual Zoho
capability verification is deferred to S6-T15. No Zoho compatibility is
claimed. Retries, rate limiting, request budgeting, and token refresh are not
implemented and remain governed by principles 7–9 once Zoho facts are known.

## Amendment — interim catalog snapshot (2026-10-04)

Principle 6 is implemented for products with an **in-memory, per-process**
snapshot, opt-in via `CATALOG_PRODUCT_SOURCE=zoho-snapshot` (default `static`):

- Page renders, the sitemap, and public catalog Route Handlers read the
  snapshot only. A refresh is one `GET /v1/organizations` plus
  `ceil(items / 200)` `GET /items` pages (2 requests for the observed 157
  items), plus a token refresh when the cached token has expired.
- Refresh runs in the background once the snapshot is older than
  `ZOHO_CATALOG_REFRESH_MINUTES` (15–720, default 360); concurrent readers
  share one refresh; failures keep the previous snapshot and back off 5
  minutes; a snapshot older than the 24 h freshness threshold (ADR 0007) is
  not served, and readers get the existing `temporarily_unavailable` error.
- Partial (more than 10 pages), empty, or malformed catalogs fail the
  refresh. Only active products with exactly one approved storefront
  placement that pass the catalog contract are published.
- Budget (arithmetic, quota unverified — V1): at the default interval about
  4 refreshes × 3 requests ≈ 12 requests/day ≈ 360/month **per server
  process**. Multiple instances, restarts, and serverless cold starts each
  add a refresh; durable shared snapshots and request counting still need
  the hosting decision (OD-9) and ADR 0008 P3/P4.

## Consequences

- Sprint 6 may build provider-independent pieces: server-only isolation,
  contract tests, provenance rules, and the S6-T14 request boundary.
- Superseded by the amendment for the feasibility demo: a minimal Zoho
  request wrapper exists (S6-T14). No Zoho call, SDK, product mapping, or
  order creation is added until S6-T15 is approved; no real credential is
  committed.
