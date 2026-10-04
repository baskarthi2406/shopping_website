# Zoho Tax Verification

Read-only verification of the tax/pricing gap found in the frozen demo
(P0-1 in `PRODUCTION-DECISIONS.md`). No implementation.

### Verification date

2026-10-04 (IST).

### Environment

- Organization: Enn2Gee Mini Mystiq, Zoho POS, India data center; currency
  INR; price precision 2. Organization ID kept only in the gitignored
  `frontend/.env.local`; all IDs below are masked.
- API: `https://api.zakya.in/v1/organizations` and
  `https://api.zakya.in/inventory/v1`, using the existing local development
  OAuth credentials. The stored access token was still valid, so no token
  refresh (and no POST of any kind) was made.
- Method: a temporary, uncommitted, GET-only diagnostic script outside the
  repository; it redacted contact data and registration numbers and did not
  write `.env.local` (file hash unchanged before/after).
- Requests (all `GET`, all HTTP 200 unless noted):
  `/v1/organizations`, `/v1/organizations/{org}`,
  `/inventory/v1/settings/taxes`, `/inventory/v1/settings/taxsettings`
  (404 "Invalid URL Passed"), `/inventory/v1/settings/preferences` (404),
  `/inventory/v1/salesorders?reference_number=MMDEMO-BES3YWC2RA`,
  `/inventory/v1/salesorders/{SO-00001}`, `/inventory/v1/items?page=1&per_page=3`,
  `/inventory/v1/items/{id}` ×3. An initial `/v1/organizations` call with an
  `organization_id` query returned 400 (`Zak-03` "Extra param found") and was
  repeated without it.
- Official documentation consulted: Zoho Inventory API — Sales Orders and
  Items; Zoho POS API — Items and Item Groups; Zoho Commerce API — Create a
  Product with Variant (for `label_rate` only).

### Findings

#### Organization tax configuration

| Field | Observed value | Interpretation |
|---|---|---|
| `gst_registartion_type` (sic; list and detail) | `"UnRegistered"` | Conflicts with `tax_settings` below. Meaning NOT VERIFIED. |
| `tax_settings.is_tax_registered` (detail) | `true` | Organization reports itself tax-registered. |
| `tax_settings.tax_reg_no` (detail) | present (redacted) | A registration number is stored. Value not recorded. |
| `tax_id_label` / `tax_id_value` | `"Tax ID :"` / `""` | Empty display value. |
| `is_composition_scheme_enabled` | `false` | Not on the composition scheme (per field name; not otherwise verified). |
| `is_sez` / `is_union_territory` / `is_designated_zone` | `false` / `false` / `false` | — |
| `tax_basis` | `"accrual"` | Accounting basis; no pricing effect established. |
| `currency_code` / `price_precision` | `"INR"` / `2` | — |
| Taxes (`/settings/taxes`) | Tax groups GST0, GST5, GST12, GST18, GST28, GST40 (`intra`); taxes IGST0, IGST12, IGST18, IGST28 (`inter`, authority "INTD"); all active; none `is_default_tax` | GST rates are configured; no default tax. |
| Tax-inclusive/exclusive organization preference | Not exposed: `/settings/taxsettings` and `/settings/preferences` → 404; no such field in organization responses | NOT VERIFIED |

#### Item pricing

All three items: `pricing_scheme: "unit"`, `is_taxable: true`,
`taxability_type: "none"`, top-level `tax_id`/`tax_name` empty and
`tax_percentage: 0`, `hsn_or_sac: ""`, `is_tax_calculation_on_label_price:
false`, one default price bracket (qty 1) equal to `rate`.

| Item | SKU | Rate | Sales Rate | Pricebook Rate | Label Rate | Tax-related fields | Verified meaning |
|---|---|---:|---:|---:|---:|---|---|
| Girl Coord set — 0-3M / Pink (`…0339`) | GIR-0-3-PIN | 464 | 464 | 464 | 490 | `item_tax_preferences`: GST5 intra (CGST 2.5% + SGST 2.5%), IGST5 inter | `rate` = "Sales price of the Item" (Zoho docs). Tax inclusion NOT VERIFIED. `label_rate` NOT VERIFIED. |
| Girl Coord set — 0-3M / Green (`…0340`) | GIR-0-3-GRE | 464 | 464 | 464 | 490 | Same as above | Same as above |
| 2pc kurti — L / Pink (`…8537`) | 2PC-L-PIN | 943 | 943 | 943 | 990 | Same as above | Same as above |

Documentation: Zoho POS and Zoho Inventory Items APIs define `rate` as
"Sales price of the Item" and `pricebook_rate` as "Pricelist rate applied on
the item". Neither defines `sales_rate` or `label_rate`, and neither states
whether `rate` includes tax. No item-level inclusive/exclusive flag is
returned.

Observation only: `label_rate` ÷ `rate` is not consistent (490/464 ≈ 1.056;
990/943 ≈ 1.050), so no tax relationship can be derived from it.

#### Existing SO-00001

