# Sprint 5 — Commerce UI

| Field | Value |
|-------|-------|
| Sprint ID | S5 |
| Phase | Phase 1 — Customer Storefront |
| Objective | Add commerce-ready storefront behavior on the existing nullable catalog without implying orders, payment, stock reservation, or fulfillment |
| Status | **COMPLETED (Track A)** — S5-T01–S5-T04 and S5-T08 review completed; Track B (S5-T05–S5-T07) DEFERRED, not implemented |
| Dependencies | Sprint 4 completed (S4-T12, commit `c4d47f757ee98f8bb1fa4d13e1089d0b801c3653`) |
| Task IDs | S5-T01 (planning, completed) · proposed S5-T02 … S5-T08 |

**Only explicitly requested tasks are authorized.** S5-T02, S5-T03, and S5-T04
were approved by explicit human requests on 2026-09-29 and are completed.
Track A is complete. S5-T08 (review) was approved and completed on
2026-09-29; it closes Sprint 5 for Track A and records S5-T05–S5-T07 as
DEFERRED. No other Sprint 5 task
is authorized until a human approves it. Approval must be recorded in this
file, `SPRINT_STATUS.md`, and `CURRENT_TASK.md` before any task becomes
`IN_PROGRESS`.

**Decisions recorded with S5-T02 (from the S5-T02 request):** unknown inventory
blocks purchase (resolves Q3), and a variant never inherits the parent price
(resolves Q8). The rule also requires verified `availableToSell` to cover the
requested quantity; this narrows the Q5 default. Q1, Q2, Q4, Q6, Q7, and Q9–Q11
remain open.

## Task ID convention

- **S5-T01** is this planning and specification task. It changes documents only.
- **S5-T02 … S5-T08** are the proposed execution sequence. IDs are reserved in
  order; if a task is rejected or deferred, its ID is not reused.
- Tasks in **Track B** exist only if the cart decision (Q1) is approved.
  Otherwise they are recorded as **DEFERRED**, and S5-T08 reviews Track A only.
- Each task uses its own branch `s5-tNN-short-name`, created from the previous
  task's HEAD, and follows PLAN → IMPLEMENT → TEST → REVIEW → DOCUMENT → UPDATE
  STATUS → COMMIT → STOP. Commit locally; do not push or merge without explicit
  instruction.

---

## 1. Planning inputs (verified in S5-T01)

- Branch `s4-t12-sprint-review`, HEAD `c4d47f7`; working tree clean apart from
  generated `frontend/.next`.
- Local `main` is still at the initial commit `d31f07a`. Sprint 3–4 work is on
  stacked, mostly unpushed task branches. Sprint 5 branches will stack on
  `s4-t12-sprint-review` unless a human integrates `main` first. This is not a
  blocker for planning, but it must be decided before release.
- **Catalog facts:** all 12 products map to `sku: null`, `uom: null`,
  `pricing: null`, `inventory: null`, and `variants: []`
  (`infrastructure/catalog/map-product.ts`). Product records carry no
  commerce fields.
- **Consequence:** under the data-safety rules below, **no current product is
  purchasable.** A cart built in Sprint 5 can only be exercised with test fakes
  until real pricing data exists (Sprint 6 production backend or Sprint 7 Zoho).
  This is decision Q1.
- Domain contracts (`Product`, `ProductVariant`, `Pricing`, `Inventory`,
  `InventoryStatus = unknown | in_stock | out_of_stock`,
  `ProductStatus = active | inactive`) are sufficient for Sprint 5 and are not
  changed.
- Header and mobile menu show Search, Account, Cart, and Track Your Order as
  `aria-disabled` placeholders (`StoreToolPlaceholders`). The mega-menu design
  is frozen (S4-T10C).
- Requirements still TBD: cart persistence contract, guest versus authenticated
  cart, promo codes, stock display, search behavior, tap-target size, and Core
  Web Vitals budgets.
- No packages may be added in Sprint 5 unless a task explicitly approves one.
  Current dependencies are `next`, `react`, and `react-dom`, with Vitest for
  tests.
- `npm run test:http` is run manually after `npm run build`; it is **not** in
  CI (TD-006).

## 2. Functionality classes

| Class | Meaning in Sprint 5 |
|-------|---------------------|
| UI-only | Server-rendered presentation of existing data (price, availability messages) |
| Local client-side state | Browser-only state, such as a variant selection or a device-local cart in `localStorage`. Never implies a server record |
| Persistent server-side | Server-stored carts, orders, or accounts. **Not in Sprint 5** (Sprint 6+) |
| External integrations | Zoho, payment, email, shipping. **Not in Sprint 5** (Sprint 7+, Sprint 9) |
| Production commerce operations | Orders, payment capture, stock reservation or deduction, fulfillment, tracking. **Not in Sprint 5** (Sprint 8+) |

## 3. Candidate scope evaluation

