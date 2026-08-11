# Sprint 4 — Cart & Storefront Completion

| Field | Value |
|-------|--------|
| Sprint ID | S4 |
| Phase | Phase 1 — SEO-First Storefront |
| Objective | Client-side cart, storefront completion, Phase 1 review. No payments. |
| Status | NOT_STARTED |
| Dependencies | Sprint 3 completed |

---

## S4-T01 — Cart Domain Model

**Status:** NOT_STARTED

### Objective

Define cart entity/value objects and pure domain operations (add, update qty, remove).

### Dependencies

S1-T05 (product type).

### Requirements

Domain must not import React. Persistence **TBD** (client storage chosen in S4-T02).

### Implementation scope

Domain + tests only.

### Expected files/modules

- Cart types and functions in `frontend` domain/application

### Acceptance criteria

- Add/update/remove are unit-tested
- Unknown product handling defined (reject vs ignore) and tested

### Testing requirements

Unit tests for cart operations.

### Definition of Done

Domain complete; no UI required in this task.

---

## S4-T02 — Cart Persistence Adapter (Client)

**Status:** NOT_STARTED

### Objective

Implement a cart repository for the browser (e.g. memory + `localStorage`). Choice documented; not server-backed.

### Dependencies

S4-T01.

### Requirements

Infrastructure implements a cart repository interface. No FastAPI.

### Implementation scope

Cart repository + wiring.

### Expected files/modules

- `CartRepository` interface
- Client storage implementation
- Docs note on persistence

### Acceptance criteria

- Cart survives reload if localStorage chosen
- SSR catalog pages do not break (cart is a client concern)

### Testing requirements

Unit tests with a fake storage.

### Definition of Done

Adapter tested.

---

## S4-T03 — Add / Update / Remove Cart UI

**Status:** NOT_STARTED

### Objective

Client Component controls on PDP (and listing if simple) to mutate the cart.

### Dependencies

S4-T02, S2-T03.

### Requirements

Keyboard accessible buttons. Do not block crawlable product HTML behind the cart island.

### Implementation scope

Cart buttons + application service used by client island.

### Expected files/modules

- Add-to-cart client component
- Cart application service

### Acceptance criteria

- User can add a mock product and change quantity
- Product content remains in server HTML

### Testing requirements

Unit tests for the service; component test if runner supports it.

### Definition of Done

Mutations work on mock products.

---

## S4-T04 — Cart Page

**Status:** NOT_STARTED

### Objective

Cart page listing lines, quantities, remove. Not indexable as a catalog page.

### Dependencies

S4-T03.

### Requirements

Semantic table/list. No payment. SEO: do not add cart to sitemap.

### Implementation scope

Cart route + UI.

### Expected files/modules

- Cart page
- Line item component

### Acceptance criteria

- Empty cart state
- Lines reflect repository
- No checkout charge

### Testing requirements

Build + unit tests for line calculations (if any). Currency formatting **TBD**.

### Definition of Done

Cart page complete.

---

## S4-T05 — Checkout UI Shell (No Payment)

**Status:** NOT_STARTED

### Objective

Non-functional or form-only checkout shell stating payment is not available. No provider integration.

### Dependencies

S4-T04.

### Requirements

Do not collect real payment data. Do not pretend orders persist on a server.

### Implementation scope

Checkout route shell + copy that Phase 3 will implement payment.

### Expected files/modules

- Checkout page shell
- Not in sitemap

### Acceptance criteria

- Page exists and is clearly non-charging
- No FastAPI order API

### Testing requirements

Build; no payment tests.

### Definition of Done

Shell only.

---

## S4-T06 — Home Page Shell and Accessibility Pass

**Status:** NOT_STARTED

### Objective

Home page with internal links to catalog; accessibility pass on storefront shell. Merchandising content **TBD**.

### Dependencies

S2 catalog routes, S1-T07.

### Requirements

Do not invent campaigns. Placeholder hero/copy allowed if labeled as placeholder.

### Implementation scope

Home content + a11y fixes (focus, alt, headings).

### Expected files/modules

- Home page
- Shared shell fixes

### Acceptance criteria

- Home links into catalog
- Heading order valid on home/category/product/cart
- Keyboard access to nav and cart controls

### Testing requirements

Lint, build, manual a11y checklist recorded in the task notes or docs.

### Definition of Done

A11y pass documented; home is a shell not a marketing CMS.

---

## S4-T07 — Phase 1 Storefront Review

**Status:** NOT_STARTED

### Objective

Confirm Phase 1 DoD: SEO storefront, mock repos, cart client-side, no backend. Sync docs.

### Dependencies

S4-T01 … S4-T06.

### Requirements

No Phase 2 leakage.

### Implementation scope

Review, doc sync, small fixes.

### Expected files/modules

- Status + architecture + README

### Acceptance criteria

- No FastAPI/PostgreSQL implementation
- Repository interfaces still the persistence boundary
- Sprint 3 SEO features still present

### Testing requirements

Full frontend test + lint + build.

### Definition of Done

Phase 1 implementation closed in status; S5-T01 recorded, not started. Do not start Phase 2.
