# Sprint 7 — Inventory + Cart + Orders

| Field | Value |
|-------|--------|
| Sprint ID | S7 |
| Phase | Phase 2 — Backend + Admin |
| Objective | Inventory, persisted cart, orders; admin inventory/orders; storefront integration |
| Status | NOT_STARTED |
| Dependencies | Sprint 6 completed |

Stock policies, reservation, and order statuses are **TBD** — choose a minimal documented set in the first related task.

---

## S7-T01 — Inventory Domain and API

**Status:** NOT_STARTED

### Objective

Persist stock levels per product (and variant if variants exist). Movements **TBD**.

### Dependencies

S6-T01.

### Requirements

Minimal: on-hand quantity. Do not invent warehouses unless documented.

### Implementation scope

Inventory table, repo, API, migration.

### Expected files/modules

- Inventory backend modules

### Acceptance criteria

- Read/adjust quantity as documented
- Product API or inventory API exposes stock for storefront **TBD** (document)

### Testing requirements

API + domain tests (never negative if that rule is chosen).

### Definition of Done

Inventory API live.

---

## S7-T02 — Cart Persistence API

**Status:** NOT_STARTED

### Objective

Server-side cart for identified carts (guest identity **TBD**: cookie vs none). Replace or dual-run with client cart via frontend repository.

### Dependencies

S5-T06, S4 cart interfaces, S6 products.

### Requirements

Frontend cart repository interface should gain an HTTP implementation without rewriting cart UI.

### Implementation scope

Cart API + frontend HTTP cart repo. Guest model TBD and documented.

### Expected files/modules

- Cart backend
- Frontend HTTP cart adapter

### Acceptance criteria

- Add/update/remove persist on the server for a cart id
- UI still uses cart application services

### Testing requirements

API tests; adapter tests with mocked fetch.

### Definition of Done

Persisted cart works locally.

---

## S7-T03 — Order Domain and API

**Status:** NOT_STARTED

### Objective

Create orders from a cart (payment capture is Phase 3). Minimal statuses **TBD** (e.g. `pending`).

### Dependencies

S7-T02.

### Requirements

Do not charge cards. Do not invent fulfillment workflows.

### Implementation scope

Order tables, create-from-cart use case, API.

### Expected files/modules

- Order backend modules

### Acceptance criteria

- Order can be created from a cart
- Cart handling after order (clear vs freeze) documented

### Testing requirements

Use-case tests.

### Definition of Done

Order API without payment.

---

## S7-T04 — Admin Inventory

**Status:** NOT_STARTED

### Objective

Admin screens to view/adjust inventory.

### Dependencies

S7-T01, S6-T04.

### Requirements

Reuse inventory API.

### Implementation scope

Admin inventory UI.

### Expected files/modules

- Admin inventory pages

### Acceptance criteria

- Admin can set quantity for a product

### Testing requirements

API tests remain green.

### Definition of Done

Inventory admin usable.

---

## S7-T05 — Admin Orders

**Status:** NOT_STARTED

### Objective

Admin list/detail for orders (actions TBD beyond view).

### Dependencies

S7-T03, S6-T04.

### Requirements

PII display rules TBD — do not log full customer data in the browser console.

### Implementation scope

Admin order list/detail.

### Expected files/modules

- Admin order pages

### Acceptance criteria

- Orders created via API appear in admin

### Testing requirements

API tests remain green.

### Definition of Done

Orders admin usable.

---

## S7-T06 — Storefront Cart/Order Integration

**Status:** NOT_STARTED

### Objective

Wire storefront cart page and checkout shell to persisted cart/order APIs. Still no payment.

### Dependencies

S7-T02, S7-T03, S4 UI.

### Requirements

Keep SEO catalog pages server-rendered. Checkout remains non-charging.

### Implementation scope

Frontend adapters + checkout calls create-order if appropriate.

### Expected files/modules

- Frontend HTTP repos
- Checkout shell updates

### Acceptance criteria

- Cart UI uses server cart when configured
- Order create works without payment provider

### Testing requirements

Adapter tests; lint/build.

### Definition of Done

Phase 2 cart/order path works locally; S8 not started.
