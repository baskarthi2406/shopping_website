# Production Decision Gate — P0 Decisions

Status: **DECISION ANALYSIS ONLY** (2026-10-04). Nothing here is approved for
implementation. Demo baseline `589b74a` stays frozen; demo Sales Order
`SO-00001` must not be modified, voided, deleted, or duplicated.

Sources: `PRODUCTION-READINESS.md`, `DEMO-ZOHO-SALES-ORDER.md`,
`S6-T15-ZOHO-CATALOG-FEASIBILITY.md`, ADR 0007 (provenance accepted), ADR 0008
(persistence, proposed), ADR 0009 (provider access; S6-T14 amendment
accepted), `docs/sprints/SPRINT-06.md` §7–§8, `TECHNICAL_DEBT.md`.

## Production Decision Gate

### Classification

| P0 | Area | Classification |
|----|------|----------------|
| P0-1 | GST / tax | DECISION REQUIRED (+ Zoho verification) |
| P0-2 | Online inventory / location | DECISION REQUIRED (+ Zoho verification) |
| P0-3 | Zoho production authentication | TECHNICAL IMPLEMENTATION REQUIRED (token storage depends on hosting, D11) |
| P0-4 | Duplicate order protection | TECHNICAL IMPLEMENTATION REQUIRED (+ Zoho verification) |
| P0-5 | Order failure / retry | TECHNICAL IMPLEMENTATION REQUIRED (+ Zoho verification) |
| P0-6 | Category / subcategory | DECISION REQUIRED (owner mapping) + TECHNICAL IMPLEMENTATION REQUIRED |
| P0-7 | Images | TECHNICAL IMPLEMENTATION REQUIRED (owner confirms image source) |
| P0-8 | Customer / order strategy | DECISION REQUIRED |
| P0-9 | Zoho API limits / budget | TECHNICAL VERIFICATION REQUIRED (blocks P0-3, P0-7, catalog caching) |
| P0-10 | Production error handling | TECHNICAL IMPLEMENTATION REQUIRED (rules mostly already accepted) |

None is VERIFIED / NO DECISION REQUIRED. Customer accounts and order history
are DEFERRED (P1); anonymous checkout is sufficient for P0-8.

### Decision table

