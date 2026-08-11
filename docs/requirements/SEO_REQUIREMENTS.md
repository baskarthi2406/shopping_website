# SEO Requirements

SEO is a **first-class** requirement. Catalog pages must be crawlable.

Brand: **Mini Mystiq**. Domain and legal entity remain **TBD**.

---

## Required storefront capabilities (by end of Sprint 3, unless noted)

| Capability | Notes |
|------------|--------|
| SEO-friendly URLs | Architecture default (S1-T01): `/`, `/c/{categorySlug}`, `/p/{productSlug}`. Implement Sprint 2–3; change via ADR |
| Dynamic metadata | Title, description per page type |
| Canonical URLs | One canonical per indexable page |
| Sitemap | XML sitemap of indexable URLs |
| robots.txt | Allow catalog; disallow rules TBD |
| Product structured data | JSON-LD Product |
| Breadcrumb structured data | JSON-LD BreadcrumbList |
| Organization structured data | JSON-LD Organization (legal name TBD) |
| OpenGraph | Title, description, image |
| Image optimization | Next.js image pipeline; SEO filenames + meaningful alt (not the filename); approved `public/` assets (`DESIGN_ASSETS.md`) |
| Semantic HTML | Landmarks, headings, lists |
| Internal linking | Categories ↔ products, breadcrumbs |
| Crawlable product/category pages | Server-rendered HTML; not client-only shells |

## Mobile and Core Web Vitals

SEO and mobile-first overlap: crawlable HTML must also be usable on a phone. Storefront tasks must consider Core Web Vitals (numeric budgets **TBD**). See `MOBILE_REQUIREMENTS.md`.

## Implementation rules

- Prefer Server Components / server rendering for indexable routes.
- Do not hide primary catalog content behind JavaScript-only navigation.
- Metadata must be derived from catalog data via application queries, not duplicated ad hoc in random components.
- Indexing of cart/checkout/admin: cart and checkout should not be marketed as indexable; admin is Phase 2 and must not be indexed.

## Implemented (S2-T01)

Category pages at `/c/{slug}`:

- `generateMetadata` from category data via `buildCategoryMetadata` (`application/seo/category-metadata.ts`)
- Unique title `{Category name} | Mini Mystiq`
- Description from category copy when present; otherwise a factual fallback (`{name} at Mini Mystiq. Baby Clothes & Toys.`) — no invented marketing claims
- Canonical path `/c/{slug}` (no query parameters). Absolute origin remains TBD (`NEXT_PUBLIC_SITE_URL`)
- OpenGraph title, description, and path `url`
- One H1 (category name); crawlable `/p/{slug}` product links; image `alt` from catalog data
- Unknown category: HTTP 404 + `noindex` (Next.js `notFound()`). Do not index fake categories

**Not in S2-T01 (Sprint 3):** sitemap, robots.txt, JSON-LD (Product / BreadcrumbList / Organization).

## Implemented (S2-T03)

Product pages at `/p/{slug}`:

- `generateMetadata` from product data via `buildProductMetadata` (`application/seo/product-metadata.ts`)
- Unique title `{Product name} | Mini Mystiq`
- Description from the product description; factual fallback only if that field is blank
- Canonical path `/p/{slug}` (no query parameters). Absolute origin remains TBD
- OpenGraph title, description, path `url`, and first product image when present
- One H1 (product name); crawlable `/c/{slug}` category links when merchandising is known
- Unknown product: HTTP 404 + `noindex`. Do not index fake products
- JSON-LD Product schema is **not** implemented here (Sprint 3). Do not invent offers, SKU, or availability.

## TBD

- Canonical domain
- Trailing-slash policy
- Pagination SEO
- hreflang / locales
- Search appearance extras (FAQ, reviews)
