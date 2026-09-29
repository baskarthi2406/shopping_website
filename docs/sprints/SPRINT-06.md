# Sprint 6 — Production Backend Foundation

| Field | Value |
|-------|-------|
| Sprint ID | S6 |
| Phase | Phase 2 — Production Backend |
| Objective | Build the production Mini Mystiq catalog API and PostgreSQL persistence behind the existing S4 contracts, without changing storefront behavior or SEO, and prepare provider-independent seams for Sprint 7 |
| Status | **PLANNED — AWAITING APPROVAL** (S6-T01 planning completed; no implementation task is approved) |
| Dependencies | Sprint 5 completed (Track A; S5-T08 review, commit `5525b68`) |
| Task IDs | S6-T01 (planning, completed) · proposed S6-T02 … S6-T10 |

**Only explicitly requested tasks are authorized.** Every proposed task below
stays `PROPOSED` until a human approves it. Approval must be recorded in this
file, `SPRINT_STATUS.md`, and `CURRENT_TASK.md` before the task becomes
`IN_PROGRESS`. Approval gates are listed in §7.

## Task ID convention

- **S6-T01** is this planning task. It changes documents only.
- **S6-T02 … S6-T10** are the proposed execution order. IDs are reserved; a
  rejected or deferred task keeps its ID, which is not reused.
- Each task uses branch `s6-tNN-short-name` from the previous task's HEAD
  unless a human instructs otherwise (S5 tasks stayed on the checked-out branch
  because switching was prohibited). Workflow: PLAN → IMPLEMENT → TEST →
  REVIEW → DOCUMENT → UPDATE STATUS → COMMIT → STOP. No push or merge without
  explicit instruction.

---

## 1. Planning inputs (verified in S6-T01)

**Repository state**

- Branch `s5-t01-sprint-5-planning`, HEAD `5525b68` (S5-T08 review). Working
  tree clean except ignored `frontend/.next` output. Nothing pushed;
  `origin/main` and local `main` are still `d31f07a` (Q11 / D12).
- `backend/` contains only `README.md`. No Python package, dependency
  manifest, database driver, ORM, migration, Dockerfile, or CI workflow exists
  anywhere in the repository. There is no root `.gitignore`;
  `frontend/.gitignore` covers the frontend only.
- Local toolchain observed on the development machine (not a project
  decision): Python 3.14.6, Docker 29.7.2, Node 24.19.0. `psql` is not
  installed.

**Accepted architecture**

- ADR 0003: FastAPI + PostgreSQL modular monolith (one process, one database,
  modules with domain/application/infrastructure).
- ADR 0004: storefront swaps repositories behind interfaces, no UI rewrite.
- ADR 0005: Mini Mystiq owns the storefront contract; dummy and Zoho DTOs stay
  in infrastructure behind mappers; IDs and SEO slugs are separate identities.
- `docs/architecture/STOREFRONT_CONTRACTS.md`: authoritative field semantics
  and invariants (nullable SKU/UOM/pricing/inventory, `null` ≠ `0`, generic
  variant attributes, `data`/`error` envelopes, one-based page pagination).

**Current catalog implementation (frontend)**

- Domain: `frontend/domain/catalog/` — `Category`, `ProductSummary`,
  `Product`, `ProductVariant`, `Pricing`/`Money` (major-unit `number` +
  3-letter currency), `Inventory` (nullable quantities + `unknown` /
  `in_stock` / `out_of_stock`), `ProductStatus` (`active`/`inactive`), `Uom`.
- Ports: `ProductRepository` (`getById`, `getBySlug`, `list`,
  `listByCategorySlug`, `listFeatured`), `CategoryRepository` (`getById`,
  `getBySlug`, `list`), `UomRepository`.
- Dummy API (Next.js route handlers): `GET /api/categories`,
  `GET /api/products?page&pageSize` (defaults 1/12; unknown, duplicate, or
  malformed params → 400 `invalid_request`), `GET /api/products/{slug}`
  (404 `not_found`, 400 for invalid slug). Errors map
  `invalid_request`→400, `not_found`→404, `temporarily_unavailable`→500.
- Storefront reads through `createCatalogApiClient(dispatchCatalogApi)`
  (`config/catalog.ts`); dispatch is **in-process**, not network fetch.
  Sitemap and the dummy handlers bind to `config/catalog-source.ts` (static
  repositories).
