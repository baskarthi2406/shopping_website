# Technical Debt Register

Verified defects and known limitations. Each entry records evidence, impact,
and the task that resolves or will resolve it. Do not fix an open item outside
an explicitly requested task.

Status: `OPEN` | `RESOLVED` | `ACCEPTED` (intentional, revisit later)

---

## TD-001 — Production soft 404 for unknown catalog slugs

| Field | Value |
|-------|-------|
| Status | **RESOLVED** (S4-F01) |
| Found | S4-T12 review (production smoke test) |
| Introduced | S4-T10 (route `loading.tsx` files) |
| Area | `frontend/app/`, route status codes, technical SEO |

**Evidence (before fix):** against `next build && next start`, `/c/does-not-exist`
and `/p/does-not-exist` returned HTTP 200 for both a browser and a Googlebot
user agent. The body rendered “Page not found” with
`<meta name="robots" content="noindex">`.

**Root cause:** `app/loading.tsx` (root segment) and the `c/[slug]` /
`p/[slug]` `loading.tsx` files created Suspense boundaries above the page's
`notFound()` call. The fallback streamed first, committing HTTP 200 before the
page resolved the slug (Next.js 16 documents that status cannot change after
streaming starts). S4-T10 tests asserted source text only, so the runtime
status was never exercised.

**Resolution:** homepage skeleton scoped to `app/(home)/loading.tsx`;
`c/[slug]/layout.tsx` and `p/[slug]/layout.tsx` resolve the slug through
existing catalog use cases before the segment loading boundary; product detail
reads request-memoized like the category tree. `npm run test:http` asserts real
production status codes (200/404, browser and Googlebot).

**Residual:** `test:http` needs a production build and is not part of
`npm test`; no CI pipeline runs it yet (see TD-006).

---

## TD-002 — Category listing scans the full product catalog

| Field | Value |
|-------|-------|
| Status | OPEN |
| Found | S4-T12 review |
| Area | `infrastructure/catalog/http-product-repository.ts` |

`HttpProductRepository.listByCategorySlug` pages through every
`GET /api/products` page and filters by `categoryIds` in memory; `getById`
also lists everything. Correct for 12 fixtures, not for a real Zoho catalog.
Proposed: additive, backward-compatible category filter on the product
collection contract, decided before Sprint 7 adapter work. Contract change
requires its own task/ADR update.

---

## TD-003 — Catalog images limited to local public paths

| Field | Value |
|-------|-------|
| Status | OPEN |
| Found | S4-T12 review |
| Area | `domain/catalog/catalog-image.ts`, `next.config.ts` |

`CatalogImage.src` is documented as a `public/` path and `next.config.ts` has
no `images.remotePatterns`. Provider-hosted images (Zoho or CDN) will need a
documented contract clarification and image host configuration.

---

## TD-004 — No inventory location model

| Field | Value |
|-------|-------|
| Status | ACCEPTED (until Zoho access is verified) |
| Found | S4-T12 review |
| Area | `domain/catalog/inventory.ts`, ADR 0005 |

`Inventory` is a single snapshot per product/variant. If the POS reports stock
per location, the adapter must define an aggregation or selection rule. Do not
add a location model before verified Zoho data exists.

---

## TD-005 — SEO slugs for provider items have no source

| Field | Value |
|-------|-------|
| Status | OPEN |
| Found | S4-T12 review |
| Area | ADR 0005, future Zoho adapter / production backend |

Public routes use Mini Mystiq slugs separate from provider IDs. A provider item
list is not known to supply stable SEO slugs; slug generation, collision
handling, and persistence need a production-backend (Sprint 6) decision.

---

## TD-006 — HTTP status tests are not automated in CI

| Field | Value |
|-------|-------|
| Status | OPEN |
| Found | S4-F01 |
| Area | `frontend/vitest.http.config.mts`, CI (none configured) |

`npm run test:http` requires `npm run build` first and is run manually. Add it
to a CI pipeline after build when CI is introduced (Sprint 11 production
readiness or earlier if approved).

---

## TD-007 — Stale `.next/dev/types` after moving routes

| Field | Value |
|-------|-------|
| Status | ACCEPTED |
| Found | S4-F01 |
| Area | `frontend/tsconfig.json` includes `.next/dev/types/**/*.ts` |

After a route file moves, `next build` type-checks generated
`.next/dev/types/validator.ts` from an earlier `next dev` run and fails with
“Cannot find module '../../../app/page.js'”. Delete `frontend/.next/dev/types`
(generated) or restart `next dev` to regenerate it. No source change required.

---

## TD-008 — Catalog API client has no network resilience policy

| Field | Value |
|-------|-------|
| Status | OPEN |
| Found | S4-T12 review |
| Area | `infrastructure/catalog/catalog-api-client.ts` |

The client has no timeout, retry, or HTTP caching/revalidation policy. That is
safe today because the dummy API is dispatched in-process. Before any real
network transport (production backend or Zoho-backed API), define timeouts,
retry rules, and caching; failures must keep the existing sanitized error UI.

---

## TD-009 — Menu order relies on record order

| Field | Value |
|-------|-------|
| Status | ACCEPTED (API menu-order field is a business/API TBD) |
| Found | S4-T12 review |
| Area | `domain/catalog/category.ts`, category records, `GET /api/categories` |

No category field defines menu order; header, footer, and mega-menu follow
record/array order. A provider or production backend must preserve order or a
contract-level order field must be approved (ADR/contract update).
