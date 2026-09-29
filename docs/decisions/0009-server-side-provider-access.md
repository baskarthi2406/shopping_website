# ADR 0009 — Server-side Provider (Zoho) Access Policy

- **Status:** Proposed — principles for acceptance; all Zoho specifics
  unverified
- **Date:** 2026-09-29

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

## Consequences

- Sprint 6 may build provider-independent pieces: server-only isolation,
  contract tests, provenance rules, and an outbound request policy.
- No Zoho client, SDK, credential, or call is added before access is verified
  and a Sprint 7 task is approved.