| Area | Current evidence | Decision required | Blocks production? | Next action |
|---|---|---|---|---|
| P0-1 GST / tax | Items carry `item_tax_preferences` GST 5% (intra/inter); top-level `tax_percentage: 0`; no inclusive flag on items. Demo SO: sub-total 464, tax 23.20 (GST5), total 487.20, `is_inclusive_tax: false` (not sent; Zoho default). Org tax preferences not read. `label_rate` (490/990) meaning unverified. Storefront shows ₹464 and no tax line. | Owner: whether the Zoho `rate` is the GST-inclusive shelf price or a pre-tax price; what the shopper sees (one inclusive price vs price + GST line); whether `label_rate` is the printed MRP and may be shown. Technical (follows): Zoho computes the authoritative tax on the Sales Order; the storefront total must match it. | **Yes** — shopper total ≠ Zoho total today. | Owner answers OD-1/OD-2; verify V3 (org tax setting, `is_inclusive_tax` effect) read-only and in a test org if available. V3 read-only result: **CONFIGURATION-DEPENDENT**, `label_rate` NOT VERIFIED — `docs/project/ZOHO-TAX-VERIFICATION.md`. |
| P0-2 Inventory / location | Org-level aggregates only (`stock_on_hand`, `actual_available_for_sale_stock`, `actual_committed_stock`). Locations list → 401 (scope). SO without location accepted (draft). Draft SO did not commit stock (committed 0 after order). | Owner: which store/location sells online; whether online and in-shop sales share stock; acceptable oversell handling for the last unit. Technical: whether confirmed SOs commit stock; whether location is required/accepted on SOs. | **Yes** — with org-level stock and no reservation, the last unit can be sold twice (online + shop or two shoppers). | Owner answers OD-3/OD-4; verify V4/V5 with a warehouses/locations read scope. |
| P0-3 Production authentication | OAuth code flow via `accounts.zoho.in`; 3600 s access tokens; refresh works; in-process token cache with shared refresh (`zoho-oauth.ts`). Dev client and scopes (`salesorders.UPDATE`, `contacts.CREATE`) chosen for the spike. Refresh token lives in local `.env.local`. | No owner decision beyond hosting (D11). Technical: production OAuth client; least-privilege scopes for the final flow; refresh token in the host secret store; per-instance refresh vs shared token (ADR 0008 P5); rotation/revocation runbook; token-call budget impact. | **Yes** — dev credentials and local env are not a production setup. | Verify V10 (refresh limits, whether token calls count toward quota); decide scopes after OD-5; implement after D11. |
| P0-4 Duplicate order protection | Client in-flight guard; client reference `MMDEMO-…` reused on retry; in-memory ledger per process (lost on restart, not shared across instances). Zoho `GET /salesorders?reference_number=` lookup verified (read-only). | No owner decision. Technical: minimum persistent mechanism. **Recommended smallest option: Zoho is the idempotency record** — before creating, look up by reference; if Zoho can enforce uniqueness (supplied `salesorder_number` or unique `reference_number`, V6), creation is atomic and no database is needed. Only if Zoho cannot enforce uniqueness and the host runs multiple instances does ADR 0008 need an amendment for a small store (P6). | **Yes** — restarts or multiple instances can duplicate orders. | Verify V6 (read-only docs + test org; never against `SO-00001`); then decide whether ADR 0008 amendment is needed. |
| P0-5 Order failure / retry | Demo: create once; failed create cached (never retried); rejections cleared; sanitized logs. ADR 0009 principle 7: retries for idempotent reads only. | No owner decision. Technical minimum safe behavior (see table below): never auto-retry a create; classify outcomes as definite-failure vs ambiguous; reconcile ambiguous outcomes by reference lookup. | **Yes** | Verify V7 (4xx/429/5xx semantics); implement with P0-4. |
| P0-6 Category / subcategory | Zoho items return flat `category_id` / `category_name` (e.g. "Baby Girl", "Co-Ord Set"); hierarchy not observed. Storefront tree is Mini Mystiq-owned in repository files; "Co-Ord Set" appears under Infants › Baby Girl, Infants › Baby Boy, and Women, so names alone are ambiguous. ADR 0007: category tree owner **open**. D13: production approval of the current tree not assumed. | Owner: confirm the storefront tree is production content (D13) and approve the Zoho category → storefront category mapping (or restructure Zoho categories so each maps uniquely). Technical: mapping keyed by Zoho `category_id` (and group where needed), in a **committed repository mapping file** under server-side config/infrastructure (ADR 0008 P1/P2 alternative; no database). Unmapped items are not listed. | **Yes** — Category → Subcategory → Product listing is required. | Verify V8 (category list/hierarchy endpoint and scope); owner approves mapping table (OD-6). V8 verified read-only: Zoho has a 45-category tree (`/inventory/v1/categories`); additional merchandising mapping required — `docs/project/CATEGORY-MAPPING-DESIGN.md`. |
| P0-7 Images | Bytes via authenticated `GET /items/{id}/image` (≈4 MB JPEG observed); `image_document_id` present; no public URL. Demo loads no images. ADR 0007: image owner **open**; TD-003. | Owner: confirm Zoho item images are the production image source and who authors alt text. Technical minimum: server-only fetch → resize/convert → cache keyed by item + `image_document_id` → served from a Mini Mystiq URL (or pre-generated at catalog refresh); never on page view per request to Zoho; browser never receives Zoho URLs or tokens. Cache durability depends on hosting (ADR 0008 P3). | **Yes** for a credible storefront (no product images today). | Verify V9; owner answers OD-7; design after D11. |
| P0-8 Customer / order strategy | Shared demo contact; shopper name/mobile/address in SO notes; anonymous; no accounts or history. | Owner: one shared "online customer" contact with details on the order vs a Zoho contact per shopper; which shopper details are required; data retention/privacy expectations; launch payment method (COD only?) and when an order is confirmed (automatic vs staff review). | **Yes** | Owner answers OD-5/OD-8; verify V11 only if per-shopper contacts are chosen. |
| P0-9 Zoho API limits / budget | 7,500 requests/month **reported, not verified** (TD-010). Pagination limits unverified (Z5). Current demo reads Zoho live on page view (acceptable only for the demo). | No owner decision except supplying plan details if only visible in the account. Technical: verify quota and design a budgeted catalog snapshot refresh (ADR 0009 principles 6, 8, 9). | **Yes** — live reads per page view cannot be used in production. | Verify V1/V2; then plan caching/snapshot with hosting (D11). *Interim snapshot implemented* (2026-10-04): in-memory per-process Zoho product snapshot behind `CATALOG_PRODUCT_SOURCE=zoho-snapshot` (ADR 0009 amendment); no per-page Zoho reads. Durable/shared snapshot and request counting still await V1, OD-9, ADR 0008. |
| P0-10 Error handling | Accepted rules: unknown inventory blocks purchase; stale/unknown price → hidden, purchase blocked (ADR 0007); provider failure → sanitized `temporarily_unavailable`, never "out of stock" (ADR 0009 principle 5). Demo checkout already distinguishes cart changed / not confirmed / unavailable. | No owner decision (copy review only). Technical: apply the rules below consistently to production pages and checkout. | **Yes** | Implement after P0-5 and catalog snapshot. |