| # | Candidate | Class | Decision | Task |
|---|-----------|-------|----------|------|
| 1 | Commerce UI foundation (purchasability rules, price/availability display) | Application + UI-only | **Include** | S5-T02, S5-T03 |
| 2 | Variant/attribute selection | Local client state | **Include**; renders only when real variants exist | S5-T04 |
| 3 | Quantity controls | Local client state | **Business decision** (depends on cart, Q1; limits, Q5) | S5-T06 |
| 4 | Add-to-cart | Local client state | **Business decision** (Q1, Q3) | S5-T06 |
| 5 | Cart state and persistence | Local client state (`localStorage`) | **Business decision** (Q1, Q2); server persistence deferred to Sprint 6/8 | S5-T05 |
| 6 | Cart page/drawer UI | UI + local state | **Business decision** (Q1); page preferred over drawer (see S5-T07) | S5-T07 |
| 7 | Checkout boundary / unavailable-commerce state | UI-only | **Include with cart**: explicit “checkout not available” state, no checkout route | S5-T07 |
| 8 | Search interface | UI + future API | **Defer / business decision** (Q7): behavior, ranking, and results-page indexing are TBD and no search API exists | — |
| 9 | Account interface boundary | Server/auth | **Defer** to Sprint 8; keep the disabled placeholder | — |
| 10 | Track-order interface boundary | Production operations | **Defer** to Sprint 8; no orders exist; keep the disabled placeholder | — |
| 11 | Sprint review and validation | Review | **Include** | S5-T08 |

Execution tracks:

- **Track A (safe with current data, no business decision required beyond plan
  approval):** S5-T02 → S5-T03 → S5-T04.
- **Track B (only if Q1 is approved):** S5-T05 → S5-T06 → S5-T07.
- **Review:** S5-T08 after the approved tracks.

## 4. Data-safety and commerce rules (binding for all Sprint 5 tasks)

1. **Never invent values.** No placeholder prices, stock, sizes, colors, SKUs,
   UOM, delivery dates, or discounts in fixtures, UI, tests of production
   wiring, or structured data. Tests may use clearly fake data only inside
   test files and fake repositories.
2. **No variants (`variants: []`):** the product is evaluated at product level.
   No selector is rendered, and there is no “select a size” prompt.
3. **No price (`pricing: null`) at the purchasable level:** no price text, no
   add-to-cart control, and no `0` or “free”. Show one neutral message (copy
   approval Q4; working copy “Price not available online yet”) and the existing
   verified store contact link from the footer data. Product JSON-LD stays
   without `offers`.
4. **Unknown inventory (`inventory: null` or `status: "unknown"`):** no stock
   text and no quantity. Unknown inventory **blocks** purchase (Q3 resolved in
   S5-T02); only verified `availableToSell` covers a requested quantity.
   `out_of_stock` always blocks and shows “Out of stock”. `in_stock` never shows
   a quantity unless stock display is approved (Q6).
5. **No SKU or UOM:** never blocks display. Nothing is rendered for missing
   values, with no “N/A” and no invented unit. SKU display is out of scope
   unless approved.
6. **Variants present:** purchasability is evaluated on the selected variant.
   Only the variant's own pricing/inventory is used. It **never** falls back
   to product-level pricing (Q8 resolved in S5-T02), so a variant without its
   own price is not purchasable. A selection is
   **invalid** when it matches no variant, matches more than one variant, or
   matches an `inactive` variant. Invalid, incomplete, or unavailable
   selections disable add-to-cart and show which choice is needed.
7. **Inactive product (`status: "inactive"`):** never purchasable. Route
   visibility is unchanged from current behavior.
8. **No implied operations.** Copy and UI must never say or suggest “order
   placed”, “reserved”, “paid”, “confirmed”, or “shipped”. The cart is labelled
   as saved on this device only. There is no checkout, payment, or order route.
9. **Local cart stores references, not facts.** It stores
   `productId`/`variantId`/`quantity` only; no price or stock snapshot. Lines
   are re-resolved from the catalog on render. Lines whose product or variant is
   missing, inactive, or no longer purchasable are shown as unavailable, are
   excluded from any total, and can be removed.
10. **Totals:** a subtotal is shown only when every counted line has a price in
    the same currency. No tax, shipping, or discount arithmetic, and no
    currency conversion. Mixed or missing currency means no subtotal.
11. **Contracts and fixtures:** no change to existing domain/API contracts or
    catalog fixtures. New Sprint 5 types (purchasability result, cart line) are
    additive and live in application/domain folders under the existing layering
    rules.
12. **SEO:** catalog HTML stays server-rendered. Canonicals, metadata, sitemap,
    robots, and JSON-LD are unchanged unless a task explicitly scopes it.
    `/cart` (if built) is `noindex`, excluded from the sitemap, and not linked
    as a canonical.

## 5. Task specifications

Common requirements for every implementation task:

- Checks: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.
- Tasks that change routes or route output: `npm run build` then
  `npm run test:http` (run manually; not in CI).
- **Accessibility:** WCAG target is TBD. At minimum, semantic controls, visible
  focus, `aria-live` for dynamic status, labelled form controls, no hover-only
  actions, and keyboard operation.
- **Responsive:** mobile first (Mobile → Tablet → Desktop), existing tap-target
  token `--mm-tap-min`, and no horizontal scroll. Manual check at the existing
  review widths (500, 820, and 1440 CSS px).
- Update `CURRENT_TASK.md`, `PROJECT_STATUS.md`, `SPRINT_STATUS.md`, and this
  file after each task. Commit only task files, excluding `frontend/.next`,
  with the task's commit message. Do not push. **STOP**; never start the next
  task automatically.

---

### S5-T01 — Sprint 5 Planning & Specification

**Status:** COMPLETED

Documentation only: this file plus status documents. No application code,
contracts, fixtures, or packages changed. Branch `s5-t01-sprint-5-planning`;
commit `docs(s5): plan sprint 5`.

