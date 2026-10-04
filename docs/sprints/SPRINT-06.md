# Sprint 6 — Next.js Server-side Foundation

| Field | Value |
|-------|-------|
| Sprint ID | S6 |
| Phase | Phase 2 — Server-side foundation (single Next.js application) |
| Objective | Prepare provider-independent server-side foundations in the existing Next.js application (server-only isolation, catalog contract conformance, provenance rules, outbound request policy) without changing storefront behavior, SEO, or the dummy catalog API, and gate Zoho work on verified access |
| Status | **IN PROGRESS** (S6-T01, S6-T02, S6-T11–S6-T14 completed; no further task is approved) |
| Dependencies | Sprint 5 completed (Track A; S5-T08, commit `5525b68`) |
| Task IDs | S6-T01, S6-T02, S6-T11–S6-T14 (completed) · S6-T03–S6-T10 **WITHDRAWN** · proposed S6-T15, S6-T16 |

**Only explicitly requested tasks are authorized.** Proposed tasks stay
`PROPOSED` until a human approves them; approval is recorded here, in
`SPRINT_STATUS.md`, and in `CURRENT_TASK.md` first. Gates are in §6.

## Revision history

- **S6-T01** (`f8688b5`) planned a separate FastAPI + PostgreSQL backend
  (S6-T02 ADRs … S6-T10 review).
- **S6-T02** (this revision): the project owner decided to keep UI and all
  server-side functionality in Next.js. ADR 0006 supersedes ADR 0003. The
  S6-T01 task sequence is withdrawn. ID S6-T02 was reassigned by that request
  from “Backend Architecture Decisions” to this revision; S6-T03–S6-T10 keep
  their IDs as withdrawn records and are not reused.

| Withdrawn ID | Original proposal | Reason |
|--------------|-------------------|--------|
| S6-T03 | Backend skeleton (FastAPI) | No separate backend (ADR 0006) |
| S6-T04 | Backend catalog domain (Python) | Domain already exists in TypeScript |
| S6-T05 | PostgreSQL schema and migrations | No persistence requirement (ADR 0008) |
| S6-T06 | PostgreSQL repositories | Same |
| S6-T07 | Catalog content import into PostgreSQL | Same |
| S6-T08 | Production catalog API (FastAPI) | Dummy Route Handlers remain the API |
| S6-T09 | Storefront adapter to separate API | No separate API |
| S6-T10 | Sprint 6 review (old scope) | Replaced by S6-T16 |

## Task ID convention

Each task uses branch `s6-tNN-short-name` from the previous task's HEAD unless
a human instructs otherwise (S5-T02 onward and S6-T01/T02 stayed on the
checked-out branch because switching was prohibited). Workflow: PLAN →
IMPLEMENT → TEST → REVIEW → DOCUMENT → UPDATE STATUS → COMMIT → STOP. No push or
merge without explicit instruction.

---

## 1. Planning inputs (verified in S6-T02)

- Branch `s5-t01-sprint-5-planning`; S6-T01 commit `f8688b5` on top of the
  S5-T08 review `5525b68`. Working tree clean apart from ignored
  `frontend/.next`. Nothing pushed; `main` and `origin/main` at `d31f07a`.
- Stack: Next.js 16.3.0 (App Router, Turbopack), React 19.2.8, TypeScript,
  Tailwind 4, Vitest 4. Runtime dependencies: `next`, `react`, `react-dom` only.
- `backend/` holds only a README. No Python, database, provider code, secrets,
  or CI workflow exists.
- Catalog path today: pages → application use cases → `HttpProductRepository`
  / `HttpCategoryRepository` → `createCatalogApiClient(dispatchCatalogApi)` →
  **in-process** dispatch to the dummy Route Handlers → static repositories →
  approved records. No network calls. Sitemap and dummy handlers use
  `config/catalog-source.ts`.
- The API client casts envelopes without runtime validation and has no
  timeout/retry policy (TD-008); acceptable while dispatch is in-process.
- `server-only` is not a project dependency. Next.js 16.3 aliases
  `import "server-only"` to its bundled copy (`next/dist/compiled/server-only`);
  no source file uses it yet. Vitest does not apply that alias.