- Data: 12 approved products with `sku`, `uom`, `pricing`, `inventory` all
  `null` and `variants: []`; category tree from approved records; UOM records
  empty. `HttpProductRepository.listFeatured()` returns `[]`.
- Tests: 59 Vitest files / 335 tests; `test:http` 18 tests (manual, TD-006).

**Relevant technical debt:** TD-002 (category listing scans the whole
catalog), TD-003 (images limited to local `public/` paths), TD-004 (no
inventory location model), TD-005 (no source for provider SEO slugs), TD-006
(`test:http` not in CI), TD-008 (API client has no timeout/retry/caching),
TD-009 (menu order relies on record order), TD-010 (Zoho allowance
unverified), TD-011 (homepage service claims).

## 2. Issues found during inspection (recorded, not resolved)

| # | Issue | Evidence | Handling |
|---|-------|----------|----------|
| I1 | **Data ownership contradiction.** PostgreSQL is described as the “system of record for catalog, UOM, inventory…”, while Sprint 7 plans Zoho POS as the product/price/stock source. No document says which system owns which field. | `BACKEND_ARCHITECTURE.md` (PostgreSQL boundary); `SPRINT-07.md` | Decision D1; ADR in S6-T02 |
| I2 | **Stale “Sprint 5” references** for ORM, migrations, error model, versioning, and repository-test tooling. Sprint 5 did not (and was not scoped to) decide them. | `TECH_STACK.md` (Migrations/ORM “Sprint 5”); `PROJECT_DEVELOPMENT_RULES.md` §15–17; `.cursor/rules/testing.mdc` (“per Sprint 5 tooling”); `BACKEND_ARCHITECTURE.md` Testing | S6-T02 doc sync. Edits to the binding rules file need explicit approval |
| I3 | Stale code comment: “S4-T11 will move navigation onto the public category API” (S4-T11 is done). | `frontend/config/catalog-source.ts` | Record only; no code change in planning |
| I4 | Root README status section says Sprint 4 in progress. | `README.md` | Synced in this task |
| I5 | No persistent ordering field for categories, product-category listings, images, or variant attributes; order is record order (TD-009). A database does not preserve insertion order. | Domain types, TD-009 | Persistence needs internal position columns (S6-T05); public contract unchanged |
| I6 | “Featured” products have no data source (`listFeatured` returns `[]` over HTTP). | `http-product-repository.ts` | Out of scope; not modelled |
| I7 | Provider-hosted image URLs are not supported by the contract or `next.config.ts`. | TD-003 | Out of scope; imported images stay local `public/` paths |

## 3. Sprint objectives and measurable acceptance criteria

**Objectives**

1. Record the backend decisions (data ownership and provenance, toolchain and
   persistence, production API contract) as accepted ADRs before code.
2. Scaffold one FastAPI modular-monolith application with configuration,
   health, error envelope, logging, and tests.
3. Implement the catalog module (domain, ports, use cases) with the same
   invariants as `STOREFRONT_CONTRACTS.md`.
4. Create the PostgreSQL schema through migrations, with explicit provenance
   for commercial data and no invented values.
5. Serve the three catalog read endpoints with responses identical to the
   dummy API for the same data.
6. Provide an opt-in storefront adapter to the production API, with the
   storefront default unchanged (gated; may be deferred).

**Sprint acceptance criteria**

| # | Criterion | How measured |
|---|-----------|--------------|
| A1 | ADRs for D1–D3 are `Accepted` before any Python code is committed | ADR status lines; commit order |
| A2 | Backend unit, HTTP, and repository-integration suites pass | Commands documented in `backend/README.md` |
| A3 | Migrations apply to an empty database and roll back to empty | Migration test in the integration suite |
| A4 | **Contract parity:** for the imported catalog, the production API returns JSON equal to the dummy API for: the category tree; every product page at `pageSize` 12 and one other size; every product slug; one unknown slug (404); one invalid slug (400); an unsupported query parameter (400) | Parity test against recorded dummy responses |
| A5 | After import, every product and variant has `sku`, `uom`, `pricing`, and `inventory` equal to `null`; no variant rows exist | Integration test and SQL assertion |
| A6 | No Zoho code, SDK, dependency, credential, environment variable, or network call exists | Source and manifest search in S6-T10 |
| A7 | No secret is committed; `.env.example` files contain placeholders only | Review in S6-T10 |
| A8 | Storefront default behavior unchanged: `npm test`, typecheck, lint, build pass; `test:http` 18/18; sitemap 67 URLs; PDP JSON-LD unchanged; no `offers` | Frontend checks + production smoke |
| A9 | No cart, checkout, payment, order, account, or admin endpoint exists | Route listing / OpenAPI review |

