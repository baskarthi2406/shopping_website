# Sprint 8 — Customers + Authentication + RBAC + Audit

| Field | Value |
|-------|--------|
| Sprint ID | S8 |
| Phase | Phase 2 — Backend + Admin |
| Objective | Customers, authentication, RBAC, audit logs, related admin |
| Status | NOT_STARTED |
| Dependencies | Sprint 7 completed |

Auth provider, session vs JWT, and password policy are **TBD** — require an ADR in S8-T02.

---

## S8-T01 — Customer Domain and API

**Status:** NOT_STARTED

### Objective

Customer records used by orders/accounts. Fields **TBD** (minimal: id, email).

### Dependencies

S7-T03 useful but not strictly required.

### Requirements

PII minimization. No marketing lists in this task.

### Implementation scope

Customer table, API, migration.

### Expected files/modules

- Customer backend modules

### Acceptance criteria

- Create/get customer as documented
- Email uniqueness if required by ADR/task notes

### Testing requirements

API tests.

### Definition of Done

Customer API live.

---

## S8-T02 — Authentication

**Status:** NOT_STARTED

### Objective

Authenticate admin users (and optionally customers — **TBD**). Write ADR for mechanism.

### Dependencies

S8-T01 if customer login is in scope; otherwise admin user model may live here.

### Requirements

No secrets in Git. Do not roll a novel crypto scheme; use a standard approach documented in the ADR.

### Implementation scope

ADR + auth endpoints + password hashing or external provider stub as decided.

### Expected files/modules

- ADR
- Auth modules
- Env example

### Acceptance criteria

- Documented login path works locally
- Unauthenticated admin API is rejected (once wired)

### Testing requirements

Auth API tests.

### Definition of Done

Auth ADR + working local login.

---

## S8-T03 — RBAC

**Status:** NOT_STARTED

### Objective

Roles and permissions for admin (and customer roles if decided). Permission matrix **TBD** — start with `admin` vs `none`.

### Dependencies

S8-T02.

### Requirements

Enforce at API boundary. Do not hide-only in UI.

### Implementation scope

Role model, dependency guards, seed admin role.

### Expected files/modules

- RBAC modules
- Guard usage on admin routers

### Acceptance criteria

- Forbidden when role lacks permission
- Seed how to create first admin documented

### Testing requirements

API tests for 401/403.

### Definition of Done

RBAC enforced on admin APIs.

---

## S8-T04 — Admin Users/Roles

**Status:** NOT_STARTED

### Objective

Admin UI to manage users and roles.

### Dependencies

S8-T03, S6-T04.

### Requirements

Cannot lock out last admin (**TBD** rule — implement a safe minimum).

### Implementation scope

Users/roles admin screens.

### Expected files/modules

- Admin user/role pages

### Acceptance criteria

- Admin can assign a role
- Unauthenticated access blocked

### Testing requirements

API tests remain green.

### Definition of Done

Users/roles admin usable.

---

## S8-T05 — Audit Log Pipeline

**Status:** NOT_STARTED

### Objective

Record who changed what on sensitive admin actions (product/order/inventory/user). Payload detail **TBD**.

### Dependencies

S8-T02.

### Requirements

Do not store secrets/passwords in audit. Append-only preferred.

### Implementation scope

Audit table, writer in application layer, hooks on selected use cases.

### Expected files/modules

- Audit repository + middleware/service
- Migration

### Acceptance criteria

- At least product update and order create (or documented set) write audit rows
- Actor id recorded when authenticated

### Testing requirements

Unit/API tests for audit writes.

### Definition of Done

Audit pipeline live.

---

## S8-T06 — Admin Customers

**Status:** NOT_STARTED

### Objective

Admin list/detail for customers.

### Dependencies

S8-T01, S6-T04, S8-T03.

### Requirements

RBAC protected. PII display minimization TBD.

### Implementation scope

Admin customer screens.

### Expected files/modules

- Admin customer pages

### Acceptance criteria

- Customers listed for authorized users only

### Testing requirements

403 tests on API.

### Definition of Done

Customers admin usable.

---

## S8-T07 — Admin Audit Logs

**Status:** NOT_STARTED

### Objective

Read-only admin view of audit logs.

### Dependencies

S8-T05, S8-T04.

### Requirements

Filter TBD (at least list recent).

### Implementation scope

Admin audit log page.

### Expected files/modules

- Admin audit pages
- Audit list API if not already present

### Acceptance criteria

- Authorized admin can view logs
- Passwords never shown

### Testing requirements

API list test.

### Definition of Done

Audit admin usable; Phase 2 core complete in status; S9 not started.
