# Sprint 3 — SEO

| Field | Value |
|-------|--------|
| Sprint ID | S3 |
| Phase | Phase 1 — SEO-First Storefront |
| Objective | Customer homepage, then first-class SEO for the storefront |
| Status | IN_PROGRESS |
| Dependencies | Sprint 2 completed |

Sprint 3 was **reordered**: S3-T01 is the Option 1 homepage (the storefront was still a shell). The original S3-T01 “SEO-Friendly URL Strategy” is **deferred**, not cancelled — see below. Remaining S3-T02 … S3-T11 stay SEO tasks.

Follow `docs/requirements/SEO_REQUIREMENTS.md` and `docs/requirements/MOBILE_REQUIREMENTS.md`. Domain and legal names remain **TBD**. Storefront SEO work must not regress mobile-first layout or Core Web Vitals considerations.

---

## S3-T01 — Homepage Storefront Implementation

**Status:** COMPLETED

### Objective

Replace the foundation homepage shell with the approved Option 1 customer storefront.

### Dependencies

Sprint 2.

### Requirements

Mobile-first. Data-driven categories and products via application/catalog. Approved hero and promo assets. No cart, search, filter/sort, JSON-LD, backend, or invented featured merchandising.

### Implementation scope (as implemented)

- `getHomePage` + `toHomePageViewModel` (uses `list()`, not `listFeatured()`)
- Homepage sections: hero, category circles, catalog product grid, secondary promo, intro, trust bar
- Header: announcement bar (Option 1 copy), logo, `details`/`summary` mobile category menu, desktop wrapping nav
- Footer: brand + data-driven category links
- `buildHomeMetadata` for `/`
- Hero/promo JPEGs served from `frontend/public/` (originals kept in repository-root `public/`)

### Homepage sections

| Section | Source |
|---------|--------|
| Announcement bar | Option 1 copy (policies still operationally TBD) |
| Hero | Option 1 headline/CTA + `baby-sleeveless-sets-new-collection-banner.jpg` |
| Shop by category | `listCategories()` + documented product-photo stand-ins |
| Clothing in the catalog | `listProducts()` — not featured |
| Secondary promo | `baby-dress-bloomer-sets-new-collection-banner.jpg` |
| Intro | Factual storefront copy (no toy inventory claim) |
| Trust bar | Option 1 copy |
| Footer | Brand + nav from `listCategories()` |

Shop Now / promo link to the first category that has products (data-driven). No Client Component; mobile nav is `details`/`summary`.

### Acceptance criteria

- Homepage is a real storefront, not an empty shell
- UI does not import fixtures
- Existing `/c/` and `/p/` routes still work

### Testing requirements

Unit tests for `getHomePage`, homepage view model, and home metadata. Lint, typecheck, build.

### Definition of Done

Homepage live. S3-T02 recorded **NOT_STARTED**. Original SEO URL strategy remains deferred (not started).

---

## Deferred — SEO-Friendly URL Strategy (original S3-T01)

**Status:** NOT_STARTED

Reordered behind the homepage. Still required in Sprint 3. Do not skip.

### Objective

Document and implement catalog URL patterns (redirects if Sprint 2 URLs change).

### Requirements

Human-readable slugs; no session IDs in URLs. Exact pattern TBD in this task; record the decision (ADR if it changes architecture). Current Phase 1 paths remain `/`, `/c/{slug}`, `/p/{slug}`.

---

## S3-T02 — Dynamic Metadata

**Status:** COMPLETED

### Objective

Per-page title and description for home, category, and product from catalog data.

### Dependencies

S3-T01.

### Requirements

No generic identical title on all catalog pages. TBD brand suffix allowed as placeholder.

### Implementation scope (as implemented)

Standardized application SEO helpers and Next.js wiring. No JSON-LD, sitemap, robots, or domain invention.