## 4. Architecture decisions requiring ADRs (drafted in S6-T02)

Options below are inputs for the ADRs, not decisions. Recommendations are
marked and still require acceptance.

### ADR 0006 (proposed) — Data ownership and provenance (D1)

- **Question:** which system is authoritative for each field once Zoho
  exists?
- **Proposed split (recommendation, unapproved):**
  - Mini Mystiq (PostgreSQL) owns storefront identity and merchandising: IDs,
    SEO slugs, category tree and order, display names/descriptions (unless the
    business decides Zoho names win), images, publication status.
  - The POS provider owns commercial facts: SKU, UOM, price, compare-at price,
    stock quantities. PostgreSQL stores **snapshots** of those facts with
    provenance, not independently edited values.
- **Provenance states** (persistence-level; public contract unchanged):

  | State | Meaning | Public value |
  |-------|---------|--------------|
  | `verified` | Supplied by an authoritative source; source and observation time recorded; within the freshness policy | The value |
  | `missing` | The authoritative source was consulted and supplied no value (e.g. no price set) | `null` |
  | `unknown` | No authoritative source has supplied this field (all current data) | `null` |
  | `stale` | Was verified, but is older than the freshness threshold | Price: TBD (Q-S6-4). Inventory: treated as unknown (`null` quantities / status `unknown`); never implies availability |

- **Rules to carry into code:** an empty table or absent provider record is
  `unknown`, not “unavailable” or “out of stock”; `null` is never stored or
  emitted as `0`; a variant never reads parent pricing or inventory; freshness
  threshold is a business decision (default: no staleness logic until
  approved, so all current data remains `unknown`).
- **Open:** whether to expose provenance/`asOf` in the public contract
  (contract change; default **no**).

### ADR 0007 (proposed) — Backend toolchain and persistence (D2)

Each item needs an explicit choice; versions are verified at install time,
not assumed here.

| Concern | Options | Recommendation (unapproved) |
|---------|---------|-----------------------------|
| Python version | 3.12 / 3.13 / 3.14 (local is 3.14.6); must match future host | Pin one supported minor in `pyproject.toml`; host TBD |
| Package/env manager | pip + venv; uv; Poetry | uv or pip+venv with a lockfile |
| Validation | Pydantic v2 (bundled with FastAPI) | Pydantic for HTTP DTOs only, not domain |
| SQL layer | SQLAlchemy 2 Core; SQLAlchemy ORM; SQLModel; raw psycopg | SQLAlchemy 2 (Core or ORM) confined to infrastructure |
| Migrations | Alembic; raw SQL files | Alembic |
| Driver | psycopg 3; asyncpg | psycopg 3 |
| Sync vs async | sync handlers; async end-to-end | Decide once, document; do not mix |
| Tests | pytest + HTTPX/TestClient | pytest |
| DB for tests | Docker Postgres (compose); Testcontainers; shared local install | Docker Compose Postgres for dev and integration tests |
| Lint/format/types | Ruff; mypy or Pyright | Ruff + one type checker |
| Money storage | `NUMERIC(p,s)` + `CHAR(3)` currency; integer minor units | `NUMERIC` + currency; API still emits the S4 major-unit number. Precision/scale depends on Q9 |

### ADR 0008 (proposed) — Production catalog API contract (D3)

- URL prefix/versioning: keep the dummy paths (`/api/categories`, …) for
  drop-in parity, or add `/api/v1/…` (then the storefront adapter maps
  paths). `/api/v1` is only a prior proposal.
- Status mapping: reuse the dummy mapping (`invalid_request` 400,
  `not_found` 404, `temporarily_unavailable` 500/503 — pick one). FastAPI's
  default 422 validation response must be mapped to the S4 `invalid_request`
  envelope.
- Pagination: unchanged (one-based `page`, `pageSize`, default 12; max page
  size TBD).
- **TD-002:** optional additive category filter on the product collection
  (`?category=slug` or id) and descendant semantics (open since S4-T01). If
  deferred, the storefront keeps scanning (acceptable for 12 products).
