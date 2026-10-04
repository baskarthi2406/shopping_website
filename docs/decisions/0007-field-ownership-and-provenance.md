# ADR 0007 — Field-level Ownership and Provenance

- **Status:** Proposed — ownership columns require a business decision.
  **Provenance section accepted** by the project owner (2026-10-04, S6-T13).
- **Date:** 2026-09-29 (provenance accepted 2026-10-04)

## Context

Catalog content today comes from approved records committed in
`frontend/infrastructure/catalog/data/`. Commercial fields (SKU, UOM, price,
inventory) are `null` for all 12 products and no product has variants. Zoho
POS is the intended future source of some data, but its fields, identifiers,
and capabilities are unverified. Earlier documentation called PostgreSQL the
“system of record” for catalog and inventory while Sprint 7 planned Zoho as the
source of products, prices, and stock; nothing assigned ownership per field.

## Ownership (open)

| Field | Current source | Candidate owners | Status |
|-------|----------------|------------------|--------|
| Product/category ID (Mini Mystiq) | Repository records | Mini Mystiq | Proposed: Mini Mystiq (ADR 0005 separates it from provider IDs) |
| SEO slug (`/p/…`, `/c/…`) | Repository records | Mini Mystiq; provider custom field (if one exists) | **Open** (TD-005) |
| Category tree and order | Repository records | Mini Mystiq; provider categories | **Open** |
| Product name, description | Repository records | Mini Mystiq; Zoho | **Open** |
| Images | `public/` files (TD-003) | Mini Mystiq; provider-hosted | **Open** |
| SEO metadata, OpenGraph, JSON-LD | Derived from name/description/images by `application/seo` | Follows the content owner | Follows name/description decision |
| Publication status | Mapper sets `active` | Mini Mystiq; Zoho item status | **Open** |
| SKU | None (`null`) | Zoho | **Open** (Zoho fields unverified) |
| Unit of measure | None (`null`; UOM records empty) | Zoho | **Open** |
| Price, compare-at price | None (`null`) | Zoho | **Open** |
| Currency | None | Provider-supplied value only; never inferred from store location | **Open** (Q9); rule already accepted in S5-T03 |
| Inventory quantities and status | None (`null`) | Zoho (per location? TD-004) | **Open** |
| Variants and attributes | None (`[]`) | Zoho item groups (unverified) | **Open** |

Accepted constraints that apply whichever owner is chosen (from S4-T08 and
S5-T02/T03): no invented values; `null` is never `0`; unknown inventory blocks
purchase; a variant never inherits parent price or inventory; currency is not
inferred.

## Provenance (accepted 2026-10-04)

Every provider-sourced field is handled server-side in one of four states:

| State | Meaning | Public contract value |
|-------|---------|-----------------------|
| `verified` | Supplied by the owning source, with source and observation time known, and within the freshness threshold | The value |
| `missing` | The owning source was asked and returned no value | `null` |
| `unknown` | No owning source has supplied the field (all current data) | `null` |
| `stale` | Was verified, but is older than the freshness threshold | Inventory: `null` quantities and status `unknown` (never implies availability). Price: `null` (hidden; purchase stays blocked) |

- Provenance lives in server-side infrastructure and application mapping. It
  is **not** added to the public contract unless separately approved.
- An empty or unreachable provider result is `unknown` or an error, never
  “unavailable” or “out of stock”.

**Owner-approved rules (S6-T13):**

1. Evaluation order for one field group (price or inventory), per product and
   per variant independently:
   - `unknown` when there is no observation; the field's owner is still open
     (no source qualifies); the source is blank or not the owning source; the
     observation time is missing or not ISO 8601 with an explicit offset; the
     observation time is later than the evaluation time; or the value fails
     the existing contract validation (malformed);
   - `missing` when the owning source returned no value and the observation
     is within the threshold; once older than the threshold it is `unknown`;
   - `stale` when the value is valid but older than the threshold;
   - `verified` otherwise.
2. **Freshness threshold:** 24 hours (`DEFAULT_FRESHNESS_THRESHOLD_MS`),
   inclusive: an age exactly equal to the threshold is fresh. Set by the owner
   as the S6-T13 policy default because no threshold had been decided; price
   and inventory may later receive separate values. This replaces the earlier
   “no staleness logic until a threshold is set” note.
3. **Stale price** resolves to `null`: the price is hidden and purchase stays
   blocked.
4. **Future timestamps** always resolve to `unknown`; there is no clock-skew
   tolerance.
5. The evaluation time is always supplied explicitly; business logic never
   reads the clock.
6. Price and inventory provenance are independent; a verified price never
   verifies stock or the reverse. Verified data does not bypass the existing
   purchasability rules (status, quantity, price, currency, stock).

Implementation: `frontend/application/catalog/field-provenance.ts` (pure; not
yet wired into any runtime path).

## Consequences

- Provider adapters must record source and observation time for every
  commercial value they map, and pass them through the S6-T13 rules.
- Content ownership decisions drive whether persistence is needed (ADR 0008).
- Changing the public contract to expose provenance needs a contract update
  and approval.
