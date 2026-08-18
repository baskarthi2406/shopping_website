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
| robots.txt | Allow catalog; sitemap referenced; future Disallow TBD |
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
- Canonical path `/c/{slug}` (no query parameters). Absolute origin from `NEXT_PUBLIC_SITE_URL` / `metadataBase` (S3-T03). Production domain TBD.
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

## Implemented (S2-T04)

- Header catalog nav: crawlable `/c/{slug}` links from `listCategories` (Baby Essentials, Infants, Kids, Teens, Women)
- Shared breadcrumb UI on category and product pages (`<nav aria-label="Breadcrumb">`)
- No BreadcrumbList JSON-LD (Sprint 3)
- No `nofollow` on catalog nav or breadcrumbs
- No Client-Component-only navigation

## Implemented (S2-T05)

Filter/sort **deferred**. No `?sort=` / facet URLs. Category canonicals remain `/c/{slug}`. See `CATALOG_FILTER_SORT.md`.

## Implemented (S3-T01)

Homepage `/` is a crawlable Option 1 storefront (hero, categories, catalog products, promo). One H1. Crawlable `/c/{slug}` and `/p/{slug}` links. No JSON-LD.

## Implemented (S3-T02)

Standardized dynamic metadata for `/`, `/c/{slug}`, `/p/{slug}`:

- Application helpers: `buildHomeMetadata`, `buildCategoryMetadata`, `buildProductMetadata`, `buildNotFoundMetadata`
- Next.js mapping: `app/to-next-metadata.ts` (routing layer; application stays framework-free)
- Unique titles; factual descriptions; path canonicals; OpenGraph title/description/url/`website` type
- Homepage OpenGraph image: approved hero `baby-sleeveless-sets-new-collection-banner.jpg`
- Category OpenGraph image: documented product-photo stand-in when present
- Product OpenGraph image: primary product image
- Unknown catalog slugs and `not-found.tsx`: title `Page not found | Mini Mystiq`, description “That page does not exist.”, `noindex`, no canonical
- No JSON-LD, sitemap, or `robots.ts`

## Implemented (S3-T03)

- Single source of truth: `config/site.ts` (`NEXT_PUBLIC_SITE_URL`)
- `app/layout.tsx` sets `metadataBase` from `getMetadataBase()`
- Path canonicals unchanged; Next.js resolves them to `{origin}/`, `{origin}/c/{slug}`, `{origin}/p/{slug}`
- OpenGraph `url` and `image` resolve against the same origin
- Missing env: local fallback `http://localhost:3000` (not for hosted production)
- Hosted production (`VERCEL_ENV=production` or `REQUIRE_SITE_URL=true`) requires a non-localhost origin
- Production Mini Mystiq domain remains **TBD** — set the env before live deploy
- `.env.example` documents the variable. Invalid pages still have no canonical

## Implemented (S3-T04)

XML sitemap at `/sitemap.xml` (`frontend/app/sitemap.ts`, Next.js `MetadataRoute.Sitemap`):

- URLs from `listIndexableUrls` via `config/catalog.ts` (repositories, not fixtures, not a hard-coded slug list)
- Origin from `config/site.ts` / `NEXT_PUBLIC_SITE_URL` — same source as `metadataBase`. Production domain remains **TBD**
- Each sitemap `loc` matches the page HTML canonical (`toCanonicalUrl`). Homepage has no trailing slash, matching Next.js `metadataBase` + path `/`
- Included: `/`, every valid `/c/{slug}` (including empty infants/teens/women), every valid `/p/{slug}` (including uncategorized products)
- Excluded: unknown slugs, query/filter/sort URLs, cart, checkout, admin
- `lastmod` / `changefreq` / `priority` omitted — catalog models have no reliable timestamps; those values are not specified
- Unique URLs; order is homepage, then categories, then products (repository order)
- `robots.ts`, JSON-LD, Search Console submission, and analytics are not in this task

Empty-category indexing is unchanged: empty category pages remain indexable routes, so they appear in the sitemap. Whether empty categories should later be `noindex` or omitted is **TBD** — do not invent a new rule here.

## Implemented (S3-T05)

`/robots.txt` (`frontend/app/robots.ts`, Next.js `MetadataRoute.Robots`):

- One public policy: `User-agent: *` and `Allow: /` — `/`, `/c/{slug}`, and `/p/{slug}` are not blocked
- Sitemap line is `{origin}/sitemap.xml` via `toCanonicalUrl` / `config/site.ts` / `NEXT_PUBLIC_SITE_URL` (same origin as `metadataBase` and sitemap locs). Production domain remains **TBD**
- No `Host` directive, no crawler-specific rules, no query-parameter rules
- No invented Disallow for cart/checkout/admin (those routes are not implemented)
- Static assets are not blocked
- JSON-LD, Search Console, and analytics are not in this task

Future Disallow rules for non-indexable routes remain **TBD** until those routes exist.

## Reviewed (S2-T07)

12-product static catalog: unique titles, canonical `/p/{slug}` and `/c/{slug}`, OpenGraph, crawlable HTML, factual alts. Uncategorized products remain reachable at `/p/{slug}` only. JSON-LD still Sprint 3.

## TBD

- Canonical domain
- Trailing-slash policy (current homepage canonical/sitemap loc has no trailing slash; other paths have none)
- Pagination SEO
- Filtered-listing SEO (when filters exist)
- hreflang / locales
- Search appearance extras (FAQ, reviews)
