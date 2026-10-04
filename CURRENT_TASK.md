# Current Task

No task is approved. Do not start any task until a human explicitly requests it.

---

## Last completed task

| Field | Value |
|-------|-------|
| Task ID | S6-T14 |
| Task | Server-side Zoho Request Wrapper (redefined by the project owner from “Outbound Request Policy” for the 3-day Zoho feasibility demo) |
| Status | **COMPLETED** |
| Scope | Gate G2 passed via the minimum ADR 0009 boundary amendment. Server-only `infrastructure/zoho/zoho-config.ts` and `zoho-client.ts`: server env configuration, explicit timeout, origin-locked paths, sanitized errors, untrusted `unknown` responses. S6-T14 establishes the server-side Zoho integration boundary; actual Zoho capability verification is deferred to S6-T15. No Zoho request, mapping, order creation, UI, contract, or dependency change. Details: `docs/sprints/SPRINT-06.md` → S6-T14. |

---

## Task ID

None.

## Status

**NOT_STARTED** — Sprint 6 is IN PROGRESS.

S3-T10 Image Optimization, the original “SEO-Friendly URL Strategy”, and
Sprint 5 Track B (S5-T05–S5-T07) remain **DEFERRED**. Do not start them
automatically.

## In progress

**S6-T15 — Zoho feasibility spike.** Authentication PASS; read-only catalog
feasibility **PARTIAL, sufficient for demo**
(`docs/project/S6-T15-ZOHO-CATALOG-FEASIBILITY.md`). Demo product → cart →
checkout → Zoho Sales Order **works** (`docs/project/DEMO-ZOHO-SALES-ORDER.md`):
one owner-approved draft demo Sales Order (`SO-00001`) created and verified.
No invoice or payment. Demo **frozen** at baseline commit `589b74a`;
production gaps and P0/P1/P2 backlog in `docs/project/PRODUCTION-READINESS.md`
(assessment only). P0 decision gate (owner decisions OD-1–OD-9, Zoho
verifications V1–V11, P0 order) in `docs/project/PRODUCTION-DECISIONS.md`,
awaiting owner answers. No further task is approved; do not start production work,
payment, or Sprint 7 automatically.

## Original S6-T15 scope

**S6-T15 — Zoho feasibility spike** (highest priority for the demo target
“Zoho POS → real products → storefront → cart → checkout → demo/COD order →
Zoho”). Determines authentication, items, prices, stock, IDs, order creation,
and API limits. Requires Zoho access (gate GZ) and explicit human approval.
