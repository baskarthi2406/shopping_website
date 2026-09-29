# Current Task

No task is approved. Do not start any task until a human explicitly requests it.

---

## Last completed task

| Field | Value |
|-------|-------|
| Task ID | S6-T12 |
| Task | Catalog Contract Conformance Suite |
| Status | **COMPLETED** |
| Scope | Reusable `describeCatalogApiContract` (12 named checks over the existing `CatalogApiDispatch` seam) run against the in-process dummy dispatch and an independent synthetic fake; 19 deliberately broken implementations prove each check fails meaningfully. Dummy-specific tests cover a normalized golden file, null commerce fields, category references, and sitemap ↔ API alignment. Verified contract and ambiguities recorded in `docs/architecture/STOREFRONT_CONTRACTS.md`. Tests and docs only: no runtime, UI, route, SEO, data, contract, Zoho, or dependency change. Details: `docs/sprints/SPRINT-06.md` → S6-T12. |

---

## Task ID

None.

## Status

**NOT_STARTED** — Sprint 6 is IN PROGRESS.

S3-T10 Image Optimization, the original “SEO-Friendly URL Strategy”, and
Sprint 5 Track B (S5-T05–S5-T07) remain **DEFERRED**. Do not start them
automatically.

## Next task after approval (do not start)

**S6-T13 — Field Provenance Rules**, after gate G1 (ADR 0007 provenance
section accepted) and explicit human approval. The decision on merging
Sprints 3–5 into `main` (D12) remains open.

Later gates: G2 (accept ADR 0009) before S6-T14; GZ (Zoho access + approval)
before S6-T15. No database, FastAPI, or Zoho integration without its gate.
