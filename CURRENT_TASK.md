# Current Task

No task is approved. Do not start any task until a human explicitly requests it.

---

## Last completed task

| Field | Value |
|-------|-------|
| Task ID | S6-T13 |
| Task | Field Provenance Rules |
| Status | **COMPLETED** |
| Scope | Gate G1 passed: ADR 0007 provenance section accepted 2026-10-04 (stale price → `null`; future timestamps → `unknown`, no skew tolerance; expired `missing` → `unknown`; 24-hour inclusive freshness threshold). Pure rules in `frontend/application/catalog/field-provenance.ts` with an explicit evaluation time, plus focused tests. Not wired into runtime; no contract, data, UI, Zoho, or dependency change. Details: `docs/sprints/SPRINT-06.md` → S6-T13. |

---

## Task ID

None.

## Status

**NOT_STARTED** — Sprint 6 is IN PROGRESS.

S3-T10 Image Optimization, the original “SEO-Friendly URL Strategy”, and
Sprint 5 Track B (S5-T05–S5-T07) remain **DEFERRED**. Do not start them
automatically.

## Next task after approval (do not start)

**S6-T14 — Outbound Request Policy (server-only)**, after gate G2 (ADR 0009
accepted) and explicit human approval. The decision on merging Sprints 3–5
into `main` (D12) remains open.

Later gate: GZ (Zoho access + approval) before S6-T15. No database, FastAPI,
or Zoho integration without its gate.
