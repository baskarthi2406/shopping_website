# ADR 0005 — Stable Storefront Contracts and Zoho Adapter Boundary

- **Status:** Accepted
- **Date:** 2026-09-14

## Context

Mini Mystiq needs a dummy API during development and may integrate with Zoho POS
later. Exposing Zoho response objects directly to pages, components, or
application use cases would couple the storefront to a vendor contract and make
the UI expensive to change or test.

The current storefront already depends on application use cases and repository
interfaces, with static records mapped to domain models. ADR 0004 established
the static-to-HTTP repository swap. The revised roadmap brings API contract and
dummy API work into Sprint 4 and schedules production backend and Zoho work for
later sprints.

## Decision

- Mini Mystiq owns the storefront-facing application/API contracts.
- Pages and components consume application results and view models, never Zoho
  DTOs or raw dummy payloads.
- Repository interfaces remain the replacement seam.
- Static repositories remain available while dummy API adapters are introduced.
- Dummy API payloads may resemble verified Zoho structures where that improves
  adapter fidelity, but those transport types remain in infrastructure and are
  mapped to Mini Mystiq domain/application models.
- A future Zoho repository/adapter forms an anti-corruption layer:

  ```
  Zoho DTO → Zoho mapper/adapter → Mini Mystiq domain/API contract
  ```

- Dummy and Zoho implementations must satisfy the same application semantics so
  replacing one does not require a storefront rewrite.
- Recursive categories are data-driven and have no fixed maximum depth.
- Product lists use `ProductSummary`; details use `Product` with generic
  name/value variant attributes. Unknown SKU, UOM, price, and inventory values
  are nullable, and absent real variants are an empty collection.
- Pricing uses current price plus optional compare-at price. Inventory separates
  nullable on-hand, available-to-sell, and reserved quantities from availability
  status. Neither contract implements calculations or synchronization.
- Product lists use minimal page-number pagination (`page`, `pageSize`, `total`,
  `hasNext`). Category navigation trees are ordered and unpaginated.
- Success uses a `data` envelope; errors use a provider-independent `error`
  envelope. Missing detail is `not_found`; empty lists remain successful.
- Application IDs and public SEO slugs are separate identities. Public routes
  remain `/c/{slug}` and `/p/{slug}` and never expose Zoho item IDs by default.
- The response contract is transport-neutral. Dummy API runtime, endpoint paths,
  and transport status-code mapping remain implementation decisions; this ADR
  does not select a server framework.
- The planned FastAPI modular-monolith direction (ADR 0003) remains accepted for
  the production backend unless a later ADR changes it. Its schedule moves to
  Sprint 6.

## Consequences

- Hierarchical navigation does not embed customer taxonomy in React.
- S4-T03 defines provider-independent domain models and application response
  envelopes. Raw dummy and Zoho DTOs remain separate infrastructure types when
  introduced; no duplicate transport model is created before a transport exists.
- S4-T04–S4-T06 may add dummy API implementations, but cannot leak raw transport
  records into UI.
- S7 must verify actual Zoho documentation before implementing mappings; fields
  not confirmed by Zoho remain TBD.
- Additional mapping code is intentional. It protects the storefront from
  vendor-specific field names, nullability, identifiers, and error behavior.
- ADR 0004 remains valid; references to an HTTP repository are now generalized
  to dummy and future production/Zoho-backed implementations.
- Detailed field semantics and invariants are maintained in
  `docs/architecture/STOREFRONT_CONTRACTS.md`.