Read only (no update, confirm, void, or delete).

| Field | Value |
|---|---|
| `salesorder_number` / `status` | SO-00001 / `draft` |
| `reference_number` | MMDEMO-BES3YWC2RA (1 match) |
| `date` / `currency_code` | 2026-10-04 / INR |
| `gst_treatment` / `tax_treatment` | `consumer` / `consumer` |
| `place_of_supply` / `tax_specification` | `TN` / `intra` |
| `is_taxable` / `is_pre_gst` | `true` / `false` |
| `is_inclusive_tax` | `false` |
| `tax_rounding` | `entity_level` |
| `is_discount_before_tax` / `discount` | `true` / 0 |
| Line: item / SKU | `-0-3M-Pink` / GIR-0-3-PIN |
| Line: `rate` / `sales_rate` / `label_rate` | 464 / 464 / 490 |
| Line: `quantity` | 1 |
| Line: `tax_name` / `tax_percentage` | GST5 / 5 |
| Line: `line_item_taxes` | CGST2.5 (2.5%) 11.60; SGST2.5 (2.5%) 11.60 |
| Line: `item_total` / `item_sub_total` | 464 / 464 |
| Line: `is_tax_calculation_on_label_price` | `false` |
| `sub_total` / `sub_total_exclusive_of_discount` | 464 / 464 |
| `sub_total_inclusive_of_tax` | 0 (meaning NOT VERIFIED) |
| `taxes` | CGST2.5 11.60; SGST2.5 11.60 |
| `tax_total` | 23.20 |
| `shipping_charge_*` | 0 / empty |
| `total` / `net_order_amount` | 487.20 / 487.20 |

How ₹464 became ₹487.20 (supported by the response):

1. Line amount: `rate` 464 × `quantity` 1 = `item_total` 464 = `sub_total`.
2. The order has `is_inclusive_tax: false`. Zoho documents this field as
   "whether the line item rates are inclusive or exclusive of tax", so the
   464 rate was treated as **exclusive** of tax on this order. The demo did not
   send the field; `false` is what Zoho applied.
3. The item's intra-state tax preference GST5 applied because
   `place_of_supply` is TN and `tax_specification` is `intra`: CGST 2.5% of
   464 = 11.60 and SGST 2.5% of 464 = 11.60; `tax_total` 23.20.
4. `total` = 464 + 23.20 = **487.20**.

#### Tax-inclusive/exclusive behavior

**CONFIGURATION-DEPENDENT.**

- Verified: Zoho exposes an explicit per-sales-order flag `is_inclusive_tax`
  (documented); on SO-00001 it is `false`, and the 464 rate was taxed on top.
- Not verified: whether the item `rate` is intended by the business as a
  GST-inclusive shelf price. Zoho does not label item rates as inclusive or
  exclusive, and no organization-level inclusive/exclusive preference was
  readable.
- Not tested (would need a write): the totals Zoho produces with
  `is_inclusive_tax: true`.
- Inter-state orders would use IGST5 per the item preference; how
  `place_of_supply` is derived for an online shopper is NOT VERIFIED.
- The organization's GST registration status is contradictory
  (`UnRegistered` vs `is_tax_registered: true`); NOT VERIFIED.

#### `label_rate`

**NOT VERIFIED.**

Not documented in the Zoho POS or Zoho Inventory Items APIs. Zoho Commerce
documents `label_rate` as "retail price of the variant", but that is a
different product and does not establish its meaning in this Zoho POS
organization. `is_tax_calculation_on_label_price` is `false` on all items and
on the SO line. It is not verified as MRP or list price.

## Recommendation

Based only on the verified evidence:

- **Customer-facing price:** Not decidable from Zoho data. Zoho's item `rate`
  is the sales price, but whether it is GST-inclusive is a business fact
  (OD-1). The current storefront showing `rate` while Zoho adds 5% produces a
  mismatch and must not go to production.
- **GST display:** Business decision (OD-2). Technically, Zoho can represent
  either treatment via `is_inclusive_tax` per order.
- **Tax calculation:** Zoho computes tax on the Sales Order (item tax
  preference, place of supply, `is_inclusive_tax`). The storefront total must
  equal Zoho's total for whichever treatment is chosen.
- **`label_rate` display:** Do not display it (NOT VERIFIED).
- **Production blocker remaining:** Yes.

**Business decision remains blocked; additional Zoho verification is
required:**

1. Owner answers OD-1 (is `rate` meant to include GST?) and OD-2 (display),
   and confirms what `label_rate` represents in their Zoho POS setup.
2. Owner/accountant confirms the organization's GST registration status
   (contradictory API fields).
3. Confirm the organization's tax-inclusive pricing preference in the Zoho
   POS settings UI (not readable through the granted API).
4. If inclusive pricing is chosen: verify `is_inclusive_tax: true` totals in
   a Zoho test organization (or with explicit approval for one more draft
   order), never by modifying SO-00001.
5. Verify how `place_of_supply` is set for online shoppers (intra vs inter).
