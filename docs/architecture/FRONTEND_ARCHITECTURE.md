# Frontend Architecture

Phase 1 storefront. **Do not initialize Next.js until S1-T03.**

---

## Stack (decided)

| Item | Choice | ADR |
|------|--------|-----|
| Framework | Next.js **App Router** | 0002 |
| UI | React | — |
| Language | TypeScript (strict; no `any` without comment) | — |
| CSS | Tailwind CSS | — |
| Rendering | Server Components for catalog; Client Components for interactivity | 0002 |

---

## Data flow (Phase 1)

```
UI (page.tsx / Server Component)
  → Application service (e.g. getProductBySlug)
    → IProductRepository
      → StaticProductRepository
        → fixture data + image paths (SEO filenames)
```

Phase 2: same UI and services; infrastructure becomes `HttpProductRepository`. ADR 0004.

Pages **must not** import fixture files or `fetch` FastAPI directly.

---

## Server vs Client Components

| Use Server Components | Use Client Components (`"use client"`) |
|-----------------------|----------------------------------------|
| Home, category, product pages (HTML content) | Cart add/update/remove |
| Metadata (`generateMetadata`) | Mobile nav disclosure |
| JSON-LD, sitemap, robots | Search box interactivity |
| Layout chrome that needs no browser APIs | Wishlist/Account chrome if it needs client state |
| Product cards’ crawlable text/images | Carousel/slider if used |

Catalog body content must be in the server HTML. Do not hide products behind client-only fetch.

---

## Target structure (S1-T04 creates this)

```
frontend/
  src/
    app/
      layout.tsx
      page.tsx                    # home
      c/[slug]/page.tsx           # category
      p/[slug]/page.tsx           # product
      cart/page.tsx
      robots.ts / sitemap.ts      # Sprint 3
    domain/
      catalog/                    # Product, Category, slugs
      cart/
    application/
      catalog/                    # use cases + repository interfaces
      cart/
    infrastructure/
      catalog/
        static-product-repository.ts
        static-category-repository.ts
        http-product-repository.ts   # Phase 2
      config/                     # which repository to bind
    components/
      storefront/                 # mobile-first presentational
    styles/
```

URL defaults: `/`, `/c/{slug}`, `/p/{slug}`, `/cart`, `/checkout` — see `ARCHITECTURE.md` §11.

---

## SEO

- Slugs on Product and Category in the domain (URL-safe, lowercase, hyphens).
- `generateMetadata` calls application queries.
- Canonical base URL from env (`NEXT_PUBLIC_SITE_URL` or equivalent) — value TBD.
- Sitemap from repositories; omit cart/checkout/admin.
- JSON-LD: Product, BreadcrumbList, Organization (legal name TBD; brand Mini Mystiq).
- OpenGraph from the same metadata helpers.
- `next/image` + SEO filenames from `DESIGN_ASSETS.md`. Alt describes the image, not the filename.
- Semantic landmarks; real links between home ↔ category ↔ product.

---

## Mobile-first

Priority: **Mobile → Tablet → Desktop**. Option 1 is a desktop mockup; implement stacked mobile first.

Must consider: layout, touch (no hover-only), type, images, no horizontal scroll, nav, listing, PDP, cart, performance, Core Web Vitals.

- Primary hero (initial, approved): `baby-sleeveless-sets-new-collection-banner.jpg` — LCP candidate (`priority` when UI exists).
- Secondary promo: `baby-dress-bloomer-sets-new-collection-banner.jpg` — lazy-load.
- Same files on all breakpoints; `object-fit` contain/crop; do not stretch 3:4 into a short wide strip.
- Nav pattern TBD (menu/drawer). Must be keyboard + touch.
- Admin (Phase 2): desktop-priority, still responsive.

---

## Visual design

**Option 1 only.** Spec: `docs/project/DESIGN_OPTION_1.md`. Logo: `mini-mystiq-logo.png`.

Do not introduce another visual direction. Do not slice `mini-mystiq-app-design-suggestions.png` for production `<img>`s.

Temporary category cards: reuse approved product photos (`DESIGN_ASSETS.md`). Not dedicated category art.

---

## Cart (Phase 1)

Domain + client repository (memory / `localStorage` TBD in Sprint 4). Server cart in Sprint 7 behind `ICartRepository`.

---

## Testing

Unit-test domain and application without rendering Next.js. Static repository tests for slug/list. Lint/test runner: S1-T06 (**TBD** tools).

---

## Security (frontend)

- No secrets in the client bundle except public site URL
- Do not call PostgreSQL
- Do not ship FastAPI URLs until Phase 2 config says so