- Topology: same origin behind a proxy, or a separate API origin (then CORS
  and a server-only base URL). The storefront calls the API from the server
  only; browsers never call it directly unless decided.
- OpenAPI is documentation only; `STOREFRONT_CONTRACTS.md` stays the
  authoritative contract.
- Health endpoint path(s) and whether readiness checks the database.

## 5. Proposed schema outline (input to S6-T05; final shape per ADRs)

Conceptual only; column types and names are settled in S6-T05. Nothing here
authorizes new public fields.

- `categories` — id, slug (unique), name, parent_id (FK, nullable),
  visibility, show_in_menu, description (nullable), image (nullable),
  **position** (internal ordering, I5/TD-009).
- `products` — id, slug (unique), name, description, status, sku (nullable),
  uom_code (nullable FK).
- `product_images` — product_id, position, src, alt.
- `product_categories` — product_id, category_id, position.
- `product_variants` — id, product_id, sku (nullable), status, position.
- `variant_attributes` — variant_id, position, name, value; uniqueness of
  normalized name per variant; combination uniqueness per product enforced in
  the application (and by constraint where practical).
- `uoms` — code, label (empty; no invented units).
- `price_snapshots` — owner (product **or** variant, exactly one), amount,
  currency, compare_at_amount (nullable), **source**, **source_ref**
  (nullable), **observed_at**, recorded_at. No row = `unknown`.
- `inventory_snapshots` — owner (product **or** variant), stock_on_hand,
  available_to_sell, reserved (all nullable), status, **source**,
  **source_ref**, **observed_at**, recorded_at. No row = `unknown`.
- CHECK constraints mirror contract invariants: non-negative amounts and
  quantities, 3-letter uppercase currency, compare-at ≥ price with same
  currency, reserved/available ≤ on-hand, status consistent with known
  sellable quantity.
- Not modelled: locations (TD-004), provider IDs mapping table (Sprint 7),
  carts, orders, customers, users, audit.

## 6. Task specifications

Common requirements for every implementation task:

- Backend checks (once S6-T03 exists): lint, type check, unit tests; plus the
  integration suite from S6-T05 on, and HTTP tests from S6-T03 on. Commands
  are documented in `backend/README.md`.
- Frontend checks whenever frontend files change: `npm test`,
  `npm run typecheck`, `npm run lint`, `npm run build`, then
  `npm run test:http`.
- No CI exists (TD-006); all suites run manually and results are recorded in
  this file.
- Never call real Zoho or other external services; no credentials in Git.
- Update `CURRENT_TASK.md`, `PROJECT_STATUS.md`, `SPRINT_STATUS.md`, this
  file, and `README.md` status if stale. Commit only task files with the
  task's message. Do not push. **STOP.**

---

### S6-T01 — Sprint 6 Planning

**Status:** COMPLETED

Documentation only: this file, status documents, `SPRINT-07.md` readiness
pointer, and the README status sync. No application code, packages,
contracts, or fixtures changed. Commit `docs(s6): plan sprint 6`.

---

### S6-T02 — Backend Architecture Decisions (ADRs)

**Status:** PROPOSED — awaiting approval

**Objective:** Draft ADRs 0006–0008 (§4) and synchronize stale backend
documentation, so implementation starts from accepted decisions.

**Scope:** ADR drafts with options, recommendation, consequences; update
`docs/decisions/README.md`, `TECH_STACK.md`, `BACKEND_ARCHITECTURE.md`
(resolve I1 wording per ADR 0006; fix I2); propose (not apply without
approval) wording changes to `PROJECT_DEVELOPMENT_RULES.md` §15–17 and
`.cursor/rules/testing.mdc`.

**Exclusions:** no code, packages, schema files, or contract changes.

**Dependencies:** S6-T01 approved. Business input for D1 and Q-S6-4.

**Assumptions:** ADR status stays `Proposed` until a human accepts each ADR.

**Risks:** decisions accepted without business input on ownership (D1) would
be expensive to reverse after data exists.

**Acceptance criteria:** three ADRs exist with status, context, decision,
consequences, date; every open question is listed as TBD; docs no longer
reference “Sprint 5” for backend decisions.

**Tests:** documentation consistency review only.

**Definition of done:** ADRs accepted by a human (gate G1) and recorded in
status files.

