# SEO Requirements

SEO is a **first-class** requirement. Catalog pages must be crawlable.

Brand, domain, and marketing copy are **TBD**.

---

## Required storefront capabilities (by end of Sprint 3, unless noted)

| Capability | Notes |
|------------|--------|
| SEO-friendly URLs | Pattern TBD in S3-T01 (e.g. `/c/{slug}`, `/p/{slug}` — proposal only) |
| Dynamic metadata | Title, description per page type |
| Canonical URLs | One canonical per indexable page |
| Sitemap | XML sitemap of indexable URLs |
| robots.txt | Allow catalog; disallow rules TBD |
| Product structured data | JSON-LD Product |
| Breadcrumb structured data | JSON-LD BreadcrumbList |
| Organization structured data | JSON-LD Organization (legal name TBD) |
| OpenGraph | Title, description, image |
| Image optimization | Next.js image pipeline; alt text |
| Semantic HTML | Landmarks, headings, lists |
| Internal linking | Categories ↔ products, breadcrumbs |
| Crawlable product/category pages | Server-rendered HTML; not client-only shells |

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