- Shared `IndexablePageMetadata` + `buildNotFoundMetadata`
- `buildHomeMetadata` / `buildCategoryMetadata` / `buildProductMetadata`
- `app/to-next-metadata.ts` maps helpers to the Next.js Metadata API (routing layer)
- Category OpenGraph uses documented product-photo stand-ins when present
- Unknown `/c/` and `/p/` slugs: HTTP 404, `noindex`, no canonical
- Canonicals remain paths (`/`, `/c/{slug}`, `/p/{slug}`). Site origin **TBD** (S3-T03). Build warns that OpenGraph image URLs fall back to `http://localhost:3000` until `metadataBase` exists — do not invent a production domain here.

### Acceptance criteria

- Product and category pages have distinct titles/descriptions derived from data

### Testing requirements

Unit tests for metadata builders, uniqueness, and no invented commercial claims.

### Definition of Done

Dynamic metadata shipped. S3-T03 recorded **NOT_STARTED**.

---

## S3-T03 — Canonical Site URL and Metadata Base

**Status:** COMPLETED

### Objective

Emit a canonical URL for each indexable page, with a single configured site origin for `metadataBase`.

### Dependencies

S3-T01, S3-T02.

### Requirements

Canonical domain **TBD** — use a documented placeholder base URL via env (no secrets). Do not invent a Mini Mystiq hostname.

### Implementation scope (as implemented)

- `config/site.ts` is the single source of truth for `NEXT_PUBLIC_SITE_URL`
- `layout.tsx` sets Next.js `metadataBase` from `getMetadataBase()`
- SEO helpers still emit path-only canonicals (`/`, `/c/{slug}`, `/p/{slug}`); Next.js resolves them against `metadataBase`
- `.env.example` documents the variable (empty; production domain TBD)
- Local unset env falls back to `http://localhost:3000`
- Hosted production (`VERCEL_ENV=production` or `REQUIRE_SITE_URL=true`) requires a non-localhost origin
- Invalid `/c/` and `/p/` routes remain 404 + `noindex` with no canonical
- No URL strategy change, JSON-LD, sitemap, or robots

### Acceptance criteria

- Indexable pages include canonical
- Cart/checkout not advertised as canonical catalog URLs

### Testing requirements

Unit tests for origin parsing, absolute URL joining, hosted-production guards, and path-only helper output.

### Definition of Done

Canonical origin infrastructure shipped. S3-T04 recorded **NOT_STARTED**.

---

## S3-T04 — XML Sitemap

**Status:** COMPLETED

### Objective

Generate a sitemap of indexable home/category/product URLs from repositories.

### Dependencies

S3-T01, S3-T03 recommended.

### Requirements

Do not include admin or cart. Source URLs from repositories, not a handwritten stale list (fixtures may back the repo).

### Implementation scope (as implemented)

- Next.js App Router `frontend/app/sitemap.ts` → `/sitemap.xml`
- Application query `listIndexableUrls` (`application/seo/`); composed in `config/catalog.ts`
- Origin from `config/site.ts` / `NEXT_PUBLIC_SITE_URL` via `toCanonicalUrl` (same HTML canonicals as S3-T03)
- Included: `/`, all `/c/{slug}` from `listCategories`, all `/p/{slug}` from `listProducts`
- Empty categories (currently infants, teens, women) included — they remain valid indexable routes
- Uncategorized products included — they remain valid `/p/{slug}` pages
- Excluded: unknown slugs, query/filter/sort URLs, cart, checkout, admin
- `lastModified`, `changeFrequency`, and `priority` omitted (no reliable timestamps; values not specified)
- Deterministic order: homepage, then categories in repository order, then products in repository order
- No fixture imports in `sitemap.ts`; no hard-coded category/product lists
- No `robots.ts`, JSON-LD, analytics, or UI changes

### Acceptance criteria

- All fixture category and product URLs appear
- Non-indexable routes omitted

### Testing requirements

Unit test URL set from mock repo. Composition test that sitemap URLs match catalog lists and site origin.

### Definition of Done

Sitemap available. S3-T05 recorded **NOT_STARTED**.

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