- `process.env` is read only in `config/site.ts` (`NEXT_PUBLIC_SITE_URL`).
- Next.js 16.3 bundled docs: `use cache` is in-memory per instance (not shared
  in serverless); remote cache handlers do not persist across deploys;
  `unstable_cache` / `fetch` cache are the documented cross-deploy options.
  Relevant to request budgeting (ADR 0008 P3).

## 2. Target architecture (summary)

```text
Browser ──(HTML, view models only; no credentials)──┐
                                                     ▼
Next.js application (ADR 0006)
  app/ pages (Server Components)  ·  app/api Route Handlers (dummy API)
        → application use cases (domain rules, provenance rules)
          → repository ports
            → implementation selected in config/ (server-only)
               today: HTTP repository → in-process dummy dispatch → static data
               later (Sprint 7): server-only Zoho adapter → cache/snapshot
                                  refreshed under a request budget (ADR 0009)
```

- No separate backend; no database selected (ADR 0008).
- Client Components never import `config/`, `infrastructure/`, or provider code.
- No page render or public Route Handler calls Zoho per request.
- The dummy API and its contract stay the default until an approved task
  replaces or adapts them.

## 3. Issues found (recorded, not resolved)

| # | Issue | Handling |
|---|-------|----------|
| I1 | Data ownership was contradictory (PostgreSQL vs Zoho as system of record) | `BACKEND_ARCHITECTURE.md` rewritten; per-field ownership open in ADR 0007 |
| I2 | Stale “Sprint 5” references for backend tooling decisions | Fixed in `TECH_STACK.md`, `PROJECT_DEVELOPMENT_RULES.md` §15–17, `.cursor/rules/testing.mdc` |
| I3 | Stale comment “S4-T11 will move navigation…” in `config/catalog-source.ts` | Recorded; code unchanged (documentation-only task) |
| I4 | Public `/api/*` routes: if later backed by provider data, each request could spend quota | ADR 0006 §6 and ADR 0009: cache/snapshot only; production exposure open (D-API) |
| I5 | Vitest cannot resolve `server-only` without the package or an alias | Resolved in S6-T11: Vitest alias to Next's bundled `empty.js`; no package added |
| I6 | Historical records (SPRINT-00–02, `BACKEND_API_AUDIT.md`, the non-goals list in `FUNCTIONAL_REQUIREMENTS.md`) still mention FastAPI/PostgreSQL | Left unchanged as history |

## 4. Sprint objectives and acceptance criteria

**Objectives**

1. Enforce and test that secrets and server modules cannot reach browser code.
2. Freeze the S4 catalog contract in a reusable conformance suite that any
   future implementation (including Zoho-backed) must pass.
3. Implement provenance rules (missing / unknown / stale) as pure,
   tested application logic, not yet wired to any provider.
4. Provide a provider-independent outbound request policy (timeout, bounded
   retry, concurrency, budget counting, sanitized errors), not yet used by
   any provider.
5. Verify Zoho access and capabilities only if the business supplies access
   and approves it; otherwise record the checklist as pending.

**Acceptance criteria**

| # | Criterion | How measured |
|---|-----------|--------------|
| A1 | Storefront unchanged: `npm test`, typecheck, lint, build pass; `test:http` passes; sitemap 67 URLs; PDP JSON-LD unchanged with no `offers`; “Price not available” still shown | Checks + production smoke |
| A2 | No `"use client"` module (transitively) imports `config/`, `infrastructure/`, or a `server-only` module | Import-graph test |
| A3 | A canary server-only environment value set at build time does not appear in any client bundle under `.next/static` | Build-output test |
| A4 | Conformance suite passes against the dummy dispatch; golden envelopes match current dummy output | Vitest |
| A5 | Provenance tests: missing/unknown → `null`; stale inventory → status `unknown`, `null` quantities; no staleness when the threshold is unset; variant values never fall back to parent | Vitest |
| A6 | Outbound policy tests: timeout, bounded retries, `Retry-After`, no retry on 4xx auth/validation, concurrency limit, budget counter increments per attempt, secrets/tokens absent from logs and errors | Vitest with fake `fetch`/clock |
| A7 | No Zoho code, SDK, credential, environment variable, or network call; no database/ORM/KV dependency; no new runtime dependency without an approved note | Manifest + source search in S6-T16 |
| A8 | No cart, checkout, order, payment, shipping, account, or admin code | Review in S6-T16 |

