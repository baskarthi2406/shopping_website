# Sprint 3 — SEO

| Field | Value |
|-------|--------|
| Sprint ID | S3 |
| Phase | Phase 1 — SEO-First Storefront |
| Objective | First-class SEO for the storefront |
| Status | NOT_STARTED |
| Dependencies | Sprint 2 completed |

Follow `docs/requirements/SEO_REQUIREMENTS.md` and `docs/requirements/MOBILE_REQUIREMENTS.md`. Domain and legal names remain **TBD**. Storefront SEO work must not regress mobile-first layout or Core Web Vitals considerations.

---

## S3-T01 — SEO-Friendly URL Strategy

**Status:** NOT_STARTED

### Objective

Document and implement catalog URL patterns (redirects if Sprint 2 URLs change).

### Dependencies

Sprint 2.

### Requirements

Human-readable slugs; no session IDs in URLs. Exact pattern TBD in this task; record the decision (ADR if it changes architecture).

### Implementation scope

Docs + route path updates + fixture slugs if needed.

### Expected files/modules

- `docs/requirements/SEO_REQUIREMENTS.md` (patterns filled in)
- Next.js catalog routes
- Optional ADR

### Acceptance criteria

- URL scheme documented and implemented
- Old paths either still work or redirect (if they existed)

### Testing requirements

Route tests or build-time path checks for fixture slugs.

### Definition of Done

URL strategy live and documented.

---

## S3-T02 — Dynamic Metadata

**Status:** NOT_STARTED

### Objective

Per-page title and description for home, category, and product from catalog data.

### Dependencies

S3-T01.

### Requirements

No generic identical title on all catalog pages. TBD brand suffix allowed as placeholder.

### Implementation scope

Next.js metadata API wired through application queries.

### Expected files/modules

- Metadata helpers / `generateMetadata` on routes

### Acceptance criteria

- Product and category pages have distinct titles/descriptions derived from data

### Testing requirements

Unit tests for metadata builders.

### Definition of Done

Dynamic metadata shipped.

---

## S3-T03 — Canonical URLs

**Status:** NOT_STARTED

### Objective

Emit a canonical URL for each indexable page.

### Dependencies

S3-T01, S3-T02.

### Requirements

Canonical domain **TBD** — use a documented placeholder base URL via env (no secrets).

### Implementation scope

Canonical link/metadata on indexable routes.

### Expected files/modules

- Canonical helper
- Env example without secrets (`NEXT_PUBLIC_SITE_URL` or equivalent)

### Acceptance criteria

- Indexable pages include canonical
- Cart/checkout not advertised as canonical catalog URLs

### Testing requirements

Unit tests for canonical serialization.

### Definition of Done

Canonicals present.

---

## S3-T04 — XML Sitemap

**Status:** NOT_STARTED

### Objective

Generate a sitemap of indexable home/category/product URLs from repositories.

### Dependencies

S3-T01.

### Requirements

Do not include admin or cart. Source URLs from repositories, not a handwritten stale list (fixtures may back the repo).

### Implementation scope

Next.js sitemap route/file.

### Expected files/modules

- Sitemap module
- Application query for indexable URLs

### Acceptance criteria

- All fixture category and product URLs appear
- Non-indexable routes omitted

### Testing requirements

Unit test URL set from mock repo.

### Definition of Done

Sitemap available.

---

## S3-T05 — robots.txt

**Status:** NOT_STARTED

### Objective

Serve `robots.txt` allowing catalog; disallow rules TBD (at least do not advertise future admin).

### Dependencies

S3-T04 recommended (sitemap reference).

### Requirements

Link to sitemap if present. Do not invent aggressive disallow lists.

### Implementation scope

Next.js `robots` file/route.

### Expected files/modules

- robots configuration

### Acceptance criteria

- File served
- Sitemap referenced when S3-T04 exists

### Testing requirements

Build/smoke that robots route exists.

### Definition of Done

robots.txt shipped.

---

## S3-T06 — Product Structured Data

