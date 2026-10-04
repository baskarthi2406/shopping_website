# Production Readiness — Zoho Storefront Gap Assessment

Status: **ASSESSMENT ONLY** (2026-10-04). Nothing here is approved for
implementation. Each backlog item needs an explicit task. P0 decisions,
owner questions, and Zoho verifications: `docs/project/PRODUCTION-DECISIONS.md`.

## Demo baseline (frozen)

**Baseline commit: `589b74a`** (`feat(demo): connect storefront checkout to
Zoho sales order`), branch `s5-t01-sprint-5-planning`. Details and the
verified run: `docs/project/DEMO-ZOHO-SALES-ORDER.md`. Catalog evidence:
`docs/project/S6-T15-ZOHO-CATALOG-FEASIBILITY.md`.

The demo flow must not be changed. The single demo Sales Order `SO-00001`
(draft) must not be modified, confirmed, or deleted automatically; no further
Zoho order may be created without explicit approval.

| Capability | Result |
|------------|--------|
| Zoho OAuth authentication | PASS |
| Zoho refresh token | PASS |
| Organization discovery | PASS |
| Real Zoho products | PASS |
| Real Zoho selling price (`rate`) | PASS |
| Real Zoho stock (organization-level) | PASS |
| Product → variant mapping | PASS |
| Category/product display (demo product list) | PASS |
| Cart (device-local) | PASS |
| Checkout (name, mobile, address) | PASS |
| Demo / COD payment label (no payment) | PASS |
| Draft Zoho Sales Order creation | PASS (`SO-00001`) |
| Zoho Sales Order read-back verification | PASS |
| Cart clearing after order | PASS |
| Basic duplicate-click protection | PASS (process lifetime only) |

### Current proven product mapping

- Zoho **item group** → Mini Mystiq **product**.
- Zoho **item** → Mini Mystiq **variant** (SKU, attribute values, price,
  stock). Ungrouped items become single-variant products.
- Selling price = item `rate`. `label_rate` is not mapped (unverified meaning).

## Confirmed limitations (not solved)

### Tax
Zoho adds 5% GST (item tax `GST5`, `is_inclusive_tax: false`). Example:
storefront ₹464.00 → Zoho Sales Order ₹487.20 (464 + 23.20).

Decisions required:
- Is the Zoho `rate` tax-exclusive for all items?
- Should the storefront show tax separately?
- Should the checkout total include GST?
- Which system is authoritative for final tax calculation?

### Inventory
Verified: organization-level stock only; location-specific stock not
verified (locations list not authorized by granted scopes); a draft Sales
Order does not reserve/commit stock.

Decisions required: which store/location sells online; stock reservation
behavior (when, and released when); handling concurrent orders for the last
unit.

### Images
Zoho item images require authenticated access. Requirement:
Zoho → server-side image proxy/cache → optimized browser image. Authenticated
Zoho URLs must never be exposed to the browser.

### Customers
Demo: one shared demo customer; shopper name/mobile/address only in order
notes; no customer accounts or history.

Decisions required: create/update Zoho customers per shopper? anonymous
(guest) checkout? customer identity strategy and personal-data handling.

### Orders
Demo: Sales Order, draft, no payment, no fulfilment.

Decisions required: when an order is confirmed; when inventory is affected;
cancellation; failure and retry handling; idempotency.

### Duplicate protection
Current: client in-flight guard, client reference reused on retry, and an
in-memory server ledger (lost on restart, single process only).
Requirement: persistent idempotency and order state (requires ADR 0008
persistence decision). Not implemented.

### Categories
Requirement: Category → Subcategory → Product listing navigation backed by
Zoho data. The Zoho category/group → storefront taxonomy mapping is not yet
defined; the demo lists products without category placement.

## Demo vs production

| Area | Demo | Production |
|---|---|---|
| Catalog | Real Zoho (first page, live reads) | Real Zoho + caching/sync strategy |
| Price | Real Zoho `rate` | Tax policy required |
| Stock | Org-level | Location/reservation policy |
| Images | Not loaded | Authenticated proxy/cache |
| Cart | Device-local | Decide persistence |
| Customer | Shared demo customer | Customer strategy |
| Checkout | Demo/COD | Production order/payment strategy |
| Order | Draft Sales Order | Confirmation/idempotency strategy |
| Payment | None | Future |
| Order history | None | Future |
| Category | Not mapped (flat demo list) | Category/subcategory mapping |
| Security | Server-only, local env secrets | Hardened production secrets/token storage |
| Monitoring | Minimal (sanitized server logs) | Required |
| Zoho limits | Not fully verified | Request budget/rate limits |

## Production backlog (proposed, not approved)

**P0 — required before real customers**

1. GST/tax handling (display, totals, authoritative calculation).
2. Inventory/location decision and reservation behavior.
3. Production Zoho authentication: token refresh and secure token storage.
4. Persistent order idempotency.
5. Order failure/retry strategy (unknown outcomes, reconciliation).
6. Category/subcategory mapping from Zoho to the storefront taxonomy.
7. Production image proxy/cache.
8. Real customer/order strategy (customer records, confirmation rules).
9. Zoho API request limits/budget (TD-010) and catalog caching.
10. Production error handling and user messaging.

**P1 — important, can follow launch**

1. Order history.
2. Customer accounts.
3. Better product descriptions.
4. Inventory synchronization.
5. Order cancellation.
6. Admin/order monitoring.

**P2 — later enhancements**

1. Wishlist.
2. Reviews.
3. Coupons.
4. Advanced analytics.
5. Personalization.