**Git/stop:** branch `s6-t02-backend-adrs`; commit
`docs(s6): add backend architecture decisions`; STOP.

---

### S6-T03 — Backend Skeleton and Operational Baseline

**Status:** PROPOSED — requires G1 (ADRs 0006–0008 accepted)

**Objective:** A runnable FastAPI application in `backend/` with the accepted
toolchain and no database.

**Scope:**

- Project manifest and lockfile per ADR 0007; module layout per
  `BACKEND_ARCHITECTURE.md` (catalog module only; no empty ordering/identity
  modules).
- App factory; typed settings from environment (fails fast on invalid config
  without printing secret values); `backend/.env.example` with placeholders;
  `backend/.gitignore` (virtualenv, caches, `.env`).
- Health endpoint (liveness) per ADR 0008.
- Error handling: S4 `error` envelope for 404, validation (422 → 400
  `invalid_request`), and unhandled exceptions (sanitized
  `temporarily_unavailable`, stack traces only in logs).
- Logging: stdlib logging, request ID, method/path/status/duration; no
  request bodies, secrets, or PII.
- Lint, type-check, and test tooling; `backend/README.md` run instructions.

**Exclusions:** database, catalog endpoints, auth, CORS (unless ADR 0008
requires it), Docker image, deployment files, CI.

**Dependencies:** S6-T02 accepted.

**Assumptions:** the chosen Python version is available locally.

**Risks:** toolchain drift between developer machine and future host
(hosting TBD).

**Acceptance criteria:** app starts locally; health returns 200; unknown
route returns the S4 `not_found` envelope; invalid config fails with a clear
message and no secret echo.

**Tests:** health; unknown-route envelope; validation-error mapping;
unhandled-error sanitization; settings validation; log line excludes a
sample secret.

**Documentation:** `backend/README.md`, `BACKEND_ARCHITECTURE.md`,
`TECH_STACK.md`.

**Definition of done:** backend lint/type/tests pass; frontend untouched.

**Git/stop:** branch `s6-t03-backend-skeleton`; commit
`feat(s6): add backend skeleton`; STOP.

---

### S6-T04 — Catalog Domain, Ports, and Use Cases (Backend)

**Status:** PROPOSED — requires S6-T03

**Objective:** Framework-free catalog module mirroring the S4 contract and
invariants, with repository interfaces and read use cases.

**Scope:** domain types and validation equivalent to
`STOREFRONT_CONTRACTS.md` (category tree, product summary/detail, variants
with generic attributes, pricing, inventory, statuses); repository ports
(category tree, product page, product by slug; optional category filter only
if ADR 0008 adopts it); use cases `get_category_tree`,
`get_product_collection`, `get_product_detail` with the same pagination and
slug rules as the dummy API; provenance handling per ADR 0006 applied when
mapping snapshots to public values; in-memory fake repositories for tests.

**Exclusions:** SQL, FastAPI imports in domain/application, purchasability,
cart, pricing display, Zoho types.

**Dependencies:** S6-T03.

**Assumptions:** the TypeScript frontend domain remains the storefront's own;
no shared cross-language code generation.

**Risks:** the two implementations drift. Mitigated by the parity test in
S6-T08.

**Acceptance criteria:** every invariant listed in `STOREFRONT_CONTRACTS.md`
has a backend test; `null` never becomes `0`; variant values never fall back
to the parent; `unknown`/`stale` inventory never yields `in_stock`.

**Tests:** domain invariant tests; use-case tests with fakes (empty catalog,
page beyond end, invalid page/pageSize, unknown slug, invalid slug);
provenance-state mapping tests.

**Definition of done:** tests pass; import-boundary check (domain has no
FastAPI/SQLAlchemy imports).

**Git/stop:** branch `s6-t04-catalog-domain`; commit
`feat(s6): add backend catalog domain`; STOP.

---

### S6-T05 — PostgreSQL Schema and Migrations

**Status:** PROPOSED — requires S6-T04 and ADR 0007 database decisions

**Objective:** Versioned schema for the catalog (§5) with a reproducible
local database.

**Scope:** local PostgreSQL for development/tests per ADR 0007 (e.g. Docker
Compose file with non-secret local defaults); initial migration; constraints
mirroring invariants; internal `position` columns; provenance columns;
integration-test harness that creates and drops a test database.

**Exclusions:** seed data, commercial values, provider ID mapping, carts,
orders, users, audit, production database provisioning.