## 5. Task specifications

Common requirements for implementation tasks:

- Checks: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`,
  then `npm run test:http` (manual; TD-006).
- Only Vitest (existing). Adding any package needs a justification recorded in
  the task and approval.
- No real Zoho or external calls in tests. No secrets in Git.
- Update `CURRENT_TASK.md`, `PROJECT_STATUS.md`, `SPRINT_STATUS.md`, this
  file, and README status. Commit only task files. Do not push. **STOP.**

---

### S6-T01 — Sprint 6 Planning

**Status:** COMPLETED (`f8688b5`); its task sequence was withdrawn by S6-T02.

---

### S6-T02 — Revise Sprint 6 Architecture for a Next.js-only Application

**Status:** COMPLETED (documentation only)

- ADR 0006 (Accepted): Next.js-only application; supersedes ADR 0003.
- ADR 0007 (Proposed): field-level ownership (open) and provenance states.
- ADR 0008 (Proposed): no persistent store in Sprint 6; PostgreSQL not
  selected; conditions P1–P6 that could justify storage.
- ADR 0009 (Proposed): server-side provider access policy.
- Updated architecture docs, development rules, Cursor rules, tech stack,
  README, status files, `SPRINT-07.md`, and this plan.
- No application code, dependencies, Zoho calls, merges, or pushes.

Commit `docs(s6): revise sprint 6 for nextjs-only architecture`.

---

### S6-T11 — Server-only Boundary and Secret Isolation

**Status:** COMPLETED — approved explicitly by the user (S6-T11 only)

**Objective:** Make it structurally impossible (and tested) for server
configuration, infrastructure, or secrets to reach browser bundles.

**Scope:**

- Add `import "server-only"` to server composition and infrastructure entry
  points (`config/catalog.ts`, `config/catalog-source.ts`,
  `config/catalog-api-dispatch.ts`, and infrastructure modules not meant for
  the client). Client-safe modules (e.g. `application/catalog/variant-selection.ts`)
  stay importable.
- Resolve I5: alias `server-only` in the Vitest configs to Next's bundled
  module, or add the `server-only` package; record the choice.
- Import-graph test: every `"use client"` file and its transitive imports
  exclude `config/`, `infrastructure/`, and `server-only` modules.
- Build-output test in the `test:http` suite (which already builds): build
  with a canary non-`NEXT_PUBLIC_` variable read by a server-only module and
  assert it is absent from `.next/static`.
- Document the environment-variable convention in `frontend/README.md` and
  `.env.example` (placeholders only; no Zoho variables yet).

**Exclusions:** provider code; new environment variables beyond the test
canary; changes to UI, routes, SEO, or contracts.

**Risks:** marking a module `server-only` that a client file imports breaks
the build (that is the intended guard; fix by moving logic, not by removing
the guard).

**Acceptance criteria:** A1, A2, A3.

**Tests:** import-graph test; canary build-output test; existing suites.

**Definition of done:** checks pass; convention documented.

**Git/stop:** branch `s6-t11-server-only-boundary`; commit
`feat(s6): enforce server-only boundary`; STOP.

**Result:**

- Protected with `import "server-only"`: `config/catalog.ts` (storefront
  composition root), `config/catalog-source.ts` (dummy API backing store for
  route handlers and sitemap), `config/catalog-api-dispatch.ts` (in-process
  dispatch into route handlers), and new `config/server-env.ts`
  (`readServerEnv`: rejects `NEXT_PUBLIC_*`, blank → `null`, errors never
  include values). No module reads a secret yet.
- `infrastructure/` modules were not marked: they hold no secrets or
  environment reads and are reachable only through the protected `config/`
  roots; the import-graph test separately forbids any client path into
  `infrastructure/`. `config/site.ts` / `organization.ts` are public values.
  Browser-safe application/domain modules stay unmarked (tested).
- I5 resolved: no dependency added. Next 16.3 resolves `server-only`
  natively. `vitest.config.mts` aliases it to
  `next/dist/compiled/server-only/empty.js`, the module Next uses for server
  code. This lets unit tests import server modules; it does not replace
  build verification.
- `config/server-only-boundary.test.ts` (in `npm test`): import-graph walk
  from every `"use client"` module (fails on unresolved imports; includes a
  resolver self-check).
- `npm run test:boundary` (`config/server-only-boundary.build.test.ts`,
  `vitest.build.config.mts`): real production builds.
  1. Real app with a synthetic non-public secret: build succeeds; the secret
     and two server-only literals (`http://catalog.local`, a dispatch error
     string) are absent from client artifacts, and the literals are present
     in server chunks (scan sensitivity).
  2. Isolated valid fixture: a server-only module reads the synthetic
     secret and renders a derived state; a client `NEXT_PUBLIC_` control is
     found in client files, the server marker is found in server chunks, and
     neither the secret nor the marker is in client files.
  3. Negative controls (direct and transitive client import of a server-only
     module): the build fails with Next's
     `'server-only' cannot be imported from a Client Component module`
     error naming the fixture files.

  Client artifacts scanned: `.next/static/**`, prerendered
  `.next/server/app/**/*.{html,rsc,body}`, `*client-reference-manifest.js`,
  `build-manifest.json`. Fixtures live in gitignored
  `frontend/.boundary-fixtures/` (excluded from tsconfig, ESLint, and
  `npm test`) and are deleted before and after the run; no invalid import
  exists in the real app. Synthetic values are random per run and redacted
  from output.