---

### S5-T02 — Purchasability Rules (Track A)

**Status:** COMPLETED (approved by explicit request, 2026-09-29)

**Objective:** One application-layer rule that decides whether a quantity of a
product (and an optional selected variant) can be bought, and why not.

**Implementation (as completed):**

- `frontend/application/catalog/evaluate-purchasability.ts`:
  `evaluatePurchasability({ product, variantId?, quantity })` →
  `{ purchasable, reasons }`. Pure, deterministic, non-mutating, and free of
  React/Next/browser/infrastructure/provider imports. Exported from
  `application/catalog/index.ts` with `PURCHASABILITY_REASONS` and its types.
- Additive domain predicate `isCurrencyCode` in
  `domain/catalog/contract-validation.ts`, now also used by `validateMoney`.
  Existing contracts, fixtures, and repositories are unchanged.
- The unknown-inventory policy is **not** a parameter: the S5-T02 request made
  blocking mandatory (Q3 resolved).
- Variant selection is by `variantId`. Resolving attribute choices to a variant
  (and ambiguity) belongs to S5-T04.

**Reason codes** (always reported in this order; `reasons` is empty exactly
when `purchasable` is true):

| Code | Blocks when |
|------|-------------|
| `product_not_found` | `product` is `null` (returned alone) |
| `product_status_unknown` | product status missing or not `active`/`inactive` |
| `product_inactive` | product status `inactive` |
| `variant_required` | product has variants and no non-blank `variantId` |
| `variant_not_found` | `variantId` matches no variant, or is given for a product without variants |
| `variant_status_unknown` | selected variant status missing or unrecognised |
| `variant_inactive` | selected variant status `inactive` |
| `quantity_invalid` | quantity not a positive safe integer |
| `price_missing` | no pricing/price at the purchasable level |
| `price_invalid` | amount not finite or ≤ 0 (never treated as free) |
| `currency_invalid` | currency missing or not a three-letter uppercase code |
| `inventory_unknown` | inventory `null`; status `unknown`; or `in_stock` without a valid `availableToSell` |
| `out_of_stock` | inventory status `out_of_stock` |
| `insufficient_inventory` | `availableToSell` < a valid requested quantity |

Rules:

- The purchasable level is the product when it has no variants, otherwise the
  selected variant. A variant uses only its own pricing and inventory (no
  parent inheritance, Q8 resolved).
- When no variant can be resolved, price and inventory are not evaluated.
- SKU and UOM are never considered.
- Only `availableToSell` establishes quantity availability. `stockOnHand` and
  `reserved` are not used to infer it.

**Limitations and open decisions:** no user-facing copy mapping (Q4, S5-T03).
No per-line maximum beyond verified `availableToSell` (Q5). No existing
consumers yet. All current catalog products evaluate to
`price_missing` + `inventory_unknown`.

**Tests:** `evaluate-purchasability.test.ts` (synthetic data only) covers:
- valid purchase; missing, zero, negative, and non-finite prices; missing and
  invalid currency
- unknown inventory (null, `unknown` status, `in_stock` without quantity);
  out of stock; insufficient stock
- invalid quantities (0, negative, fractional, NaN, Infinity, unsafe integer)
- variants: required, valid, inactive, unknown status, not found; variant id on
  a product without variants; variant without price despite a parent price;
  variant unknown, short, or out-of-stock inventory
- missing SKU/UOM still purchasable; missing, unknown, or inactive product
  status
- catalog-shaped null commerce product; multiple reasons in stable order and
  deterministic; no input mutation; unique codes; dependency boundary

`contract-validation.test.ts` covers `isCurrencyCode`.

**Validation:**

- `npm test`: 55 files, 290 tests passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed
- `npm run test:http`: 16 tests passed (no route changes; regression check)
- Non-blocking npm warning: unknown env config `devdir`

**Git/stop:** committed on the checked-out branch `s5-t01-sprint-5-planning`.
The request prohibited switching branches, so no separate
`s5-t02-purchasability-rules` branch was created. Commit
`feat(s5): add purchasability rules`; STOP.

---

### S5-T03 — PDP Price & Availability Panel (Track A)

**Status:** COMPLETED (approved by explicit request, 2026-09-29)

**Objective:** Show real price and availability on the PDP when data exists,
and a clear, non-misleading state when it does not.

**Decisions from the S5-T03 request:**

- Q4 is partly resolved: missing-price copy “Price not available”, with the
  verified store phone `090257 99377` (`config/organization.ts`) as the
  contact option.
- Q9 is conditional: `en-IN`/INR may be used only when verified business
  configuration supports it. No such configuration exists, so `priceDisplay`
  in `config/commerce.ts` is `null` and **no price renders** until a human
  sets it. The currency is never inferred from the store location.

**Implementation (as completed):**

- `application/catalog/product-commerce-view-model.ts`:
  `toProductCommerceViewModel(product, { priceDisplay, variantId? })`. It
  calls `evaluatePurchasability` (quantity 1) and adds formatting and copy only.
  - **Price** is formatted with `Intl.NumberFormat(locale, { style: "currency" })`
    only when the S5-T02 rule reports no price, currency, or variant blocker
    and the currency is listed in `priceDisplay`. Otherwise it shows “Price not
    available”. The price comes from the product (no variants) or the selected
    variant, never the parent.
  - **Compare-at** is shown only when it is higher and in the same currency.
  - **Availability:** explicit `out_of_stock` → “Out of stock”; inactive
    product/variant → “Not currently available”; unknown status, unknown or
    insufficient inventory, or an unresolved variant → “Availability not
    confirmed”; purchasable → no message (“In stock” undecided, Q6).
