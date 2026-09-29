# Sprint 7 — Zoho POS Integration

| Field | Value |
|-------|-------|
| Sprint ID | S7 |
| Phase | Phase 2 — External Integration |
| Objective | Integrate verified Zoho POS APIs as server-only Next.js adapters behind Mini Mystiq repository contracts |
| Status | NOT_STARTED |
| Dependencies | Sprint 6 completed; Zoho API access and documentation available; readiness checklist (`SPRINT-06.md` §7) verified |

Architecture: ADR 0006 (Next.js-only; no separate backend), ADR 0007
(ownership and provenance), ADR 0008 (persistence only with evidence), and
ADR 0009 (server-side provider access policy).
| Task IDs | TBD before Sprint 7 starts |

## Planned scope

- Verify Zoho POS API capabilities, authentication, identifiers, pagination,
  errors, rate limits, and synchronization constraints
- Define Zoho transport DTOs inside server-only infrastructure
  (`frontend/infrastructure/`), using the S6-T14 outbound request policy
- Map Zoho category/product/variant/pricing/inventory data to stable Mini Mystiq
  domain/application models
- Implement repository adapters and budgeted cache/snapshot refresh; decide
  persistence only through an ADR 0008 amendment
- Add contract (S6-T12 suite), mapper, provenance, failure, and integration
  tests using fakes/redacted recorded fixtures

## Guardrails

- No Zoho DTO may reach pages, components, or application use cases.
- Do not assume the dummy API exactly matches Zoho until verified.
- Never call real Zoho services from CI or automated tests.
- Secrets and tokens stay outside Git, in server-only environment variables
  (never `NEXT_PUBLIC_`); browser code never calls Zoho.
- No page render or public Route Handler calls Zoho per request.
- Conflict resolution, ownership, caching, webhooks/polling, and outage behavior
  remain TBD until the actual API is assessed.

## Known constraints (unverified)

- **API allowance:** a Zoho allowance of **7,500 requests per month** was
  stated for this project (recorded in S5-T08). The account's actual limits
  (per plan, per organization, per minute/day, and what counts as a request)
  have **not** been verified. Verify them against the real account before
  designing synchronization. Assume storefront page views must never call Zoho
  directly: 7,500 per month averages about 250 per day. Tracked as TD-010.
- **Readiness checklist:** `SPRINT-06.md` §7 (quota, permissions, auth and
  token refresh, data mapping, pagination and budgeting, caching and sync
  frequency, retries/rate limiting/monitoring, order and inventory
  capabilities). All items are unverified until real account access exists.

## Exit criteria

The storefront can switch from dummy repositories to Zoho-backed
repositories without a UI rewrite. Do not start Sprint 8 automatically.
