# Sprint 6 — Products + Categories + UOM + Admin

| Field | Value |
|-------|--------|
| Sprint ID | S6 |
| Phase | Phase 2 — Backend + Admin |
| Objective | Product, category, and UOM APIs plus corresponding admin modules |
| Status | NOT_STARTED |
| Dependencies | Sprint 5 completed |

Admin UI host (same Next.js app vs separate) is **TBD** — decide with an ADR in S6-T04 if not already decided.

---

## S6-T01 — Product API

**Status:** NOT_STARTED

### Objective

CRUD (or documented subset) for products via FastAPI application/domain/repository.

### Dependencies

S5-T03, S5-T02.

### Requirements

Thin routers. Schema fields beyond name/slug/description/images: **TBD** — start minimal.

### Implementation scope

Product domain, SQL repo, API, migrations.

### Expected files/modules

- Product tables/migrations
- Product repository + services
- Product routers

### Acceptance criteria

- Create/read/list (write set as documented)
- Validation errors use S5 error model
- No UI required in this task

### Testing requirements

API tests + repository tests.

### Definition of Done

Product API documented in README or `docs/`.

---

## S6-T02 — Category API

**Status:** NOT_STARTED

### Objective

Category persistence and API; product–category relationship as decided (one category vs many: **TBD**, pick minimal and ADR if many-to-many).

### Dependencies

S6-T01 or parallel after S5; prefer after product table exists if FK required.

### Requirements

Slug uniqueness. Taxonomy depth **TBD** (start flat unless documented).

### Implementation scope

Category domain, repo, API, migration.

### Expected files/modules

- Category API + migration

### Acceptance criteria

- List/get/create as documented
- Unknown id/slug 404

### Testing requirements

API tests.

### Definition of Done

Category API complete.

---

## S6-T03 — UOM API

**Status:** NOT_STARTED

### Objective

Units of measure as a first-class entity (e.g. piece, set). Business UOM list **TBD**.

### Dependencies

S5-T03.

### Requirements

Do not invent industry UOMs beyond a small seed set marked placeholder.

### Implementation scope

UOM table, API, seed.

### Expected files/modules

- UOM repository + router
- Migration + seed

### Acceptance criteria

- List UOM
- Products may reference UOM if product schema includes it (else document follow-up)

### Testing requirements

API tests.

### Definition of Done

UOM API complete.

---

## S6-T04 — Admin Shell

**Status:** NOT_STARTED

### Objective

Admin application shell (routing, layout). Auth may still be TBD — must not be production-public without a documented temporary guard.

### Dependencies

S5-T01. ADR for admin location.

### Requirements

Write ADR if admin lives in `frontend/` vs elsewhere. Not indexable (robots/noindex).

### Implementation scope

Admin layout + dashboard placeholder. ADR.

### Expected files/modules

- ADR
- Admin layout routes
- `docs/requirements/ADMIN_REQUIREMENTS.md` updated

### Acceptance criteria

- Shell renders
- noindex/robots disallow documented
- No full RBAC required yet (Sprint 8) but risk documented

### Testing requirements

Build; smoke render.

### Definition of Done

Shell + ADR.

---

## S6-T05 — Admin Products Module

**Status:** NOT_STARTED

### Objective

Admin UI to list/create/edit products via the Product API.

### Dependencies

S6-T01, S6-T04.

### Requirements

Reuse API; do not duplicate domain rules in the form beyond validation UX.

### Implementation scope

Admin product screens.

### Expected files/modules

- Admin product list/form pages
- API client for admin

### Acceptance criteria

- Admin can create and edit a product that appears via API
- Storefront HTTP repo can read it when wired

### Testing requirements

As feasible: API still green; component tests TBD.

### Definition of Done

Products admin usable locally.

---

## S6-T06 — Admin Categories Module

**Status:** NOT_STARTED

### Objective

Admin UI for categories.

### Dependencies

S6-T02, S6-T04.

### Requirements

Same as products admin.

### Implementation scope

Category admin screens.

### Expected files/modules

- Admin category pages

### Acceptance criteria

- CRUD/list as API allows

### Testing requirements

API tests remain green.

### Definition of Done

Categories admin usable.

---

## S6-T07 — Admin UOM Module

**Status:** NOT_STARTED

### Objective

Admin UI for UOM.

### Dependencies

S6-T03, S6-T04.

### Requirements

Simple list/edit.

### Implementation scope

UOM admin screens.

### Expected files/modules

- Admin UOM pages

### Acceptance criteria

- UOM seed visible and editable as documented

### Testing requirements

API tests remain green.

### Definition of Done

UOM admin usable.

---

## S6-T08 — Admin Media Placeholder

**Status:** NOT_STARTED

### Objective

Decide image upload approach (**TBD**: local disk vs object storage). Implement a minimal placeholder (URL field) if upload is deferred; do not fake a CDN.

### Dependencies

S6-T05.

### Requirements

Mark TBD for production media. No secrets.

### Implementation scope

Either URL-only image fields or a documented stub uploader.

### Expected files/modules

- Product image field handling
- Decision note or ADR

### Acceptance criteria

- Products can show an image URL on storefront
- Production storage vendor not silently chosen

### Testing requirements

As applicable.

### Definition of Done

Media approach documented; minimal path works.
