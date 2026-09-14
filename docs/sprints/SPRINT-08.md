# Sprint 8 — Orders, Checkout & Operations

| Field | Value |
|-------|-------|
| Sprint ID | S8 |
| Phase | Phase 2 — Orders & Operations |
| Objective | Implement approved order, checkout, account/auth, and operational workflows |
| Status | NOT_STARTED |
| Dependencies | Sprint 7 completed; business and security requirements approved |
| Task IDs | TBD before Sprint 8 starts |

## Planned scope

- Cart-to-order and checkout workflows
- Order status and Track Your Order behavior
- Customer/account and authentication requirements as approved
- Inventory/order consistency and operational failure handling
- Admin/operations requirements, RBAC, and audit where approved
- Checkout accessibility, privacy, security, and noindex behavior

## Guardrails

- Payment, shipping, tax, returns, cancellation, fulfillment, customer identity,
  order statuses, and notification vendors remain TBD until approved.
- Do not collect or log unnecessary PII.
- Do not implement authentication without an ADR.
- Do not store raw payment-card data.
- UI continues to consume Mini Mystiq contracts, not Zoho DTOs.

## Exit criteria

Detailed tasks, acceptance criteria, security/privacy requirements, and provider
decisions must be written before Sprint 8 starts. Later payment, messaging,
marketing, and production-readiness work remains separately planned.