- Environment convention documented in `frontend/README.md`,
  `frontend/config/README.md`, `.env.example`.
- Checks: `npm test` 61 files / 343 tests; typecheck; lint; `npm run build`;
  `npm run test:http` 18/18; `npm run test:boundary` 4/4. No dependency,
  lockfile, UI, route, SEO, or contract change.

**Deviations and limitations:**

- Stayed on `s5-t01-sprint-5-planning` (branch switching prohibited).
- The build test runs as a separate `test:boundary` suite, not inside
  `test:http`: it rebuilds several apps and overwrites `.next`.
- The real app does not read the synthetic secret (no production code reads
  secrets yet, and no canary reader was added to shipped code), so the
  real-app secret scan is weak; the fixture is the meaningful positive
  control. Turbopack import traces omit pure re-export modules, so the
  transitive fixture uses a wrapper function.
- Scanning is for exact markers only; it cannot prove that derived or
  transformed secret values never leak. Server-side logging/error hygiene
  remains a review obligation (and S6-T14).
- I3 (stale comment in `config/catalog-source.ts`) left unchanged.

---

### S6-T12 — Catalog Contract Conformance Suite

**Status:** COMPLETED — approved explicitly by the user (S6-T12 only)

**Objective:** One reusable test suite that defines “compatible with the S4
catalog contract” for any `CatalogApiDispatch` implementation.

**Scope:**

- `describeCatalogContract(createDispatch)` covering: category tree envelope
  and ordering; product pagination (defaults, bounds, page beyond end, invalid,
  duplicate, and unsupported parameters → 400); detail 200/404/400; error
  envelope codes and statuses; `null` SKU/UOM/pricing/inventory preserved (not
  `0`, not omitted); `variants: []`; list responses never include variants.
- Run it against the current in-process dummy dispatch.
- Golden envelopes: record current dummy responses (committed test fixtures)
  and assert no drift.

**Exclusions:** changing the contract or the dummy API; runtime validation in
the client (a separate decision if wanted).

**Risks:** golden files must be regenerated deliberately when approved
catalog content changes; document the procedure.

**Acceptance criteria:** A1, A4.

**Tests:** the suite itself, plus a negative self-test with a deliberately
non-conforming fake dispatch.

**Git/stop:** branch `s6-t12-catalog-contract-suite`; commit
`test(s6): add catalog contract conformance suite`; STOP.

**Result:**

- `infrastructure/catalog/catalog-api-contract.ts`: 12 named checks and
  `describeCatalogApiContract(label, getDispatch)` over the existing
  `CatalogApiDispatch` seam (no catalog refactor). Checks cover category tree
  shape and determinism, product defaults, pagination consistency across page
  sizes, beyond-end, 13 invalid query forms, determinism, detail for every
  listed slug matching its summary, 404 unknown slug, 7 invalid slug forms,
  detail query rejection, and a non-empty precondition. Shapes are closed;
  entities must pass `validateProduct`.