**Dependencies:** S6-T04.

**Assumptions:** Docker is available to developers (it is on the current
machine).

**Risks:** schema locks in ownership assumptions (D1); money precision
depends on Q9 (use a scale that does not round any valid source value, or
defer the constraint).

**Acceptance criteria:** upgrade from empty and downgrade to empty succeed;
constraint violations (negative amount, lowercase currency, compare-at below
price, reserved > on-hand, contradictory status, product+variant both set on
a snapshot) are rejected by the database.

**Tests:** migration up/down; one test per constraint.

**Definition of done:** integration suite passes against local PostgreSQL;
run instructions documented.

**Git/stop:** branch `s6-t05-postgres-schema`; commit
`feat(s6): add catalog schema and migrations`; STOP.

---

### S6-T06 — PostgreSQL Catalog Repositories

**Status:** PROPOSED — requires S6-T05

**Objective:** Implement the S6-T04 ports on PostgreSQL.

**Scope:** repositories and row→domain mappers; ordering by `position`;
tree assembly; paginated product query with total; detail with variants,
attributes, images, and latest snapshots; provenance → public value mapping
per ADR 0006; sanitized infrastructure errors → `temporarily_unavailable`.

**Exclusions:** write APIs, caching layer, Zoho, category filter unless
ADR 0008 adopted it.

**Dependencies:** S6-T05.

**Risks:** N+1 queries on detail/list; keep query count bounded and tested.

**Acceptance criteria:** repository results equal the in-memory fakes for the
same data; empty database returns an empty tree / empty page (success), not
errors; missing snapshots yield `null`; variant without snapshots yields
`null` pricing/inventory even when the parent has values.

**Tests:** integration tests per port method, ordering, pagination
boundaries, null/zero distinction, no-parent-fallback, database-down
behavior.

**Git/stop:** branch `s6-t06-postgres-repositories`; commit
`feat(s6): add postgres catalog repositories`; STOP.

---

### S6-T07 — Approved Catalog Content Import

**Status:** PROPOSED — requires S6-T06 and gate G3 (content approval)

**Objective:** Load the currently approved storefront catalog content into
PostgreSQL without inventing commercial data.

**Scope:** an idempotent command that imports categories and products from
the **public S4 contract envelopes** (the dummy API responses: category tree,
all product pages, each product detail) — using the contract rather than
reading TypeScript fixtures. Imports identity, slugs, names, descriptions,
images (local `public/` paths, TD-003), category links, order, status. SKU,
UOM, pricing, inventory remain absent (`unknown`); no variants are created.
Recorded envelopes are committed as test fixtures for S6-T08 parity.

**Exclusions:** price, stock, SKU, UOM, variants, Zoho data, admin editing.

**Dependencies:** S6-T06; decision Q-S6-6 (is the current 12-product content
approved as production seed content?).

**Risks:** imported content is dev fixture data if Q-S6-6 is not approved;
then the import is labelled development-only.

**Acceptance criteria:** A5; re-running the import produces no changes;
category and image order preserved.

**Tests:** import from recorded envelopes into a test database; idempotency;
null commercial fields; rejection of malformed envelopes.

**Git/stop:** branch `s6-t07-catalog-import`; commit
`feat(s6): add approved catalog import`; STOP.

---

### S6-T08 — Production Catalog Read API

**Status:** PROPOSED — requires S6-T07

**Objective:** Serve the three catalog endpoints from PostgreSQL with the S4
contract.

**Scope:** thin FastAPI routers for category tree, product collection, and
product detail per ADR 0008; query validation identical to the dummy API
(positive safe integers, no duplicates, no unsupported parameters); status
mapping; OpenAPI metadata; readiness check if ADR 0008 requires it.

**Exclusions:** writes, auth, admin, cart/order/payment routes, caching
headers beyond what ADR 0008 specifies, storefront changes.

**Dependencies:** S6-T07.

**Risks:** subtle JSON differences (key order is irrelevant; `null` vs
omitted fields and number formatting are not).

**Acceptance criteria:** A4 parity; A9; routers import no SQL/ORM modules.

**Tests:** HTTP tests for every status path; parity tests against recorded
dummy envelopes; database-unavailable → sanitized error.

**Documentation:** `STOREFRONT_CONTRACTS.md` (production implementation
section), `backend/README.md`.

