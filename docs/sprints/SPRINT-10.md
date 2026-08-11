# Sprint 10 — Customer Segmentation + Campaigns + Analytics

| Field | Value |
|-------|--------|
| Sprint ID | S10 |
| Phase | Phase 4 — Digital Marketing |
| Objective | Segmentation, campaigns, analytics (approach TBD) |
| Status | NOT_STARTED |
| Dependencies | Sprint 9 completed |

Do not embed unapproved tracking scripts. Analytics vendor **TBD** (ADR).

---

## S10-T01 — Customer Segmentation

**Status:** NOT_STARTED

### Objective

Define and persist customer segments. Rules **TBD** (do not invent RFM unless approved).

### Dependencies

S8-T01.

### Requirements

PII and marketing consent **TBD**/legal. Mark blockers if consent model missing.

### Implementation scope

Segment model + computation **or** manual segments + ADR/requirements.

### Expected files/modules

- Segment backend
- Requirements update

### Acceptance criteria

- At least one documented segment type **or** explicit blocker/TBD in status

### Testing requirements

Domain tests if rules exist.

### Definition of Done

Segmentation designed and minimally implemented or blocked with reason.

---

## S10-T02 — Campaigns

**Status:** NOT_STARTED

### Objective

Campaign records (email/site). Channel **TBD**. Do not spam.

### Dependencies

S10-T01, S9-T02 if email.

### Requirements

No send-all without consent model.

### Implementation scope

Campaign entity + admin stub + send only if email adapter and consent exist.

### Expected files/modules

- Campaign modules
- Optional admin

### Acceptance criteria

- Campaign can be created in admin **or** deferral documented
- No unsolicited send in default config

### Testing requirements

Unit tests for eligibility if implemented.

### Definition of Done

Campaigns stub or real send path as documented.

---

## S10-T03 — Analytics

**Status:** NOT_STARTED

### Objective

Product analytics. Vendor **TBD**. Privacy **TBD**.

### Requirements

ADR before adding third-party scripts. Prefer server-side events if chosen.

### Implementation scope

ADR + adapter or documented deferral. Do not add GA/Pixel without ADR.

### Expected files/modules

- ADR
- Optional analytics adapter
- CSP/privacy notes TBD

### Acceptance criteria

- Vendor decided via ADR **or** explicitly deferred
- No undeclared third-party tags

### Testing requirements

N/A if deferred; adapter tests if present.

### Definition of Done

Analytics decision recorded.

---

## S10-T04 — Admin Marketing Modules

**Status:** NOT_STARTED

### Objective

Admin UI for whatever of segmentation/campaigns/analytics was implemented.

### Dependencies

S10-T01 … S10-T03, S8 RBAC.

### Requirements

RBAC protected. Skip UI for deferred features.

### Implementation scope

Admin pages for implemented marketing features only.

### Expected files/modules

- Admin marketing pages
- `ADMIN_REQUIREMENTS.md` updated

### Acceptance criteria

- Implemented features are manageable in admin
- Deferred features not fake-shipped

### Testing requirements

Build; API tests.

### Definition of Done

Phase 4 closed for implemented scope; S11 not started.
