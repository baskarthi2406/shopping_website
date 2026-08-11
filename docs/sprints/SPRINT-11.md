# Sprint 11 — Production Readiness + Deployment

| Field | Value |
|-------|--------|
| Sprint ID | S11 |
| Phase | Phase 5 — Production |
| Objective | Security, performance, accessibility, deployment, production checklist |
| Status | NOT_STARTED |
| Dependencies | Sprint 10 completed |

Hosting, CI, and observability vendors are **TBD**.

---

## S11-T01 — Security Review

**Status:** NOT_STARTED

### Objective

Review auth, secrets, headers, admin exposure, dependency risk. Fix high issues in scope.

### Dependencies

Phase 2+ code exists.

### Requirements

No secrets in Git. Admin not indexable. Document residual risks.

### Implementation scope

Checklist in `docs/` + fixes. No new product features.

### Expected files/modules

- `docs/project/` security checklist
- Config/header fixes as needed

### Acceptance criteria

- Checklist completed
- Critical issues fixed or BLOCKED with owner

### Testing requirements

Existing tests green; add tests for any auth hole fixed.

### Definition of Done

Security review recorded.

---

## S11-T02 — Performance Pass

**Status:** NOT_STARTED

### Objective

Catalog page performance: images, server rendering, obvious N+1/API waterfalls, mobile Core Web Vitals.

### Dependencies

Storefront + API.

### Requirements

Budgets **TBD**. Measure with mobile-first / CWV in mind (LCP, INP, CLS). Do not add a new CDN vendor silently.

### Implementation scope

Measure (method TBD) + fix hotspots.

### Expected files/modules

- Performance notes in docs
- Frontend/backend fixes

### Acceptance criteria

- Notes include before/after or remaining TBD
- Catalog still crawlable
- Mobile performance and Core Web Vitals are addressed or listed as residual TBD with budgets still unset

### Testing requirements

Build; existing tests.

### Definition of Done

Performance notes committed.

---

## S11-T03 — Accessibility Audit

**Status:** NOT_STARTED

### Objective

Audit storefront (and admin if in scope) against the a11y target. Target **TBD** (proposed WCAG 2.2 AA needs approval).

### Dependencies

S4-T06 baseline.

### Requirements

Do not claim AA unless the target is accepted.

### Implementation scope

Audit list + fixes for must-fix issues.

### Expected files/modules

- A11y notes in docs
- Component fixes

### Acceptance criteria

- Keyboard and semantics issues from the audit addressed or listed as residual

### Testing requirements

Lint/build; optional a11y test tooling TBD.

### Definition of Done

Audit recorded.

---

## S11-T04 — Deployment

**Status:** NOT_STARTED

### Objective

Deploy frontend and backend to chosen hosts. Hosts **TBD**. ADR required.

### Dependencies

S11-T01 at least in progress.

### Requirements

Env secrets on the platform, not in Git. Migrations strategy documented.

### Implementation scope

ADR + deploy config + README runbooks.

### Expected files/modules

- ADR
- Deploy config (e.g. platform files)
- Runbook in `docs/` or README

### Acceptance criteria

- Documented deploy path
- No production secrets in repo

### Testing requirements

Documented smoke after deploy (manual acceptable).

### Definition of Done

Deploy path exists for the chosen TBD-resolved host.

---

## S11-T05 — Monitoring

**Status:** NOT_STARTED

### Objective

Health checks in production and error monitoring. Vendor **TBD**.

### Dependencies

S11-T04.

### Requirements

ADR for vendor. Do not leak PII to logs.

### Implementation scope

Monitoring adapter or platform integration + docs.

### Expected files/modules

- ADR or deferral
- Health URLs documented

### Acceptance criteria

- Health endpoint documented for ops
- Error tracking decided or deferred

### Testing requirements

Health still tested.

### Definition of Done

Monitoring decision recorded.

---

## S11-T06 — Production Checklist

**Status:** NOT_STARTED

### Objective

Final production checklist: SEO, backups **TBD**, rollback, env, legal pages **TBD**.

### Dependencies

S11-T01 … S11-T05.

### Requirements

Do not invent legal policies; link TBD placeholders.

### Implementation scope

Checklist document + status update to production-ready or blocked.

### Expected files/modules

- `docs/project/` production checklist
- Status files

### Acceptance criteria

- Checklist exists and is filled honestly
- Residual TBD items listed
- No automatic new feature sprint started

### Testing requirements

Full test suites green as configured.

### Definition of Done

Phase 5 checklist complete; project status updated. No further task started automatically.
