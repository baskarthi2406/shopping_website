# ADR 0008 — Persistent Storage

- **Status:** Proposed — no persistent store in Sprint 6; any future store
  needs an amendment with evidence
- **Date:** 2026-09-29

## Context

The application writes nothing today. Catalog content is committed in the
repository and served through static repositories and the dummy API. There is
no cart, order, account, admin, or sync job. ADR 0006 removed the separate
FastAPI/PostgreSQL backend; this ADR records whether persistence is needed at
all.

Next.js 16.3 caching (bundled documentation, `use cache` / `use cache: remote`)
matters here:

- `use cache` stores entries in memory per server instance. In serverless
  environments that memory is not shared and is short-lived.
- Remote cache handlers are shared across instances but entries do not persist
  across deploys (keys include the build or deployment ID).
- `unstable_cache` and the `fetch` cache are documented as the options that
  persist across deploys; their durability depends on the host.

## Assessment

No current requirement needs a database. Possible future needs, each with the
condition that would make it real:

| # | Data | Needs persistence when | Alternatives |
|---|------|------------------------|--------------|
| P1 | Provider ID ↔ Mini Mystiq ID and SEO slug mapping (TD-005) | Zoho supplies no stable slug/custom field and mappings must change without a deploy | Mapping file committed in the repository |
| P2 | Merchandising content Zoho does not hold (category tree, descriptions, images) | Non-developers must edit it without a deploy | Repository files (current); a CMS (vendor TBD) |
| P3 | Snapshot of provider catalog, price, and stock | The host is serverless or deploys often, so Next.js caches alone would exceed the verified request budget | Next.js data cache on a long-running Node host; remote cache handler |
| P4 | Request-budget counter | An accurate monthly count across instances is required and Zoho does not report usage | In-memory counters with logs (approximate); provider-reported usage (unverified) |
| P5 | Refreshed OAuth tokens (if the auth flow issues them) | Tokens cannot be refreshed on demand per instance within budget | Refresh per instance; host secret store |
| P6 | Carts, orders, customers | Sprint 8 scope is approved | Deferred |

## Decision (proposed)

- Sprint 6 adds **no** database, ORM, migration tool, KV store, or new storage
  dependency.
- PostgreSQL is **not selected**; it remains one candidate with KV stores,
  object storage, and a CMS.
- A store is chosen only by amending this ADR with evidence: verified Zoho
  quota and capabilities, the ownership decisions in ADR 0007, and the hosting
  decision (ADR 0006).
- Any future store is accessed only from server-only infrastructure behind a
  repository or port. The browser never accesses it.

## Consequences

- Sprint 6 tasks are limited to server boundaries, contract tests, provenance
  rules, and outbound request policy.
- P1–P5 are evaluated in the Zoho readiness work before Sprint 7
  implementation.