**Git/stop:** branch `s6-t08-catalog-api`; commit
`feat(s6): add production catalog api`; STOP.

---

### S6-T09 — Storefront Production API Adapter (opt-in)

**Status:** PROPOSED — requires S6-T08 and gate G4 (topology decision);
may be deferred

**Objective:** Let the storefront read from the production API through the
existing `CatalogApiDispatch` seam, off by default.

**Scope:** a `fetch`-based dispatch selected by a server-only environment
variable (name per ADR 0008); unset → existing in-process dummy dispatch
(default, unchanged); request timeout and bounded failure behavior (TD-008;
no unbounded retries); sanitized errors reuse the existing catalog error UI;
decision recorded on whether the sitemap follows the same source.

**Exclusions:** removing the dummy API; changing pages, components, SEO
output, or contracts; client-side (browser) API calls.

**Dependencies:** S6-T08.

**Risks:** SEO regressions or slower rendering when enabled; production
domain still TBD (D8), so canonical origin is unchanged.

**Acceptance criteria:** A8 with the default configuration; with the flag
set against a local backend, the three catalog routes render identically
(manual check recorded).

**Tests:** dispatch unit tests with a fake `fetch` (success, 404, 400,
timeout, network error, malformed JSON); configuration selection tests;
`test:http` unchanged.

**Git/stop:** branch `s6-t09-storefront-api-adapter`; commit
`feat(s6): add production catalog api adapter`; STOP.

---

### S6-T10 — Sprint 6 Review

**Status:** PROPOSED — requires all approved Sprint 6 tasks completed or
recorded as deferred

**Objective:** Verify Sprint 6 against A1–A9, the ADRs, and the guardrails;
synchronize documentation.

**Scope:** full backend and frontend validation; production smoke; searches
for Zoho references, secrets, and commercial values; debt register update;
Sprint 7 readiness checklist status (§9).

**Exclusions:** new features or unrelated fixes.

**Definition of done:** Sprint 6 closed with evidence; next step recommended,
not started.

**Git/stop:** branch `s6-t10-sprint-review`; commit
`docs(s6): complete sprint 6 review`; STOP. Do not start Sprint 7.

---

## 7. Approval gates

| Gate | Before | Requires |
|------|--------|----------|
| G0 | S6-T02 | This plan approved; decision on Q11/D12 (merge Sprints 3–5 to `main` first, or keep stacking) |
| G1 | S6-T03 (any Python code or package install) | ADRs 0006–0008 accepted |
| G2 | S6-T05 | Local database approach accepted (ADR 0007); money precision approach acknowledged (Q9 still open) |
| G3 | S6-T07 | Q-S6-6: current catalog content approved for import (or labelled development-only) |
| G4 | S6-T09 | Topology/prefix accepted (ADR 0008); explicit approval to add the opt-in adapter, or defer it |

## 8. Dependencies and task order

```text
S6-T01 (done) → G0 → S6-T02 → G1 → S6-T03 → S6-T04 → G2 → S6-T05
  → S6-T06 → G3 → S6-T07 → S6-T08 → G4 → S6-T09 (optional) → S6-T10
```

No task depends on Zoho access. Business decisions affect D1 (S6-T02),
Q-S6-4 (staleness), Q-S6-6 (content import), and G4 (topology).

## 9. Sprint 7 (Zoho POS) readiness checklist

**Planning constraint:** a Zoho allowance of **7,500 API requests per month**
has been reported for this project. It is **not verified** against the real
account and must not be treated as a confirmed limit (TD-010). As arithmetic
only: 7,500/month ≈ 250/day ≈ 10/hour. Storefront page views must therefore
never trigger Zoho calls; data must be synchronized in batches into
PostgreSQL snapshots (the S6 schema supports `source`, `source_ref`,
`observed_at`).

