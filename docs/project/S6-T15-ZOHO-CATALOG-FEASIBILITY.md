# S6-T15 — Zoho POS Catalog Feasibility (read-only)

**Date:** 2026-10-04 · **Account:** Enn2Gee Mini Mystiq (Zoho POS, India data
center) · **Mode:** manual developer-machine calls only; no CI, no writes.

Credentials, tokens, and the organization ID live only in the gitignored
`frontend/.env.local`. IDs below are masked. Prices and stock are observations
at the stated time, not catalog facts.

## Endpoints and configuration

All calls used `Authorization: Zoho-oauthtoken …` from a token refreshed via
`https://accounts.zoho.in/oauth/v2/token`
(`frontend/scripts/zoho-oauth-dev.ts catalog`).

| Request | Result |
|---|---|
| `GET https://api.zakya.in/v1/organizations` | 200, 1 organization, currency INR |
| `GET https://api.zakya.in/inventory/v1/items?organization_id=…&page=1&per_page=3` | 200, 3 items, `has_more_page: true` |
| `GET https://api.zakya.in/inventory/v1/items/{item_id}?organization_id=…` ×3 | 200 |
| `GET https://api.zakya.in/inventory/v1/itemgroups/{group_id}?organization_id=…` | 200 |
| `GET https://api.zakya.in/inventory/v1/items/{item_id}/image?organization_id=…` | 200, `image/jpeg`, 4,024,004 bytes (discarded) |
| `GET https://api.zakya.in/inventory/v1/locations?organization_id=…` | **401**, Zoho code 57 "You are not authorized to perform this operation" |

**Base URL finding:** catalog endpoints live under
`https://api.zakya.in/inventory/v1`, so the S6-T14 `ZOHO_API_BASE_URL` value
is correct and unchanged. Only organization discovery lives at `/v1` on the
same origin; it is a one-time setup call (ID now stored locally), so the
S6-T14 wrapper's base-path confinement needs no change.

**Scopes granted:** `ZohoPOSAPI.items.READ`, `settings.READ`,
`contacts.READ/CREATE`, `salesorders.READ/CREATE/UPDATE`,
`ZohoPOS.organizations.READ`. `settings.READ` does not authorize the
locations list; warehouses would need `ZohoPOSAPI.warehouses.READ`
(not requested).

## Item model (observed)

A Zoho POS **item is one sellable variant** (size × color). Its **item group**
is the product. Fields actually returned (list and detail), relevant subset:

- Identity: `item_id`, `group_id`, `group_name`, `name`/`item_name`, `sku`,
  `category_id`, `category_name`, `brand`, `unit` (`pcs`), `status` (`active`),
  `item_type` (`inventory`), `product_type` (`goods`), `is_combo_product`.
- Variant: `attribute_name1..3` (`size`, `color`, empty) and
  `attribute_option_name1..3`; the group returns `attributes[]` with options
  and `items[]`.
- Description: `description` present but **empty** on all 3 items and the group.
- Price: `rate`, `sales_rate`, `pricebook_rate`, `default_price_brackets[]`
  (all equal), `label_rate` (higher), `price_brackets[]` (empty),
  `pricing_scheme`.
- Tax: `is_taxable: true`, `item_tax_preferences[]` (2 entries, GST 5%
  intra/inter), top-level `tax_percentage: 0`, `is_tax_calculation_on_label_price`.
- Stock (detail): `track_inventory`, `stock_on_hand`, `available_stock`,
  `actual_available_stock`, `committed_stock`, `actual_committed_stock`,
  `available_for_sale_stock`, `actual_available_for_sale_stock`. The list
  omits committed/for-sale fields.
- Image: `image_name`, `image_type`, `image_document_id`, `documents[]`; no
  URL. Bytes are served by the authenticated image endpoint.
- Also returned (not used; not exposed): purchase/cost rates, accounts,
  vendor, HSN, dimensions, CRM links, locks, custom fields.
- **Not returned:** any location or warehouse breakdown, currency on the item.

## Price

- Selling price is returned: `rate` = `sales_rate` = `pricebook_rate`
  (464 and 943 INR observed). `label_rate` (490, 990) is a separate,
  higher value — likely the printed label/MRP, **meaning unverified**.
- Organization-level: no location field on price; currency comes from the
  organization (INR).
- Price lists: `pricebook_rate` / `price_brackets` exist; the default price
  bracket equals `rate`. Customer-specific price lists: **UNKNOWN** (none
  applied in these reads).
