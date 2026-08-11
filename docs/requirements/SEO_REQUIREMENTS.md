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

## TBD

- Canonical domain
- Trailing-slash policy
- Pagination SEO
- hreflang / locales
- Search appearance extras (FAQ, reviews)