- `config/catalog-api-dispatch.contract.test.ts`: runs the suite on the dummy
  dispatch, plus dummy-specific tests: golden identity/order, all commerce
  fields `null` with `variants: []`, `categoryIds` referential integrity,
  sitemap ↔ API path equality, and the dispatch's JSON 404 for unknown paths.
- `config/catalog-api-dispatch.golden.json`: normalized golden (category slug
  paths, hidden/unlisted slugs, product id/slug/categoryIds); no names, copy,
  prices, or stock. Regeneration: `UPDATE_CATALOG_GOLDEN=1`; verified that a
  reordered category fails with a readable diff.
- `infrastructure/catalog/catalog-api-contract.test.ts`: the suite passes on
  an independent synthetic fake (synthetic price in `XTS`, the ISO test
  currency, and arbitrary inventory, clearly not business data), and 19
  broken variants (at least one per check) are each reported with the
  expected message.
- Verified contract and ambiguities documented in
  `docs/architecture/STOREFRONT_CONTRACTS.md` → “Catalog API conformance
  suite (S6-T12)”.
- Checks: `npm test` 63 files / 392 tests; typecheck; lint; `npm run build`;
  `npm run test:http` 18/18. No runtime, UI, route, SEO, contract, data, or
  dependency change.

**Deviations and limitations:**

- Stayed on `s5-t01-sprint-5-planning` (branch switching prohibited).
- Golden envelopes are normalized rather than full responses, to avoid
  brittle copies of fixture content; full envelopes stay pinned by existing
  handler tests.
- Suite runs in-process through the dispatch seam, not over HTTP; `500`
  mapping is left to handler tests.
- Ambiguities (category query parameters ignored, no max `pageSize`,
  leading zeros, detail error precedence, undefined list sort key,
  referential integrity, hidden categories in sitemap, dispatch-only 404,
  closed shapes) are recorded, not resolved.

---

### S6-T13 — Field Provenance Rules

**Status:** COMPLETED — gate G1 passed (ADR 0007 provenance accepted
2026-10-04)

**Objective:** Pure application functions that turn provider field
observations into S4 contract values with the ADR 0007 states.

**Scope:**

- Types for an observation (`verified` / `missing` / `unknown`, value,
  source, observed-at) and a freshness policy whose threshold is `null`
  (unset) by default.
- Mapping for price/compare-at, currency, SKU, UOM, inventory quantities and
  status, per product and per variant independently.
- Stale handling per ADR 0007 (inventory → `unknown`; price per the accepted
  decision, default `null`).
- Not wired into the storefront or the dummy API.

**Exclusions:** provider DTOs, persistence, public contract changes,
purchasability rule changes (S5-T02 rules consume the output unchanged).

**Acceptance criteria:** A1, A5; output always satisfies existing domain
validation (`contract-validation.ts`).

**Tests:** each state per field; threshold unset vs set; boundary at the
threshold; variant/parent independence; `null` never becomes `0`; invalid
observation rejected.

**Git/stop:** branch `s6-t13-provenance-rules`; commit
`feat(s6): add field provenance rules`; STOP.

**Result:** gate G1 passed — the project owner accepted the ADR 0007
provenance section on 2026-10-04 (stale price → `null`; future timestamps →
`unknown`, no skew tolerance; expired `missing` → `unknown`; 24-hour inclusive
freshness threshold as the S6-T13 default, since none had been set).
`application/catalog/field-provenance.ts` adds pure
`evaluateFieldProvenance`, `resolvePricingProvenance`,
`resolveInventoryProvenance`, `parseObservationTime`, and value guards, with
an explicit evaluation time, an owning-source parameter (`null` while
ownership is open → `unknown`), and internal reason codes. Not wired into any
runtime path; no contract, data, UI, or dependency change.
`field-provenance.test.ts` (fixed timestamps, synthetic `XTS` values) covers
every state, the threshold boundary, future and malformed timestamps,
malformed values, price/stock independence, stale stock → `inventory_unknown`,
and verified data still subject to `evaluatePurchasability`. Deviations:
stayed on `s5-t01-sprint-5-planning`; commit message
`feat(s6): implement field provenance rules` as instructed.

---

### S6-T14 — Server-side Zoho Request Wrapper (originally: Outbound Request Policy)

