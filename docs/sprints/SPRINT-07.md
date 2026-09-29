# Sprint 7 — Zoho POS Integration

| Field | Value |
|-------|-------|
| Sprint ID | S7 |
| Phase | Phase 2 — External Integration |
| Objective | Integrate verified Zoho POS APIs behind Mini Mystiq repository contracts |
| Status | NOT_STARTED |
| Dependencies | Sprint 6 completed; Zoho API access and documentation available |
| Task IDs | TBD before Sprint 7 starts |

## Planned scope

- Verify Zoho POS API capabilities, authentication, identifiers, pagination,
  errors, rate limits, and synchronization constraints
- Define Zoho transport DTOs inside infrastructure
- Map Zoho category/product/variant/pricing/inventory data to stable Mini Mystiq
  domain/application models
- Implement repository adapters and synchronization/fallback behavior
- Add contract, mapper, failure, and integration tests using fakes/recorded
  non-secret fixtures

## Guardrails

- No Zoho DTO may reach pages, components, or application use cases.
- Do not assume the dummy API exactly matches Zoho until verified.
- Never call real Zoho services from CI.
- Secrets and tokens stay outside Git.
- Conflict resolution, ownership, caching, webhooks/polling, and outage behavior
  remain TBD until the actual API is assessed.

## Known constraints (unverified)

- **API allowance:** a Zoho allowance of **7,500 requests per month** was
  stated for this project (recorded in S5-T08). The account's actual limits
  (per plan, per organization, per minute/day, and what counts as a request)
  have **not** been verified. Verify them against the real account before
  designing synchronization. Assume storefront page views must never call Zoho
  directly: 7,500 per month averages about 250 per day. Tracked as TD-010.
- **Readiness checklist:** `SPRINT-06.md` §9 (quota, permissions, auth and
  token refresh, data mapping, pagination and budgeting, caching and sync
  frequency, retries/rate limiting/monitoring, order and inventory
  capabilities). All items are unverified until real account access exists.

## Exit criteria

The storefront can switch from dummy/production repositories to Zoho-backed
repositories without a UI rewrite. Do not start Sprint 8 automatically.