### P0-5 failure cases — minimum safe behavior

| Case | Did Zoho create the order? | Minimum production behavior |
|------|---------------------------|-----------------------------|
| Validation / price / stock rejection before calling Zoho | No | Return "cart changed"; shopper may retry with the same reference. |
| Token refresh fails before create | No | "Temporarily unavailable"; safe to retry. |
| Connection refused / DNS failure before the request is sent | No | "Temporarily unavailable"; safe to retry. |
| Zoho 4xx (validation) | No (to verify, V7) | Log sanitized code; "could not place order"; no automatic retry. |
| Zoho 429 | No (to verify, V7) | Honor `Retry-After`; tell shopper to retry later; no automatic create retry. |
| Zoho 5xx | **Ambiguous** | Treat as ambiguous (below). |
| Timeout or network failure after the request was sent | **Ambiguous** | Do not show success or failure. Reconcile by reference lookup (read, retry-safe). Found → show success. Not found → keep "not confirmed", tell shopper not to re-order, show store contact; allow resubmission only with the same reference and only when Zoho uniqueness (V6) or a persistent ledger guarantees no duplicate. |
| Browser retry / double submit | — | Same reference reused; server returns the existing result (P0-4). |
| Server retry | — | Never automatically retry a create. Reads (lookup, catalog) may retry per ADR 0009 principle 7. |

### P0-10 customer-facing behavior (minimum)

| Situation | Behavior |
|-----------|----------|
| Catalog unavailable | Serve last snapshot within the 24 h freshness rule; otherwise the existing "temporarily unavailable" error view. Never show "out of stock". |
| Price unavailable or stale | Hide price; purchase blocked (ADR 0007). |
| Stock unknown or stale | "Stock not confirmed"; purchase blocked. |
| Order creation definitely failed | Keep the cart; "We couldn't place your order. Please try again." |
| Ambiguous order result | Keep the cart; show the reference; "Your order is being confirmed — please don't place it again"; show store contact; staff reconcile by reference. |

## Decisions Required From Owner

Only business decisions; technical questions are listed separately.

1. **OD-1 Tax-inclusive pricing.** Is the Zoho selling price (`rate`, e.g.
   ₹464) meant to be the GST-inclusive price the shopper pays, or a pre-tax
   price to which GST is added (₹487.20)?
2. **OD-2 Price presentation.** Should shoppers see one all-inclusive price,
   or price + GST shown separately? Is `label_rate` (e.g. ₹490) the printed
   MRP, and may it be shown? Are shipping charges part of the checkout total
   (homepage "Free Shipping above ₹999" claim, TD-011)?
3. **OD-3 Online stock source.** Which store/location fulfils online orders,
   and does online share stock with in-shop sales?
4. **OD-4 Last-unit / oversell policy.** If two sales take the last unit,
   which is acceptable: block online orders when stock is low, accept and
   cancel/contact the shopper, or confirm stock manually before fulfilment?
5. **OD-5 Order confirmation and payment.** Is COD the only launch payment
   method? Should online orders be confirmed automatically or reviewed by
   staff first? Who handles cancellations?
6. **OD-6 Categories.** Is the current storefront category tree approved as
   production content (D13)? Approve how each Zoho category maps into it
   (e.g. which "Co-Ord Set" parent), or restructure categories in Zoho so each
   maps uniquely.
7. **OD-7 Images.** Are Zoho item images the production image source? Who
   provides alt text?