**Status:** NOT_STARTED

### Objective

JSON-LD Product on product pages from repository data.

### Dependencies

S2-T03, S3-T01.

### Requirements

Valid Product JSON-LD for available fields. Offers/currency **TBD** — omit or mark placeholder only if price exists on the type.

### Implementation scope

JSON-LD component/helper on PDP.

### Expected files/modules

- Product JSON-LD builder
- PDP integration

### Acceptance criteria

- Script type `application/ld+json` present on PDP
- Builder unit-tested

### Testing requirements

Unit tests for JSON-LD shape.

### Definition of Done

Product schema shipped.

---

## S3-T07 — Breadcrumb Structured Data

**Status:** NOT_STARTED

### Objective

JSON-LD BreadcrumbList matching visible breadcrumbs.

### Dependencies

S2-T04, S3-T06.

### Requirements

Must match UI crumb trail.

### Implementation scope

Breadcrumb JSON-LD helper on category and product pages.

### Expected files/modules

- BreadcrumbList builder

### Acceptance criteria

- JSON-LD present where UI breadcrumbs exist
- Items align with links

### Testing requirements

Unit tests for list construction.

### Definition of Done

Breadcrumb schema shipped.

---

## S3-T08 — Organization Structured Data

**Status:** NOT_STARTED

### Objective

JSON-LD Organization on the layout or home. Legal name **TBD** — use documented placeholder.

### Dependencies

S3-T02.

### Requirements

Do not invent a real company name; use TBD placeholder from config.

### Implementation scope

Organization JSON-LD helper.

### Expected files/modules

- Organization JSON-LD builder
- Config placeholders

### Acceptance criteria

- JSON-LD present
- Values come from config, not hardcoded scattered strings (single config module allowed)

### Testing requirements

Unit test builder.

### Definition of Done

Organization schema shipped.

---

## S3-T09 — OpenGraph

**Status:** NOT_STARTED

### Objective

OpenGraph title, description, and image for indexable pages.

### Dependencies

S3-T02.

### Requirements

Fallback image **TBD**; use placeholder asset if no product image.

### Implementation scope

OG metadata on routes.

### Expected files/modules

- OG fields in metadata helpers

### Acceptance criteria

- Product/category/home include OG title/description
- Image field present (placeholder allowed)

### Testing requirements

Unit tests for OG field mapping.

### Definition of Done

OpenGraph shipped.

---

## S3-T10 — Image Optimization

**Status:** NOT_STARTED

### Objective

Serve catalog images through Next.js image optimization with meaningful alt text.

### Dependencies

S2-T03.

### Requirements

No raw unoptimized decorative catalog `<img>` for product photos unless documented exception. Alt from product data. Images must be responsive (no overflow / horizontal scroll). Consider LCP on PDP.

### Implementation scope

Image component usage on listing and PDP.

### Expected files/modules

- Product image component
- Fixture image paths from SEO filenames in `docs/project/DESIGN_ASSETS.md`

### Acceptance criteria

- Product images use the Next.js Image component (or documented equivalent)
- Alt text from data
- Images are responsive on mobile; no horizontal scroll from media

### Testing requirements

Build; component test optional.

### Definition of Done

Optimized images on catalog pages.

---

## S3-T11 — Internal Linking and SEO Review

**Status:** NOT_STARTED

### Objective

Ensure category↔product internal links, crawlability review, docs sync.

### Dependencies

S3-T01 … S3-T10.

### Requirements

Primary catalog content in HTML. Docs match implementation.

### Implementation scope

Link fixes, SEO review notes in docs if gaps remain TBD.

### Expected files/modules

- Catalog components/routes
- `docs/requirements/SEO_REQUIREMENTS.md` status notes

### Acceptance criteria

- Listing cards link to PDP
- PDP links back to category
- Sitemap, robots, metadata, JSON-LD, OG present

### Testing requirements

Lint, unit tests, build.

### Definition of Done

Sprint 3 completed in status; S4-T01 recorded, not started.