| # | Item | Status |
|---|------|--------|
| Z1 | Actual account quota, reset period (calendar month or rolling), per-minute/day limits, what counts as a request, overage behavior | NOT VERIFIED |
| Z2 | Zoho POS API availability for this account/plan, region/data-center base URL, required scopes and permissions | NOT VERIFIED |
| Z3 | Authentication method, token lifetime, refresh-token flow, secret storage location (outside Git) | NOT VERIFIED |
| Z4 | Mapping of items / item groups / variants, SKU, unit, price, compare-at (if any), currency, stock (per location? TD-004) to the S4 contract | NOT VERIFIED |
| Z5 | Pagination model and page size; requests needed for one full catalog sync | NOT VERIFIED |
| Z6 | Request budget: full vs incremental sync (modified-since filters?), sync frequency, freshness threshold (Q-S6-4) | TBD |
| Z7 | Caching strategy: storefront reads only PostgreSQL; cache invalidation on sync | Proposed (S6 design); not implemented |
| Z8 | Bounded retries with backoff, rate limiting on our side, handling of provider 429/5xx | TBD |
| Z9 | Usage monitoring: request counter per period, alert threshold before quota | TBD |
| Z10 | Order and inventory write capabilities (if any) and whether they are ever in scope | NOT VERIFIED; out of scope until Sprint 8 decisions |
| Z11 | Stable identifiers and slug source for provider items (TD-005); image hosting (TD-003) | TBD |
| Z12 | Sandbox/test account and non-secret recorded responses for CI fakes | NOT AVAILABLE |

## 10. Open decisions (not decided by this plan)

| ID | Decision | Default until decided |
|----|----------|-----------------------|
| D1 | System of record per field (Mini Mystiq vs POS) — I1 | ADR 0006 draft; nothing implemented |
| D2 | Backend toolchain and persistence details | ADR 0007 draft |
| D3 | Production API prefix, status mapping, topology, category filter (TD-002) | ADR 0008 draft; dummy contract unchanged |
| D4 | Cart and device-local cart (Q1/Q2) | Deferred |
| D5 | Locale and currency (Q9) | Price display disabled (`priceDisplay = null`) |
| D6 | Listing-card prices (Q10) and search (Q7) | Deferred |
| D7 | Account and order tracking | Deferred (Sprint 8) |
| D8 | Production domain | TBD; `NEXT_PUBLIC_SITE_URL` falls back to localhost locally |
| D9 | Homepage claims: secure payment, free shipping, returns, COD, 24/7 support (TD-011) | Unchanged; business confirmation needed |
| D10 | Hosting and deployment target; Python version on host | TBD (Sprint 11) |
| D11 | CI vendor and whether CI is introduced before Sprint 11 (TD-006) | No CI; manual runs |
| D12 | Merge Sprints 3–5 into `main` (Q11) | No merge or push |
| Q-S6-4 | Freshness threshold for stale price/inventory; whether stale price is hidden | No staleness logic; data stays `unknown` |
| Q-S6-5 | Whether provenance/`asOf` becomes part of the public contract | No |
| Q-S6-6 | Are the 12 current products and category tree approved as production seed content? | Import labelled development-only |
| Q-S6-7 | Display names/descriptions: Mini Mystiq-owned or POS-owned after Sprint 7 | Part of D1 |
| Q-S6-8 | Descendant semantics for category listings (open since S4-T01) | Direct membership only (current behavior) |

## 11. Deferred (must not enter Sprint 6)

| Item | Target |
|------|--------|
| Zoho API calls, SDK, credentials, sync jobs | Sprint 7 (after checklist §9) |
| Cart, checkout, orders, payment, shipping, tax | Sprint 8–9, separate approval |
| Authentication, accounts, admin, RBAC, audit | Sprint 8 |
| Catalog write/admin APIs | Sprint 8 (requires auth) |
| Deployment, hosting, monitoring vendor | Sprint 11 |
| Inventory locations (TD-004), provider images (TD-003) | After Zoho verification |
| Sprint 5 Track B (S5-T05–S5-T07) | Pending Q1/Q2 |

## 12. Risks

- **Ownership reversal:** building persistence before D1 is decided could
  force schema rework. Mitigated by gate G1.
- **Two catalog implementations drift** (TypeScript dummy vs Python
  production). Mitigated by the A4 parity tests.
- **Stacked unmerged branches:** Sprint 6 would add a second codebase on top
  of unmerged Sprints 3–5 (D12).
- **No CI:** backend integration and frontend HTTP suites depend on manual
  runs (TD-006, D11).
- **Environment drift:** local Python 3.14 may not match the future host
  (D10).
- **Scope creep toward Zoho or commerce:** guarded by §11 and the A6/A9
  checks.

## Exit criteria

Approved Sprint 6 tasks are completed with evidence or recorded as deferred;
the storefront default behavior and SEO are unchanged; no invented commercial
data, Zoho calls, or commerce workflows exist. Do not start Sprint 7
automatically.
