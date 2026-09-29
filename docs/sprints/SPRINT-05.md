# Sprint 5 — Commerce UI

| Field | Value |
|-------|-------|
| Sprint ID | S5 |
| Phase | Phase 1 — Customer Storefront |
| Objective | Complete customer-facing commerce interactions against stable application/API contracts |
| Status | NOT_STARTED |
| Dependencies | Sprint 4 completed |
| Task IDs | TBD before Sprint 5 starts |

## Planned scope

- Search UI and results behavior (requirements TBD)
- Account entry point/chrome without inventing authentication behavior
- Cart UI and state through application/repository contracts
- Track Your Order entry point and non-misleading state (backend behavior TBD)
- Product option/variant selection using confirmed S4 contracts
- Responsive, accessible customer navigation refinements
- Commerce loading, validation, error, and empty states

## Guardrails

- Do not charge payments or claim persisted orders unless the supporting
  production API exists.
- Keep SEO-critical catalog content server-rendered.
- Do not embed backend or Zoho DTOs in React components.
- Customer taxonomy remains data-driven.
- Authentication, checkout rules, shipping, returns, currency, tax, and payment
  providers remain TBD unless explicitly approved.

## Exit criteria

Detailed tasks, dependencies, tests, and acceptance criteria must be written and
approved before Sprint 5 starts. Do not start Sprint 6 automatically.