**Status:** COMPLETED as redefined by the project owner (2026-10-04): “Server-
side Zoho Request Wrapper / Demo Critical Path”. Gate G2 passed via the
minimum ADR 0009 boundary amendment. The original scope below (retries,
concurrency, budget counting, structured logs) is **not implemented** and
stays pending until Zoho facts are known.

**Result (redefined scope):**

- `infrastructure/zoho/zoho-config.ts` (server-only): `readZohoConfig` reads
  `ZOHO_API_BASE_URL` (https, no credentials/query), `ZOHO_ACCESS_TOKEN`, and
  optional `ZOHO_REQUEST_TIMEOUT_MS` (default 10 000, max 60 000) through
  `readServerEnv`; errors name variables only.
- `infrastructure/zoho/zoho-client.ts` (server-only): `createZohoClient(config,
  fetch)` with method, relative path, query, headers, optional JSON body, and
  per-request timeout (`AbortController`). Adds `Authorization:
  Zoho-oauthtoken …` (Zoho's general scheme; unverified for POS), rejects
  absolute/escaping paths and caller `Authorization` headers, returns
  `{ status, data: unknown }`, and throws `ZohoRequestError` (`timeout`,
  `network`, `http`, `invalid_response`, `invalid_request`) with tokens
  redacted. No retries, caching, or token refresh.
- Both modules are in the server-only boundary test's protected list; the
  import-graph test forbids client imports of `infrastructure/`.
- `.env.example` lists empty placeholders. Not wired into any route or page.
- S6-T14 establishes the server-side Zoho integration boundary. Actual Zoho
  capability verification is deferred to S6-T15. No Zoho compatibility is
  claimed and no Zoho request was made.

**Original proposal (not implemented):**

**Objective:** A small server-only wrapper around `fetch` that any future
provider adapter must use.

**Scope:**

- Per-attempt timeout (`AbortController`); bounded retries for idempotent
  GETs with exponential backoff and jitter; honors `Retry-After`; no retry on
  authorization or validation failures.
- Concurrency limit.
- Budget counter port with an in-memory implementation (durable counting is
  ADR 0008 P4) counting every attempt, labelled by endpoint; optional
  threshold that rejects non-essential calls.
- Structured log events (endpoint label, status, attempt, duration) with
  headers, query tokens, and bodies excluded.
- Sanitized error type mapping to `temporarily_unavailable`.
- Numbers (timeouts, attempts, limits) are configuration defaults recorded in
  the task, not provider facts.

**Exclusions:** any Zoho endpoint, credential, or call; wiring into the
catalog dispatch (a later decision; addresses TD-008 only when used).

**Acceptance criteria:** A1, A6, A7.

**Tests:** fake `fetch` and fake clock: success, timeout, retry then
success, retry exhaustion, `Retry-After`, 401/403/400 not retried,
concurrency cap, budget increments and threshold, secrets absent from logs and
error messages.

**Git/stop:** branch `s6-t14-outbound-request-policy`; commit
`feat(s6): add outbound request policy`; STOP.

---

### S6-T15 — Zoho Access Verification and Readiness Report

**Status:** IN PROGRESS — gate GZ passed (owner-approved access,
2026-10-04). Authentication and read-only catalog feasibility verified:
verdict **PARTIAL, sufficient for demo** — see
`docs/project/S6-T15-ZOHO-CATALOG-FEASIBILITY.md`. Demo order flow
(owner-approved, one draft Sales Order `SO-00001`) works — see
`docs/project/DEMO-ZOHO-SALES-ORDER.md`. Tax treatment to be confirmed before
production checkout; location-specific inventory validation deferred. Demo
frozen at baseline `589b74a`; production gap assessment and backlog:
`docs/project/PRODUCTION-READINESS.md`; P0 decision gate (owner decisions,
Zoho verifications, P0 order): `docs/project/PRODUCTION-DECISIONS.md`.
Tax verification: `docs/project/ZOHO-TAX-VERIFICATION.md`. Category mapping
design: `docs/project/CATEGORY-MAPPING-DESIGN.md`; partially implemented in
server-only `frontend/infrastructure/zoho/zoho-category-mapping.ts` (13
high-confidence Zoho category rows + one group override; resolver and
validator tested; unmapped products get `categoryIds: []` and are not
listed; pending placements await owner decision OD-6). Interim production
catalog snapshot (P0-9; ADR 0009 amendment): `infrastructure/catalog/catalog-snapshot.ts`
(in-memory store: background refresh, single flight, failure backoff, 24 h
maximum age), `SnapshotProductRepository`, `infrastructure/zoho/zoho-catalog-snapshot.ts`
(paginated GET-only loader, publication filter, sanitized summary log), and
`config/zoho-catalog.ts`, selected in `config/catalog-source.ts` by
`CATALOG_PRODUCT_SOURCE` (default `static`). Live read-only check: one refresh
(2 requests) served home, category, product, sitemap, and API reads; 13 of 49
products published. Durable storage and request counting remain open.

**Objective:** Replace unverified assumptions in §7 with evidence.

**Scope:**

- Review official Zoho POS documentation for the account's plan and region.
- Only if explicitly approved: manual, read-only calls from a developer
  machine (never CI), with credentials kept outside Git; any recorded response
  is redacted before commit.
- Report: quota and reset period, scopes, auth and token refresh, endpoints,
  pagination, field mapping to the ADR 0007 table, stock per location,
  order/inventory write capabilities, and the resulting persistence
  recommendation (ADR 0008 P1–P5).

**Exclusions:** adapter code, SDKs, sync jobs, storefront changes.

**Acceptance criteria:** every §7 item marked verified (with source) or
still unverified; no secret committed.

**Tests:** documentation review only.

**Git/stop:** branch `s6-t15-zoho-readiness`; commit
`docs(s6): record zoho readiness verification`; STOP.

---

### S6-T16 — Sprint 6 Review

**Status:** PROPOSED — requires approved tasks completed or recorded as
deferred

**Objective:** Verify A1–A8 and the ADRs; synchronize documentation; update
the debt register (TD-008, TD-010).

**Git/stop:** branch `s6-t16-sprint-review`; commit
`docs(s6): complete sprint 6 review`; STOP. Do not start Sprint 7.

---

## 6. Approval gates and order

| Gate | Before | Requires |
|------|--------|----------|
| G0 | S6-T11 | Revised plan approved; decision on merging Sprints 3–5 into `main` (D12) or continuing to stack. **Passed for S6-T11 by explicit user approval**, continuing to stack on the current branch; D12 remains open |
| G1 | S6-T13 | ADR 0007 provenance section accepted (ownership columns may stay open). **Passed 2026-10-04** |
| G2 | S6-T14 | ADR 0009 accepted. **Passed 2026-10-04** via the minimum boundary amendment (principles 3–9 still proposed) |
| GZ | S6-T15 | Zoho access or account documentation supplied, and explicit approval |
| GP | Any persistence task (none proposed) | ADR 0008 amended with evidence and accepted |

```text
S6-T01 (done) → S6-T02 (done) → G0 → S6-T11 (done) → S6-T12 (done) → G1 → S6-T13 (done)
                                        └──────→ G2 → S6-T14 (done)
GZ → S6-T15 (independent; may be deferred)
all approved tasks → S6-T16
```

## 7. Sprint 7 (Zoho POS) readiness checklist

**Planning constraint:** a Zoho allowance of **7,500 API requests per month**
has been reported. It is **not verified** and is not a confirmed account limit
(TD-010). Arithmetic only: ≈ 250/day ≈ 10/hour, so storefront traffic can
never map to provider calls; data must be refreshed in budgeted batches into a
cache or snapshot.

| # | Item | Status |
|---|------|--------|
| Z1 | Actual quota, reset period (calendar or rolling), per-minute/day limits, what counts as a request (token calls?), overage behavior | NOT VERIFIED |
| Z2 | Zoho POS API availability for this account and plan, region base URL, required scopes | **VERIFIED (S6-T15):** `https://api.zakya.in/inventory/v1`; locations list not authorized by granted scopes |
| Z3 | Authentication flow, token lifetime, refresh, where refreshed tokens live (ADR 0008 P5) | **VERIFIED for local dev (S6-T15):** OAuth code flow via `accounts.zoho.in`, 3600 s access token, refresh works; production token storage TBD |
| Z4 | Mapping of items / item groups / variants, SKU, unit, price, currency, stock (per location? TD-004) to the S4 contract and ADR 0007 | **PARTIAL (S6-T15):** group = product, item = variant; price, SKU, org-level stock map; GST inclusion, per-location stock, images, categories open |
| Z5 | Pagination model, maximum page size, requests per full catalog refresh | NOT VERIFIED |
| Z6 | Request budget: full vs incremental refresh (modified-since support?), frequency, freshness threshold | TBD |
| Z7 | Cache/snapshot mechanism for the chosen host (Next.js cache vs durable store, ADR 0008 P3) | TBD (host undecided) |
| Z8 | Bounded retries, rate limiting, handling of provider 429/5xx | Policy in ADR 0009; not implemented (S6-T14 was redefined to the request wrapper only) |
| Z9 | Usage monitoring and alert threshold before quota (ADR 0008 P4) | TBD |
| Z10 | Order and inventory write capabilities and whether they are ever in scope | NOT VERIFIED; out of scope until Sprint 8 decisions |
| Z11 | Stable identifiers and slug source (TD-005); provider image hosting (TD-003) | TBD |
| Z12 | Sandbox or test account; redacted recorded responses for fakes | NOT AVAILABLE |

## 8. Decisions

**Resolved in S6-T02**

- Next.js-only application; no FastAPI or separate backend (ADR 0006,
  explicit owner decision).
- No persistent store in Sprint 6; PostgreSQL not selected (ADR 0008 —
  proposed; no Sprint 6 task depends on storage either way).
- No URL version prefix while the storefront is the only consumer (ADR 0006).

**Open**

| ID | Decision | Default until decided |
|----|----------|-----------------------|
| D1 | Field-level ownership (ADR 0007 table) | Current sources; commercial fields `null` |
| D2 | Freshness threshold; whether stale price is hidden | **Decided (S6-T13):** 24 h inclusive default; stale price → `null`. Per-field values may be revisited |
| D3 | Whether provenance/`asOf` enters the public contract | No |
| D4 | Persistent store, if any (ADR 0008 P1–P6) | None |
| D-API | Whether `/api/*` stays public in production and what backs it | Dummy, as today |
| D5 | Cart and device-local cart (Q1/Q2) | Deferred |
| D6 | Locale and currency (Q9) | Price display disabled (`priceDisplay = null`) |
| D7 | Listing-card prices (Q10) and search (Q7) | Deferred |
| D8 | Account and order tracking | Deferred (Sprint 8) |
| D9 | Homepage claims: secure payment, free shipping, returns, COD, 24/7 support (TD-011) | Unchanged; business confirmation needed |
| D10 | Production domain | TBD; localhost fallback locally |
| D11 | Hosting and runtime model (long-running Node vs serverless) | TBD (Sprint 11); affects D4 |
| D12 | Merge Sprints 3–5 (and 6) into `main` (Q11) | No merge or push |
| D13 | Are the current 12 products and category tree approved as production content? | Not assumed |
| D14 | CI vendor and timing (TD-006) | No CI; manual runs |
| D15 | Descendant semantics for category listings (open since S4-T01) | Direct membership (current behavior) |

## 9. Deferred (must not enter Sprint 6)

| Item | Target |
|------|--------|
| Zoho client, SDK, credentials, sync, adapter | Sprint 7, after §7 verification |
| Any database or persistent store | Only via ADR 0008 amendment |
| Cart, checkout, orders, payment, shipping, tax | Sprint 8–9, separate approval |
| Authentication, accounts, admin, RBAC | Sprint 8 |
| Deployment, hosting, monitoring vendor | Sprint 11 |
| Sprint 5 Track B (S5-T05–S5-T07) | Pending Q1/Q2 |

## 10. Risks

- **Building ahead of verification:** provenance rules and request policy are
  designed before Zoho facts are known; kept provider-independent and small
  to limit rework.
- **Host-dependent caching:** Next.js cache durability differs by host;
  request budgeting cannot be finalized until D11.
- **Stacked unmerged branches** (D12).
- **No CI** (TD-006, D14): isolation and HTTP tests depend on manual runs.

## Exit criteria

Approved Sprint 6 tasks completed with evidence or recorded as deferred;
storefront behavior, SEO, and the dummy API unchanged; no invented commercial
data, Zoho calls, persistence, or commerce workflows. Do not start Sprint 7
automatically.