- Copy constants added to `application/catalog/catalog-messages.ts`.
- `config/commerce.ts` exports `priceDisplay: null`.
- `components/storefront/product-commerce-panel.tsx`: server-rendered
  section labelled “Price and availability” (screen-reader heading), price or
  message, availability line, and a `tel:` link “Call 090257 99377” sized to
  the tap-target token. No buttons, forms, cart, stock counts, or logic.
- `ProductDetail` accepts an optional `commerce` prop and renders the panel
  under the description; `/p/[slug]` wires it. Metadata, canonical,
  Product/BreadcrumbList JSON-LD, sitemap, mega-menu, and fixtures are
  unchanged.

**Tests:**

- `product-commerce-view-model.test.ts` (synthetic data and synthetic `en-IN`/INR
  test config):
  - today's catalog shape; missing, zero, and negative prices; verified price
    formatting; compare-at rules
  - missing, invalid, and unapproved currency; no config means no price
  - unknown inventory; explicit out of stock; inactive product
  - variant price without parent inheritance; delegation to
    `evaluatePurchasability` (no stock-field reads)
- `product-commerce-panel.test.ts` renders the panel with
  `react-dom/server` `renderToStaticMarkup` (no new packages) and checks:
  - missing-price state without amounts or purchase controls
  - `tel:09025799377` link with accessible name “Call 090257 99377”
  - section labelling and screen-reader price context
  - no unavailable message when purchasable; out-of-stock message
  - mobile-first classes, server component
  - PDP wiring without structured-data changes
- `storefront-http-status.http.test.ts` checks the real
  `/p/pink-white-pleated-baby-dress` (browser and Googlebot). The panel shows
  “Price not available”, “Availability not confirmed”, and the `tel:` link,
  with no amount, button, or “in stock” inside it, and no `"offers"` in the
  page. The site-wide announcement “Free Shipping on Orders above ₹999” is an
  existing service claim outside the panel.

**Validation:**

- `npm test`: 57 files, 308 tests passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed
- `npm run test:http`: 18 tests passed. The first run failed 2 of 18 because
  the new assertion searched the whole page for `₹` and matched the existing
  announcement bar; it was scoped to the panel, with no product-code change.
- Manual (dev server, `/p/pink-white-pleated-baby-dress`):
  - desktop ≈1024 px: panel beside the image in the boutique card style
  - mobile 390 px: panel stacked under the image, no horizontal scroll
    (`scrollWidth` = `clientWidth`), phone link 44 px tall
  - accessibility tree: region “Price and availability” and link
    “Call 090257 99377”
  - The 500/820/1440 px widths from the plan were not each re-measured
- Existing dev-server console message (seen on `/` before this task, not
  introduced here): “Router action dispatched before initialization”
- Non-blocking npm warning: unknown env config `devdir`

**Limitations and open decisions:**

- No price can display until `priceDisplay` is approved (Q9); today's
  catalog has no prices anyway.
- “In stock” is not shown (Q6); the remaining copy review for Q4 is open.
- Products with variants show “Price not available” until a variant is
  selected (S5-T04 passes `variantId`).
- Listing cards unchanged (Q10).

**Git/stop:** committed on the checked-out branch `s5-t01-sprint-5-planning`
(the request prohibited switching branches). Commit
`feat(s5): add pdp price and availability`; STOP.

---

### S5-T04 — Variant Attribute Selector (Track A)

**Status:** COMPLETED (approved by explicit request, 2026-09-29)

**Objective:** Data-driven variant selection for products that have real
variants, without inventing options.

**Implementation (as completed):**

- **`application/catalog/product-variant-selector.ts`**
  - `toVariantSelectorViewModel(product)` builds option groups (normalized
    attribute name → label + distinct values in data order) and one choice per
    variant.
  - It returns `null` (no selector) when there are no variants, or when any
    variant has a blank or duplicate id, no attributes, a blank name or value,
    a duplicate attribute name, attribute names that differ from other
    variants, or a duplicate value combination. Nothing is fabricated.
  - `toProductPurchaseOptionsViewModel(product, { priceDisplay })` returns the
    no-selection commerce state, the selector, and `commerceByVariant`: one
    S5-T03 commerce view model per real variant id, each from
    `evaluatePurchasability` with that `variantId`.
- **`application/catalog/variant-selection.ts`:** pure
  `resolveVariantSelection(selector, selection)` →
  - `matched` (real variant id)
  - `incomplete` (“Select {missing option names}”)
  - `unmatched` (“This combination is not available”)

  It never auto-selects, even a single variant. It is kept free of pricing and
  inventory code so the client bundle stays small.
- Copy constants added to `catalog-messages.ts`.
- **`components/storefront/product-purchase-options.tsx`** (client component):
  - one native `fieldset`/`legend` radio group per option; the visible pill is
    the label for a visually hidden radio
  - selected (`peer-checked`) and keyboard-focus (`peer-focus-visible`)
    styles; tap-target sizing; wrapping row with no overflow
  - `aria-live="polite"` on the selection prompt and on the commerce panel
  - It holds selection in `useState` only and swaps between precomputed view
    models. No purchasability logic, formatting, storage, or fetch.
