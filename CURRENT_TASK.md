# Current Task

No task is approved. Do not start any task until a human explicitly requests it.

---

## Last completed task

| Field | Value |
|-------|-------|
| Task ID | Owner request (not a sprint task id) |
| Task | Polish storefront price type, cart quantity, and header search |
| Status | **COMPLETED** |
| Scope | Verified prices use one readable type treatment on cards, product detail, cart, and checkout. Cart lines show `Qty`. Header search filters the existing catalog by product name, and by category or SKU when those are already on the catalog record. Price values, provenance, stock limits, taxonomy, and Zoho access are unchanged. |

---

## Task ID

None.

## Status

**NOT_STARTED** — Sprint 6 is IN PROGRESS.

S3-T10 Image Optimization, the original “SEO-Friendly URL Strategy”, and
Sprint 5 Track B (S5-T05–S5-T07) remain **DEFERRED**. Do not start them
automatically.

## In progress

**S6-T15 — Zoho feasibility spike.** Authentication PASS; read-only catalog
feasibility **PARTIAL, sufficient for demo**
(`docs/project/S6-T15-ZOHO-CATALOG-FEASIBILITY.md`). Demo product → cart →
checkout → Zoho Sales Order **works** (`docs/project/DEMO-ZOHO-SALES-ORDER.md`):
one owner-approved draft demo Sales Order (`SO-00001`) created and verified.
No invoice or payment. Demo **frozen** at baseline commit `589b74a`;
production gaps and P0/P1/P2 backlog in `docs/project/PRODUCTION-READINESS.md`
(assessment only). P0 decision gate (owner decisions OD-1–OD-9, Zoho
verifications V1–V11, P0 order) in `docs/project/PRODUCTION-DECISIONS.md`,
awaiting owner answers. Read-only tax verification
(`docs/project/ZOHO-TAX-VERIFICATION.md`): SO-00001 taxed 5% on top
(`is_inclusive_tax: false`); inclusive/exclusive is configuration-dependent;
`label_rate` not verified; tax decision still blocked on owner input.
Category mapping design (`docs/project/CATEGORY-MAPPING-DESIGN.md`): Zoho has
its own category tree; mapping by Zoho category ID with group overrides
recommended; owner placement decisions required. Category mapping
**partially implemented**: 13 high-confidence Zoho category rows + the Girl
Coord set group override in server-only
`frontend/infrastructure/zoho/zoho-category-mapping.ts`, wired into
`mapZohoItemsToProducts` (one placement or `[]`); pending categories stay
unmapped. Demo flow unchanged. Interim production catalog snapshot
implemented (P0-9, ADR 0009 amendment): `CATALOG_PRODUCT_SOURCE=zoho-snapshot`
serves storefront products from an in-memory, per-process Zoho snapshot
(background refresh, default 6 h; never served past 24 h; one shared
refresh; build never calls Zoho); default remains `static`. Durable/shared
snapshot, request counting, and images await V1, OD-7, OD-9, ADR 0008.
Hosting/snapshot decision record (`docs/project/HOSTING-SNAPSHOT-DECISION.md`):
hosting NOT DECIDED; in-memory snapshot acceptable only for a long-running
Node host with fixed instances, shared/durable snapshot required for
serverless; owner decision OD-9 required first. Category → subcategory
navigation audited: menus unchanged; category and product breadcrumbs now
include the ancestor trail; category pages link visible subcategories;
listings stay direct membership (`CATEGORY-MAPPING-DESIGN.md` §8). Full Zoho
catalog demo mode implemented (demo only): `CATALOG_PRODUCT_SOURCE=zoho-demo`
publishes all active, contract-valid Zoho products (unmapped ones without a
storefront category, inspectable at `/catalog`), shows INR variant prices,
and serves images through the server-side proxy
`/api/catalog-images/{itemId}/{documentId}`; production publication and the
frozen `/demo` flow are unchanged (`docs/sprints/SPRINT-06.md`). Category →
subcategory → product navigation verified on the existing taxonomy (direct
membership, no descendant duplication). Product detail selects real Zoho
variants and shows that variant's SKU, price, and availability; listings show
one price only when every variant shares it. Storefront cart and checkout review are implemented for the normal
product page (browser storage, catalog read for validation, no Zoho
order). Images use the existing catalog proxy and fall back safely.
The normal `zoho-snapshot` storefront shows a fresh verified Zoho selling
price (`rate`). A listing shows that price only when every variant shares
it. `label_rate` is not displayed. The selected variant's selling price is the cart and review price.
Those prices use shared typography. Each cart line shows its quantity.
The header searches the catalog already loaded for the storefront.
Checkout revalidation names a price or stock change and does not
rewrite the cart. Customer-facing GST is unresolved
(`STOREFRONT_TAX_POLICY`); no tax is added to the subtotal. `/demo`
and SO-00001 stay frozen. No further task is approved; do not start
production work, payment, or Sprint 7 automatically.

## Original S6-T15 scope

**S6-T15 — Zoho feasibility spike** (highest priority for the demo target
“Zoho POS → real products → storefront → cart → checkout → demo/COD order →
Zoho”). Determines authentication, items, prices, stock, IDs, order creation,
and API limits. Requires Zoho access (gate GZ) and explicit human approval.