- Tax: GST 5% via `item_tax_preferences`. Whether `rate` **includes GST is
  UNKNOWN** (no inclusive flag returned; org tax preferences not read).

## Stock

For each sampled item: `stock_on_hand` 1, `actual_available_for_sale_stock` 1,
`actual_committed_stock` 0, `track_inventory: true`. Usable quantities exist.
They are **organization-level aggregates**; no per-location stock is returned,
and the locations list was refused (401), so whether the account has more than
one location, and whether orders need a location ID, is **UNKNOWN**.

## Organization / location IDs

| ID | Required by item reads | Status |
|---|---|---|
| organization_id | Yes (query) | Discovered, stored locally |
| location / warehouse / branch ID | Not required for item reads | **UNKNOWN** (locations 401; warehouses scope not granted). Requirement for sales orders untested |

## Mini Mystiq mapping (S4 contract)

| Zoho field | Mini Mystiq field | Feasibility |
|---|---|---|
| `group_id` / `item_id` | `Product.id` / `ProductVariant.id` | OK (stable provider IDs) |
| `group_name` | `name` | OK; variant `name` is noisy (e.g. leading `-`) |
| — | `slug` | **Gap:** derive from `group_name` + collision rule (TD-005) |
| `sku` | `ProductVariant.sku` (product `sku` null) | OK |
| `description` | `description` | **Gap:** empty in Zoho |
| `rate` + org currency | `pricing.price` | OK (tax inclusion unknown) |
| `label_rate` | `pricing.compareAtPrice` | Candidate only; business must confirm |
| `stock_on_hand` / `actual_available_for_sale_stock` / `actual_committed_stock` | `inventory.stockOnHand` / `availableToSell` / `reserved` | OK, org-level |
| derived from available-for-sale (> 0) | `inventory.status` | OK; untracked/missing → `unknown` |
| `image` endpoint bytes | `images[].src` | **Gap:** no public URL; needs server proxy/cache + resize (≈4 MB original); `alt` must be authored |
| `category_name` / `category_id` | `categoryIds` | **Gap:** Zoho categories ("Baby Girl", "Co-Ord Set") need mapping to the storefront tree |
| `attribute_name*`/`attribute_option_name*` | `variants[].attributes` | OK |
| `unit` | `uom` | Partial (code only; label must be mapped) |
| `status` | `status` | OK |

## Normalized three-item sample (2026-10-04T08:10Z)

| Product (group) | Variant | SKU | Category | Price | Label rate | GST | On hand / available / committed | Image |
|---|---|---|---|---|---|---|---|---|
| Girl Coord set | 0-3M / Pink | GIR-0-3-PIN | Baby Girl | INR 464 | 490 | 5% | 1 / 1 / 0 → in_stock | jpg |
| Girl Coord set | 0-3M / Green | GIR-0-3-GRE | Baby Girl | INR 464 | 490 | 5% | 1 / 1 / 0 → in_stock | jpg |
| 2pc kurti | L / Pink | 2PC-L-PIN | Co-Ord Set | INR 943 | 990 | 5% | 1 / 1 / 0 → in_stock | png |

All three are representable by the storefront model (product = group,
variant = item), with the gaps above. Normalization is spike-only
(`normalizeZohoItem` in the dev script) and is not wired into the runtime.

## Verdict

| Capability | Result |
|---|---|
| Authentication | PASS |
| Organization | PASS |
| Item retrieval | PASS |
| Product name | PASS (group name; variant names noisy) |
| SKU | PASS |
| Price | PARTIAL (selling price PASS; GST inclusion and `label_rate` meaning unverified) |
| Stock | PASS at organization level (per-location UNKNOWN) |
| Location | PARTIAL (not required for reads; list 401; order requirement untested) |
| Image | PARTIAL (bytes retrievable; no public URL; large originals) |
| Category | PARTIAL (returned; needs mapping to storefront categories) |
| Mini Mystiq mapping | PARTIAL (feasible; slug, description, image hosting, category mapping are gaps) |

**ZOHO CATALOG VERDICT: PARTIAL — sufficient for the demo.** Real products,
selling prices, and stock quantities are available read-only and map onto the
storefront model. Not yet reliable for production: GST inclusion, location
semantics, image delivery, descriptions, and category mapping.

## Not verified (remaining)

API quota/rate limits (Z1), pagination limits for a full catalog (Z5),
sales-order requirements (location, customer, tax), and any write behavior.