- `ProductDetail` renders `ProductPurchaseOptions` only when `variantOptions`
  is supplied; otherwise it renders the unchanged S5-T03 panel. `/p/[slug]`
  passes `variantOptions` only when a selector exists.
- Current products have no variants, so their PDP HTML is unchanged (no
  selector, no client component).

**Behavior:**

- With no selection, or an incomplete or unmatched selection, purchase is
  blocked. The panel shows “Price not available” and “Availability not
  confirmed” (parent price and stock never shown for variant products).
- A matched variant shows its own price, compare-at, and availability (Q8: no
  parent fallback). Inactive variants show “Not currently available”;
  out-of-stock variants show “Out of stock”.

**Deviation from the proposed acceptance text:** options are not disabled.
Inactive or out-of-stock variants and non-existent combinations stay
selectable and are announced as unavailable, so customers can see why. No
purchase control exists in any state.

**Tests:**

- `product-variant-selector.test.ts`:
  - no variants (including today's catalog shape); group derivation
  - eight unusable-variant cases; incomplete, invalid, and single-variant
    selections (no auto-select)
  - matched and unmatched selections; per-variant commerce differs (switching)
  - no parent price fallback; no parent inventory fallback
  - inactive and out-of-stock variants unavailable; unusable variants stay
    blocked
- `product-purchase-options.test.ts` (static render with `react-dom/server`):
  - fieldsets, legends, and label/`for` pairs; one radio `name` per group
    (arrow-key navigation)
  - no initial selection; prompt and blocked panel; contact link intact
  - two polite live regions; selected/focus classes; client-only boundary
  - PDP wiring
- `product-commerce-panel.test.ts` wiring assertion updated for the new page
  call.
- `storefront-http-status.http.test.ts`: the real PDP has no `fieldset` or
  radio, and the S5-T03 checks still pass.

**Validation:**

- `npm test`: 59 files, 335 tests passed (two focused-test assertions were
  first corrected for attribute order and the `peer-checked` class name; no
  component change)
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed
- `npm run test:http`: 18 tests passed
- Non-blocking npm warning: unknown env config `devdir`

**Limitations:**

- No DOM test runner is configured, so live click and keyboard switching is
  verified through the pure resolver and per-variant view models plus native
  radio semantics, not an in-browser interaction test.
- No catalog product has variants, so manual browser validation of the
  selector was not possible without committing fake data (not done).
- Selection is not reflected in the URL (SEO impact TBD).
- Variants with unusable or inconsistent attributes get no selector and stay
  blocked.
- Option labels and values are shown as supplied; no size or colour
  vocabulary exists.

**Git/stop:** committed on the checked-out branch `s5-t01-sprint-5-planning`
(the request prohibited switching branches). Commit
`feat(s5): add variant selector`; STOP.

---

### S5-T05 — Local Cart Model & Persistence Boundary (Track B, requires Q1/Q2)

**Status:** DEFERRED — not implemented; requires renewed Q1/Q2 approval (recorded in S5-T08)

**Objective:** A device-local cart behind an application port, ready to be
replaced by a server cart later without UI rewrites.

**Scope:**

- ADR 0006: client cart state and persistence boundary (local-only, reference
  storage, versioned schema, future server cart).
- Application `CartRepository` port and cart use cases (add, set quantity,
  remove, clear, resolve lines against the catalog). Rules 8–10 of section 4.
- Infrastructure `LocalStorageCartRepository`: versioned key, validates stored
  JSON, discards corrupt or unknown-version data safely, and tolerates
  `localStorage` being unavailable (in-memory fallback, no crash).
- Client provider/context composed in `config/`; no UI yet.

**Exclusions:** no server cart, database, auth, or cookies for identity; no
price or stock snapshots; no UI; no new packages.

**Dependencies:** Q1 and Q2 approved; S5-T02.

**Affected:** new `domain/cart` or `application/cart`, `infrastructure/cart`,
`config/` composition, ADR `docs/decisions/0006-*.md`.

**Acceptance criteria:**

- Stores only `productId`, `variantId | null`, and `quantity`.
- Resolution marks missing, inactive, and non-purchasable lines unavailable and
  computes a subtotal only under rule 10.
- Adding a non-purchasable product is rejected with the S5-T02 reasons.
- Corrupt storage and unavailable storage are handled without throwing.

**Automated tests:** use-case tests with fake repositories; storage adapter
tests with a fake `Storage`; subtotal and currency rules; boundary tests (no
React in application, no fixtures).

**Manual validation:** none (no UI).

**Accessibility/responsive:** not applicable.

**Documentation:** ADR 0006, `FRONTEND_ARCHITECTURE.md`, this file, status
files.

**Definition of done:** tested local cart boundary; checks pass.

**Git/stop:** branch `s5-t05-local-cart-model`; commit
`feat(s5): add local cart model`; STOP.

---

### S5-T06 — Add-to-Cart & Quantity Control (Track B, requires Q1/Q3/Q5)

**Status:** DEFERRED — not implemented; requires renewed Q1/Q2 approval (recorded in S5-T08)

**Objective:** Let customers add a purchasable product or variant to the local
cart with a quantity.

**Scope:**

- PDP add-to-cart button and quantity stepper (client component), enabled only
  when S5-T02 says purchasable. Otherwise the button is absent (no price) or
  disabled with the reason (variant or stock).
- Quantity: integer, minimum 1. Maximum per Q5 (default: `availableToSell` when
  known; otherwise the business-approved limit).
- Confirmation announces “Added to cart on this device” via `aria-live`, with a
  link to the cart once S5-T07 exists. No “order” wording.

**Exclusions:** no cart page, checkout, stock reservation, or listing-card
buttons.

**Dependencies:** S5-T04, S5-T05.

**Affected:** `/p/[slug]`; new client component(s); PDP view model.

**Acceptance criteria:**

- No add-to-cart control appears on any current product (all unpriced).
- With priced fakes: add, increment, decrement, and limit behave correctly;
  invalid selections are blocked with reasons.
- Server-rendered PDP content and SEO output are unchanged for current
  products.

**Automated tests:** quantity rules; control-state mapping from purchasability
reasons; copy contract (no order/payment/reservation wording).

**Manual validation:** keyboard and touch on mobile/desktop with a local fake
build; current PDPs unchanged.

**Accessibility/responsive:** labelled stepper buttons, `aria-live` feedback,
disabled reasons as text, ≥ tap target, no hover-only affordances.

**Documentation:** this file, status files.

**Definition of done:** add-to-cart works for purchasable data only;
`npm run build` and `npm run test:http` pass.

**Git/stop:** branch `s5-t06-add-to-cart`; commit
`feat(s5): add pdp add to cart`; STOP.

---

### S5-T07 — Cart Page & Checkout-Unavailable State (Track B, requires Q1/Q4)

**Status:** DEFERRED — not implemented; requires renewed Q1/Q2 approval (recorded in S5-T08)

**Objective:** A mobile-first cart page and a truthful “checkout not
available” boundary.

**Scope:**

- New route `/cart` (a page rather than a drawer: simpler, testable over HTTP,
  and no frozen-header changes). Lines render client-side from local storage
  and resolve against the catalog. States: empty, available lines, unavailable
  lines, subtotal-hidden (rule 10).
- Update quantity, remove line, clear cart.
- Checkout boundary: a clearly non-actionable notice (“Online checkout is not
  available yet”, copy per Q4) plus the existing verified store contact. No
  checkout, payment, or order routes.
- Enable only the **Cart** entry in `StoreToolPlaceholders` as a link to
  `/cart` (optional count badge). Search, Account, and Track Your Order stay
  disabled. Mega-menu panel design and classes unchanged.
- `/cart`: `noindex`, no canonical promotion, not in the sitemap.

**Exclusions:** no drawer, checkout, payment, order persistence, account, or
shipping/tax calculation. No other header redesign.

**Dependencies:** S5-T05, S5-T06.

**Affected:** new `app/cart/page.tsx` (+ metadata), cart components,
`catalog-navigation.tsx` (Cart entry only), `storefront-http-status.http.test.ts`.

**Acceptance criteria:**

- `/cart` returns 200 with `noindex` for browser and Googlebot; the sitemap is
  unchanged (67 URLs); robots are unchanged.
- An empty cart shows an empty state linking to catalog browsing.
- Unavailable lines are labelled and excluded from the subtotal; no
  order/payment/reservation wording anywhere.
- Only the Cart tool is enabled; mega-menu contract tests pass unchanged.
- Existing 200/404 route statuses are unchanged.

**Automated tests:** cart view-model/state tests; copy contract; header tool
test (Cart enabled, others disabled); `test:http` additions for `/cart` status
and `noindex`; sitemap/robots tests unchanged.

**Manual validation:** `next start`; empty and populated (fake-data dev build)
cart at 500/820/1440 px; keyboard and screen-reader labels.

**Accessibility/responsive:** list semantics, labelled quantity controls,
`aria-live` for updates, focus management after remove, no horizontal scroll.

**Documentation:** this file, status files, `FRONTEND_ARCHITECTURE.md` route
table, `frontend/README.md` if tests change.

**Definition of done:** cart page and checkout boundary live; `npm run build`
and `npm run test:http` pass.

**Git/stop:** branch `s5-t07-cart-page`; commit
`feat(s5): add cart page`; STOP.

---

### S5-T08 — Sprint 5 Review

**Status:** COMPLETED (approved by explicit request, 2026-09-29). The review
record is below; the original proposed spec follows it unchanged.

#### Verdict

**Sprint 5 can close as COMPLETED — Track A only.** S5-T01–S5-T04 are
complete, verified, and committed. Track B (S5-T05–S5-T07: local cart,
add-to-cart, cart page) was **not implemented** and is **DEFERRED** pending
renewed approval of Q1/Q2. Those tasks are not complete and their IDs stay
reserved. No release risk was found in Sprint 5 code; open items are business
decisions and pre-existing debt.

#### Task status

| Task | Status | Commit | Evidence |
|------|--------|--------|----------|
| S5-T01 Planning | COMPLETED | `945121a` | This file |
| S5-T02 Purchasability rules | COMPLETED | `a165b00` | `evaluate-purchasability.ts` + tests |
| S5-T03 PDP price & availability | COMPLETED | `f3db555` | Panel on every PDP; `test:http` panel check |
| S5-T04 Variant selector | COMPLETED | `8e6e0e7` | Selector + resolver + static-render tests |
| S5-T05 Local cart store | DEFERRED (not implemented) | — | Q1/Q2 not approved |
| S5-T06 PDP add to cart | DEFERRED (not implemented) | — | Depends on S5-T05 |
| S5-T07 Cart page | DEFERRED (not implemented) | — | Depends on S5-T05/T06; Q4 copy open |
| S5-T08 Sprint review | COMPLETED | this commit | This section |

**Commit verification:** all four commits are ancestors of `HEAD` on
`s5-t01-sprint-5-planning`, in order. `git branch -r --contains HEAD` is empty
(nothing pushed); `origin/main` and local `main` are still `d31f07a`. The
working tree was clean apart from generated `.next` output. `git diff c4d47f7
HEAD` touches no infrastructure, repository, core domain type, SEO builder,
sitemap, or robots file.

#### Validation (fresh run at `8e6e0e7`, 2026-09-29)

- `npm test`: 59 files, 335 tests passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed (routes unchanged: `/` static, `/c/[slug]` and
  `/p/[slug]` dynamic, `/robots.txt` and `/sitemap.xml` static)
- `npm run test:http`: 18 tests passed (browser + Googlebot statuses, 404s,
  PDP panel)
- Production smoke (`next start`):
  - `/sitemap.xml` 200 with 67 URLs; `/robots.txt` 200
  - PDP has Organization, Product, and BreadcrumbList JSON-LD, no `offers`,
    and the canonical link
  - PDP shows “Price not available”
  - `/cart` returns 404 (no cart route exists)
- Not re-run in this review: the manual responsive and accessibility-tree
  checks. The evidence is the S5-T03 record (390 px and ≈1024 px, no
  horizontal scroll, 44 px phone link, labelled region) and the S5-T04
  static-render tests.

#### Review findings by area

- **Catalog data:** unchanged. All 12 products still have `sku`, `uom`,
  `pricing`, and `inventory` set to `null` and `variants: []`. No fixture
  edits.
- **Architecture:**
  - Rules live in the application layer (`evaluatePurchasability`, view
    models); pages only compose.
  - The client component (`product-purchase-options.tsx`) holds selection
    state only and swaps precomputed server view models.
  - Repository ports and HTTP and dummy repositories are untouched.
- **Responsive and accessibility:**
  - Mobile-first panel with a labelled region and a `tel:` link.
  - Selector uses native `fieldset`/`legend` radios and polite live regions.
  - Current PDPs render no selector because no product has variants.
- **SEO and structured data:** unchanged. No `offers` without real prices;
  sitemap still has 67 URLs; canonical and robots unchanged.
- **HTTP status:** unchanged. 200 for valid routes, real 404 for unknown
  slugs, for both user agents.
- **Tests:** rules, view models, selector, resolver, panel, and PDP wiring
  are covered at application boundaries. The live PDP is also checked over
  HTTP.
- **Documentation:**
  - `application/catalog/README.md`, `components/storefront/README.md`, and
    `FRONTEND_ARCHITECTURE.md` match the code.
  - S5-T02–S5-T04 used the checked-out branch instead of the planned
    per-task branches (switching was prohibited). The same applies to this
    review, instead of `s5-t08-sprint-review`.

#### Business constraints confirmed

| Constraint | Result |
|------------|--------|
| No invented prices, stock, SKUs, units, or variants | Confirmed. Catalog values remain `null`/empty; `priceDisplay` is `null`, so no amount renders |
| Unknown inventory blocks purchase | Confirmed (`inventory_unknown` reason; tests) |
| No variant fallback to parent price or stock | Confirmed (variant values only; tests) |
| No cart, checkout, or order creation | Confirmed. No cart code or `localStorage`; `/cart` is 404; no purchase control in any state |
| No Zoho calls or credentials | Confirmed. The source search finds no Zoho code, keys, or calls |
| Zoho allowance | 7,500 requests/month recorded as a **future, unverified** constraint in `SPRINT-07.md` and TD-010 |
| No merge or push without approval | Confirmed. Nothing pushed or merged |

#### Deferred items (not decided here)

- Cart and device-local guest cart (S5-T05–S5-T07): deferred pending renewed
  approval of Q1/Q2.
- Locale and currency (Q9) unresolved: price display stays disabled
  (`priceDisplay = null`).
- Listing-card prices and controls (Q10): deferred.
- Search (Q7): deferred.
- Account and order tracking: later sprint (Sprint 8 per §6).
- **S5-T04 deviation:** unavailable variants and non-existent combinations
  stay selectable and explain why, instead of being disabled. This was
  recorded in S5-T04 and is not reopened here.
- Other open questions: Q4 (availability, checkout, and cart copy), Q5
  (quantity limit), Q6 (“In stock” wording), and Q11 (integrating Sprint 3–5
  branches into `main`).

#### Other findings (recorded, not fixed)

- **TD-011, homepage service claims:** the trust strip says “Secure Payment
  — 100% secure checkout”, “Free Shipping — On orders above ₹999”, “Easy
  Returns”, and “24/7 Support”; the announcement bar adds “COD Available”.
  This copy comes from the approved `DESIGN_OPTION_1.md`, but no online
  checkout or payment exists. It needs business confirmation.
- **TD-010:** the Zoho request allowance is unverified.
- **No DOM or E2E test runner:** variant click and keyboard switching is
  verified through pure logic and static markup only. No product has variants
  for a manual check.
- **Branch integration:** Sprints 3–5 are stacked on unmerged, unpushed
  branches; `main` is still `d31f07a` (Q11, release risk carried from S4-T12).
- **Existing TD items stay open:** TD-002, TD-003, TD-005, TD-006, and
  TD-008. `test:http` is still manual (TD-006).
- **Pre-existing dev-server console message:** “Router action dispatched
  before initialization”. It was seen before S5-T03 and is not investigated.
- **Canonical and JSON-LD URLs use the configured `NEXT_PUBLIC_SITE_URL`:**
  `http://localhost:3000` locally. The production domain is still TBD, as
  already tracked in `PROJECT_STATUS.md`.

#### Recommendations (awaiting approval; not started)

1. Business decisions on Q1/Q2 (cart), Q9 (locale and currency), Q4 (copy),
   and TD-011 (homepage claims).
2. Decide on Q11: integrate Sprints 3–5 into `main` before Sprint 6.
3. If Q1/Q2 are approved, re-plan S5-T05–S5-T07. Otherwise start Sprint 6
   planning. Neither is started by this review.

#### Original proposed spec

**Objective:** Verify Sprint 5 against this plan, the data-safety rules, SEO,
accessibility, and responsiveness; synchronize documentation.

**Scope:** full validation (`npm test`, typecheck, lint, `npm run build`,
`npm run test:http`); production smoke for browser and Googlebot; review of
rules 1–12 against source and UI; debt register update; status closeout.

**Exclusions:** no new features or unrelated fixes (defects are documented, or
fixed in a separately approved S5-Fnn task).

**Dependencies:** all approved Sprint 5 tasks completed; deferred tasks
recorded.

**Acceptance criteria:** evidence recorded per task; no invented commerce
values anywhere; SEO outputs unchanged except the approved `/cart` noindex
route; next step recommended but not started.

**Automated tests:** the full suite plus `test:http`.

**Manual validation:** production smoke; responsive and keyboard pass on PDP
(and cart if built).

**Documentation:** this file, status files, `TECHNICAL_DEBT.md`.

**Definition of done:** Sprint 5 closed with evidence.

**Git/stop:** branch `s5-t08-sprint-review`; commit
`docs(s5): complete sprint 5 review`; STOP. Do not start Sprint 6.

---

## 6. Deferred (must not enter Sprint 5)

| Item | Target |
|------|--------|
| Zoho API integration, inventory synchronization | Sprint 7 (requires authorized access; not verified) |
| Production backend, database selection/schema, server cart | Sprint 6 |
| Authentication, account area | Sprint 8 |
| Checkout, real orders, order persistence, fulfillment, Track Your Order | Sprint 8 |
| Payment gateway, shipping, tax, email | Sprint 9 |
| Search interface | Business decision (Q7); not scheduled |
| Listing-card prices and add-to-cart | Business decision (Q10) |
| Product JSON-LD `offers` | Separate SEO task once real prices exist |
| Filter/sort | `CATALOG_FILTER_SORT.md` (TBD) |
| SEO keyword research, keyword mapping, content optimization | Deferred |
| S3-T10 Image Optimization | Deferred |
| Mega-menu redesign | Frozen (S4-T10C) |

Existing technical debt (`docs/project/TECHNICAL_DEBT.md`) is not scheduled in
Sprint 5. TD-006 (`test:http` not in CI) means Sprint 5 route tasks must run it
manually.

## 7. Risks

- **Unusable cart with current data:** Track B delivers a cart that no current
  product can enter until real prices arrive (Q1).
- **Client JavaScript growth on PDP:** keep client components minimal;
  catalog HTML stays server-rendered.
- **Stale local carts:** mitigated by storing references only (rule 9).
- **Unmerged branches:** Sprint 5 stacks further on unmerged Sprint 3–4
  branches.

## 8. Questions requiring business approval

| ID | Question | Default if undecided |
|----|----------|----------------------|
| Q1 | Build the local cart (Track B) now, knowing no current product has a price, or wait for real pricing data? | Track B **DEFERRED** |
| Q2 | Is a device-local guest cart (`localStorage`, no account) acceptable? | Not built |
| Q3 | Can a product with a price but **unknown** inventory be added to the local cart? | **Resolved (S5-T02):** blocked |
| Q4 | Approved copy for “price not available”, “checkout not available”, and the cart device-only notice? Keep the phone contact as the call to action? | **Partly resolved (S5-T03):** “Price not available” + phone `090257 99377`. Availability wording, checkout, and cart copy still open |
| Q5 | Maximum quantity per line when stock is unknown or large? | `availableToSell` when known; otherwise add-to-cart blocked by Q3 |
| Q6 | May the storefront show “In stock” (status only, no numbers)? | Show only “Out of stock” |
| Q7 | Is search in scope for Sprint 5? If yes: behavior, fields searched, and results page indexing | Deferred |
| Q8 | For variants without their own price, may product-level pricing apply? | **Resolved (S5-T02):** no fallback |
| Q9 | Display locale and currency formatting (for example `en-IN` / INR)? | **Open:** `en-IN`/INR only with verified business configuration; `config/commerce.ts` `priceDisplay` is `null`, so no price renders |
| Q10 | Should listing cards show prices / add-to-cart when data exists? | No |
| Q11 | Integrate Sprint 3–4 branches into `main` (and push) before Sprint 5 implementation? | Stack on `s4-t12-sprint-review`; no merge or push |

## Exit criteria

Approved Sprint 5 tasks are completed with evidence, deferred tasks are
recorded, and no UI implies an order, payment, stock reservation, or
fulfillment. Do not start Sprint 6 automatically.
