# Sprint 9 — Payment + Email + Messaging + Shipping

| Field | Value |
|-------|--------|
| Sprint ID | S9 |
| Phase | Phase 3 — Commerce |
| Objective | Payment, email, messaging, shipping integrations (vendors TBD) |
| Status | NOT_STARTED |
| Dependencies | Sprint 8 completed |

Do not choose vendors silently. Each vendor decision needs an ADR or an explicit requirements update.

---

## S9-T01 — Payment Integration

**Status:** NOT_STARTED

### Objective

Charge orders via a payment provider. Provider **TBD**.

### Dependencies

S7-T03, S8-T02 (if customer payment methods require accounts).

### Requirements

PCI: do not store raw card data. Secrets in env. ADR for provider.

### Implementation scope

ADR + payment adapter + checkout wiring + webhook **TBD**.

### Expected files/modules

- Payment infrastructure adapter
- Application complete-order/pay use case
- ADR

### Acceptance criteria

- Documented sandbox flow succeeds
- Failure path does not mark paid

### Testing requirements

Adapter tests with a fake provider; no live charges in CI.

### Definition of Done

Sandbox payments documented.

---

## S9-T02 — Email

**Status:** NOT_STARTED

### Objective

Transactional email (order confirmation at minimum). Provider **TBD**.

### Dependencies

S9-T01 or S7-T03 if emails on order-create without pay.

### Requirements

Templates **TBD**. Do not send from CI using real customers.

### Implementation scope

Email port/adapter + trigger on documented events.

### Expected files/modules

- Email adapter
- Templates placeholder
- ADR or requirements note for provider

### Acceptance criteria

- Order confirmation can be sent in a dev/sandbox mode
- Adapter is swappable

### Testing requirements

Unit tests with fake mailer.

### Definition of Done

Email port live.

---

## S9-T03 — Messaging

**Status:** NOT_STARTED

### Objective

SMS or other messaging if required. Channel **TBD**. If not required, record deferral as TBD — do not invent WhatsApp/SMS.

### Dependencies

S9-T02 optional.

### Requirements

Do not implement a channel without a documented need.

### Implementation scope

Either messaging adapter + ADR, or explicit deferral in requirements and sprint status.

### Expected files/modules

- Adapter **or** `docs/requirements/` deferral note

### Acceptance criteria

- Implemented channel works in sandbox **or** deferral is explicit

### Testing requirements

Fake adapter tests if implemented.

### Definition of Done

Messaging decided (done or deferred).

---

## S9-T04 — Shipping

**Status:** NOT_STARTED

### Objective

Shipping rates/labels. Carrier **TBD**. Do not invent rate tables.

### Dependencies

S7-T03.

### Requirements

Address model TBD. Tax/shipping interaction TBD.

### Implementation scope

Shipping port + stub or real adapter per ADR. Checkout shows method only if data exists.

### Expected files/modules

- Shipping adapter
- ADR or TBD stub with zero real carriers

### Acceptance criteria

- Order can record a shipping method field **or** explicit deferral
- No fake carrier branding

### Testing requirements

Unit tests if logic exists.

### Definition of Done

Shipping approach documented and minimally wired or deferred.

---

## S9-T05 — Coupons

**Status:** NOT_STARTED

### Objective

Apply coupons at cart/checkout if in scope. Rules **TBD**. Admin coupons module if implemented.

### Dependencies

S7-T02; admin shell.

### Requirements

Do not invent stacking/discount math beyond a documented minimal rule (e.g. single percent coupon).

### Implementation scope

Coupon model + apply use case + optional admin.

### Expected files/modules

- Coupon backend + optional admin UI

### Acceptance criteria

- One documented coupon type works **or** deferral recorded

### Testing requirements

Domain tests for discount if implemented.

### Definition of Done

Coupons done or deferred explicitly.

---

## S9-T06 — Checkout Completion

**Status:** NOT_STARTED

### Objective

End-to-end checkout using implemented payment/email/shipping pieces. Replace Phase 1 “shell only” copy.

### Dependencies

S9-T01 and any of T02–T05 that were not deferred.

### Requirements

No storefront rewrite. SEO: checkout remains non-indexable.

### Implementation scope

Checkout UI + application orchestration.

### Expected files/modules

- Checkout pages/services
- Docs for the sandbox flow

### Acceptance criteria

- Documented happy path: cart → pay (if present) → order → email (if present)
- Deferred pieces labeled in UI/docs

### Testing requirements

Integration-style tests with fakes.

### Definition of Done

Phase 3 checkout path documented; S10 not started.
