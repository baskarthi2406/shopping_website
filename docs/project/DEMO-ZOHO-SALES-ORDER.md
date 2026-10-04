# Demo — Mini Mystiq Product → Cart → Checkout → Zoho Sales Order

Status: **DEMO WORKS — FROZEN** (2026-10-04). Part of the S6-T15 Zoho
feasibility spike. Not production checkout.

**Demo baseline commit: `589b74a`.** Do not change the demo flow. Do not
create another Zoho order or modify/delete `SO-00001` automatically.
Production gaps and backlog: `docs/project/PRODUCTION-READINESS.md`.

## Flow

`/demo` (gated by `ZOHO_DEMO_ENABLED=true`, otherwise 404, noindex):

1. `/demo` lists real Zoho items: item group → product, item → variant,
   selling price = Zoho `rate`, organization-level stock.
2. Add to Cart → local device storage (`localStorage`), no server cart.
3. `/demo/cart`: quantity, remove, subtotal, proceed.
4. `/demo/checkout`: name, mobile, address; payment fixed to **Demo / COD**.
   No login, no payment gateway, no card data.
5. `POST /api/demo/orders` (server-only): validates input, re-reads each item
   from Zoho, re-checks price and stock, creates **one** Sales Order for the
   demo customer, returns only `{reference, orderNumber, customerName}`.
6. Success page: "Demo Order placed successfully", demo reference, Zoho order
   number, customer name.

Duplicate protection: client in-flight guard + disabled button; a
client-generated reference (`MMDEMO-…`) reused across retries; server
in-memory ledger shares one result per reference and never retries a create
whose outcome is unknown.

## Controlled demo run

Exactly one Sales Order was created, via the storefront UI.

| Field | Verified value (read-only `verify-order`) |
|-------|-------------------------------------------|
| Demo reference | `MMDEMO-BES3YWC2RA` (exactly 1 order with this reference) |
| Zoho order | `SO-00001` |
| Status | `draft` (never confirmed) |
| Customer | `MINI MYSTIQ DEMO - DO NOT FULFILL` (matches configured demo customer) |
| Notes | First line `MINI MYSTIQ DEMO - DO NOT FULFILL`; payment Demo / COD, no payment collected |
| Line | Girl Coord set 0-3M / Pink, SKU `GIR-0-3-PIN`, qty 1, rate 464 |
| Currency | INR |
| Sub-total / tax / total | 464 / 23.20 (GST5, tax-exclusive) / 487.20 |
| Stock after order | on hand 1, committed 0, available for sale 1 (unchanged) |

No invoice, payment, or fulfilment was created. The order can be voided or
deleted in Zoho after the demo.

## Limitations

- **Tax treatment: to be confirmed before production checkout.** Zoho applied
  the item's GST5 on top of `rate` (`is_inclusive_tax: false`), so the Zoho
  total (₹487.20) differs from the storefront subtotal (₹464.00). The
  storefront makes no GST claim.
- **Location-specific inventory validation is deferred.** Stock is
  organization-level; a draft order does not commit stock.
- Images are not loaded (authenticated Zoho image URLs are not exposed to the
  browser). `label_rate` is not shown as MRP/discount.
- Demo uses one shared demo customer; shopper name/mobile/address go into the
  order notes. No customer accounts or order history.
- The idempotency ledger is in-memory (single dev process, lost on restart).
- Demo pages render inside the storefront shell; the existing mobile-menu
  `<details>` in `components/storefront/catalog-navigation.tsx` shows a dev
  hydration warning (pre-existing, not demo code).
- First load of a demo page can briefly show an empty cart until hydration
  reads local storage.

## Local setup (values never committed)

Server env in `frontend/.env.local`: `ZOHO_API_BASE_URL`, `ZOHO_ACCOUNTS_URL`,
`ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`,
`ZOHO_ORGANIZATION_ID`, `ZOHO_DEMO_CUSTOMER_ID`, `ZOHO_DEMO_ENABLED=true`.
Dev helper: `node --no-warnings scripts/zoho-oauth-dev.ts demo-customer` and
`verify-order <MMDEMO-reference>` (read-only).