8. **OD-8 Customer records.** One shared "online customer" in Zoho with
   shopper details on each order, or a Zoho contact per shopper? Which
   details are required (name, mobile, address; anything else)? Any
   retention/privacy requirement for shopper data?
9. **OD-9 Hosting (D11).** Hosting choice and budget (long-running Node vs
   serverless); it determines caching, token storage, and whether any store is
   needed. Hosting evidence, snapshot implications, request budget, and
   options: `docs/project/HOSTING-SNAPSHOT-DECISION.md` (hosting NOT DECIDED).

## Technical Verification Required

All read-only against production, or in a Zoho test/sandbox organization if
one exists (Z12). No writes against the live organization; `SO-00001`
untouched.

| ID | Verify | Unblocks |
|----|--------|----------|
| V1 | Actual API quota for this plan: daily/monthly limits, reset period, per-minute limit, concurrency, whether OAuth token calls and image downloads count, overage behavior, any usage headers (Z1, TD-010) | P0-9, P0-3, P0-7 |
| V2 | Pagination: maximum `per_page`, total item count, requests per full catalog refresh; modified-since / `last_modified_time` filtering for incremental refresh (Z5, Z6) | P0-9 |
| V3 | Organization tax settings (tax-inclusive pricing preference); effect of `is_inclusive_tax: true` on SO totals; meaning of `is_tax_calculation_on_label_price` | P0-1 |
| V4 | Locations/warehouses: required scope, number of locations, per-location stock fields, whether SOs require or accept a location | P0-2 |
| V5 | Stock effect of confirming an SO (committed stock), and interaction with in-shop POS sales | P0-2, P0-5 |
| V6 | Uniqueness: can `salesorder_number` be supplied (auto-numbering off per request) and is it unique-enforced; is `reference_number` unique-enforced; exact-match search behavior | P0-4 |
| V7 | Error semantics: does any 4xx/429 guarantee no record was created; `Retry-After` on 429; typical latency/timeout behavior | P0-5 |
| V8 | Category list endpoint, parent/child hierarchy, required scope; whether item groups carry a category | P0-6 |
| V9 | Image endpoint: available sizes/thumbnails, change detection via `image_document_id`, quota cost | P0-7 |
| V10 | Refresh-token limits (access tokens per refresh token per period), refresh-token lifetime and revocation, separate production client, minimal scope set | P0-3 |
| V11 | Contacts: search by mobile, duplicate handling (only if OD-8 = per-shopper contacts) | P0-8 |

## Implementation Backlog

Proposed only; each item needs an explicit task. Nothing below is
implemented.

### P0 (required before real customers), recommended order

1. **Zoho production authentication** (P0-3) — after V10, OD-9.
2. **Request budget and catalog snapshot/caching** (P0-9) — after V1, V2,
   OD-9. Replaces live per-page Zoho reads. *Interim in-memory snapshot
   implemented* (ADR 0009 amendment, 2026-10-04); durable storage and
   budget counting remain.
3. **Category/subcategory mapping** (P0-6) — repository mapping file; after
   V8, OD-6. *Partially implemented* (high-confidence rows + one group
   override in `infrastructure/zoho/zoho-category-mapping.ts`); remaining
   placements await OD-6 (`CATEGORY-MAPPING-DESIGN.md` §6–7).
4. **Image proxy/cache** (P0-7) — after V9, OD-7; uses the snapshot refresh.
5. **Tax handling** (P0-1) — after OD-1, OD-2, V3.
6. **Inventory/location rules** (P0-2) — after OD-3, OD-4, V4, V5.
7. **Customer/order strategy** (P0-8) — after OD-5, OD-8.
8. **Persistent idempotency + failure/retry/reconciliation** (P0-4, P0-5) —
   after V6, V7; ADR 0008 amendment only if Zoho cannot enforce uniqueness.
9. **Production error handling** (P0-10) — after items 2 and 8.

### P1

1. Order history.
2. Customer accounts.
3. Product descriptions (empty in Zoho today).
4. Inventory synchronization (incremental refresh).
5. Order cancellation flow.
6. Admin/order monitoring and alerting (ADR 0009 principle 9).

### P2

1. Wishlist.
2. Reviews.
3. Coupons.
4. Advanced analytics.
5. Personalization.
