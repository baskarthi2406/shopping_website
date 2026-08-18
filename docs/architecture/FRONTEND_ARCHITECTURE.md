# Frontend Architecture — Layer Boundaries

**Task:** S1-T02 (layer contract). **As implemented through S3-T07:** App Router at `frontend/app/` (no `src/`); layers in S1-T04; static catalog in S1-T05 (expanded S2-T06: 12 products); Vitest in S1-T06; Option 1 tokens + semantic shell in S1-T07; category listing at `/c/[slug]`; product detail at `/p/[slug]`; catalog nav + shared breadcrumbs (S2-T04); listing filter/sort deferred (S2-T05); Option 1 homepage at `/` (S3-T01); XML sitemap at `/sitemap.xml` (S3-T04); `/robots.txt` (S3-T05); Product JSON-LD on `/p/[slug]` (S3-T06); BreadcrumbList JSON-LD on `/c/[slug]` and `/p/[slug]` (S3-T07).

This file is the contract for where frontend code belongs. It refines S1-T01. Conflicts with this file vs `ARCHITECTURE.md` should be reported; layer **rules** here win for `frontend/`.

**Product:** Mini Mystiq  
**UI:** Design Option 1 only (`DESIGN_OPTION_1.md`, ADR 0001)  
**Stack:** Next.js App Router, React, TypeScript, Tailwind (ADR 0002)  
**Data:** Repository interfaces; Phase 1 static, Phase 2 HTTP (ADR 0004)

---

## 1. Dependency direction (mandatory)

```
App / Pages / Layouts          (Interface)
        ↓
Presentation (UI components)   (may skip Application only for pure layout chrome)
        ↓
Application services           (use cases)
        ↓
Domain                         (entities, rules)
        ↓
Repository interfaces          (owned by application, used by domain-adjacent code)

Infrastructure implements repository interfaces.
Configuration binds implementations.
```

**Forbidden:**

```
React component  →  static JSON / fixture files
React component  →  fetch/FastAPI/SQL
Domain           →  Next.js / React / Tailwind
Application      →  page.tsx / Client Components
```

Presentation may depend on **view models** (plain objects) produced by application services, not on repository DTOs.

---

## 2. Layer catalog

### 2.1 App / routing layer

**Owns:** `app/` route tree (as implemented: `frontend/app`, not `src/app`), URL segments, layouts, `loading.tsx`, `error.tsx`, `not-found.tsx`, `generateMetadata` **calls**, sitemap/robots **routes**.

**Does not own:** Business rules, fixture data, CSS design tokens as a system, cart math.

| May depend on | Must not depend on |
|---------------|-------------------|
| Application services, SEO helpers, presentation components | Domain internals that bypass services, infrastructure, static JSON, FastAPI |

---

### 2.2 Page layer

**Owns:** One route’s composition: which services to call, which view to render, mapping service results → props.

**Does not own:** Styling systems, repository choice, domain invariants.

Pages are **Server Components by default**. They stay thin.

---

### 2.3 UI / presentation layer

**Owns:** Design Option 1 primitives and storefront composites (see §8). Markup, Tailwind, a11y of controls.

**Does not own:** Fetching, pricing rules, slug rules, cart persistence, SEO document metadata (except rendering JSON-LD script if given a built object).

| May depend on | Must not depend on |
|---------------|-------------------|
| View-model props, other presentation components, Tailwind | Application repositories, infrastructure, `fs`, `fetch` to APIs |

---

### 2.4 Application / service layer

**Owns:** Use cases (see §11). Orchestration. Repository interfaces. Mapping infrastructure/domain → view models for pages.

**Does not own:** JSX, Tailwind, Next.js cookies (except later auth — Phase 2), SQL.

| May depend on | Must not depend on |
|---------------|-------------------|
| Domain, repository interfaces | `react`, `next`, presentation, static JSON files |

Services must be unit-testable with fake repositories.

---

### 2.5 Domain layer

**Owns:** `Product`, `Category`, `ProductVariant`, `Uom`, inventory status values, `Cart`, `CartItem`, slug shape rules, cart line math.

**Does not own:** HTTP, React, file paths as a framework concern (image **filename strings** as data are OK).

| May depend on | Must not depend on |
|---------------|-------------------|
| Language types only | Next.js, React, Tailwind, fetch, Node `fs` |

---

### 2.6 Repository layer (interfaces)

**Owns:** Contracts: `ProductRepository`, `CategoryRepository`, `UomRepository`, later `CartRepository`.

**Does not own:** Implementations, UI.

Lived next to application (TypeScript interfaces under `application/catalog/` and `application/cart/`). Implementations live in `infrastructure/`. There is no top-level `frontend/repositories/` tree.

---

### 2.7 Infrastructure / data layer

**Owns:** `StaticProductRepository`, `StaticCategoryRepository`, `StaticUomRepository` (Phase 1); `ApiProductRepository` etc. (Phase 2); browser cart storage adapter; mapping **raw static/API records → domain**.

**Does not own:** Use-case policy, JSX.

| May depend on | Must not depend on |
|---------------|-------------------|
| Domain, repository interfaces | Presentation, `app/` pages |

---

### 2.8 Configuration layer

**Owns:** Which repository implementation to bind (static vs HTTP), public site URL for canonicals, feature flags.

**Does not own:** Business rules. Pages must not `if (PHASE === 1) import json`.

---

### 2.9 Shared utilities

**Owns:** Pure helpers (slugify if not domain, date/format TBD, `cn` for class names if introduced).

**Does not own:** Hidden use cases or data access.

No new utility library in this task.

---

## 3. App Router responsibilities

| Artifact | Status after Sprint 1 |
|----------|------------------------|
| `app/` | Route tree only. Tokens live in `globals.css` (Tailwind v4 CSS-first; no separate `styles/` folder). |
| `layout.tsx` | Semantic shell via `StorefrontShell` (skip link, header logo, main, footer). Not the final Option 1 chrome. Server Component. Exports `metadata`. |
| `page.tsx` | Brand shell only. Does not call catalog services yet (Sprint 2). |
| Route segments `c/[slug]`, `p/[slug]`, `cart`, `checkout` | Later sprints |
| `loading.tsx` / `error.tsx` / `not-found.tsx` | Later |
| `generateMetadata` (dynamic), `sitemap.ts`, `robots.ts` | Metadata S3-T02; sitemap S3-T04; robots S3-T05 |

---

## 4. Server vs Client Components

**Default: Server Component.**

Use `"use client"` only when the component needs browser state or event handlers, for example:

- Add to cart, quantity, variant pickers
- Mobile menu open/close
- Search box client state
- Wishlist control
- Other interactive controls

**Rules:**

- Do not mark an entire catalog **page** as a Client Component.
- Keep client islands **small**; pass serializable props from the server parent.
- Crawlable product/category text and images stay on the server tree.
- Cart page: server shell + client island for lines/controls.

---

## 5. SEO boundary

Public product/category pages must remain crawlable.

| Concern | Owner |
|---------|--------|
| Title, description, canonical, OpenGraph | Application SEO helpers, invoked from `generateMetadata` |
| JSON-LD Product, BreadcrumbList, Organization | Product JSON-LD: `application/seo/product-structured-data.ts` (S3-T06). BreadcrumbList: `application/seo/breadcrumb-structured-data.ts` (S3-T07). Both render via `app/json-ld.tsx`. Organization later |
| Breadcrumb **UI** | Presentation, data from application |
| Sitemap, robots | `app/sitemap.ts` (S3-T04) calls `catalog.listIndexableUrls`; `app/robots.ts` (S3-T05) allows `/` and references `/sitemap.xml` via `config/site.ts` |
| Semantic headings, landmarks | Presentation + layouts |
| Image alt | View model from application/domain data — **not** the filename |
| Internal links | Presentation using `/c/{slug}`, `/p/{slug}` |

Do not copy-paste metadata objects in every `page.tsx`. Reuse helpers under `application/seo/`. Pages map those fields through `app/to-next-metadata.ts`.

Index: `/`, `/c/*`, `/p/*`. Do not index `/cart`, `/checkout`, admin.

Canonical **domain** TBD. Configure `NEXT_PUBLIC_SITE_URL`; `config/site.ts` is the source of truth and layout sets `metadataBase`. Legal name TBD; brand Mini Mystiq.

---

## 6. Design system boundary

**Option 1 only.** Green-led, white background, pastels, rounded, mobile-first. Logo: `mini-mystiq-logo.png`.

Organize reusable UI (created in later tasks, not now):

| Kind | Examples | Folder (target) |
|------|----------|-----------------|
| Primitives | Button, Input, Card, Badge, Modal, Container, Typography | `components/ui/` |
| Storefront composites | ProductCard, Price, ImageGallery, CategoryCircle, Hero | `components/storefront/` |

Primitives have **no** catalog fetching. `ProductCard` receives a product view model.

Do not invent another visual language.

**S1-T07 tokens:** CSS variables in `frontend/app/globals.css` (`--mm-*`), mapped into Tailwind v4 `@theme inline`. Primary `#016C37` sampled from Option 1. Hex values are **implementation defaults**, not a locked brand guide (`DESIGN_OPTION_1.md`).

Primitives: `components/ui/container.tsx`. Shell: `components/storefront/storefront-shell.tsx` (skip link, header logo + catalog nav props, main, footer). Search/wishlist/account/cart chrome is still not implemented.

---

## 7. Domain vs UI vs API models

| Model | Role |
|-------|------|
| **Domain** | `Product`, `Category`, `ProductVariant`, `Uom`, inventory status, `Cart`, `CartItem` — framework-free |
| **Raw / DTO** | Static fixture shape or FastAPI JSON — infrastructure only |
| **View model / UI props** | What components receive (display price string TBD, image `src` + `alt`, href) |

Never pass API/fixture DTOs into presentation. Infrastructure maps DTO → domain; application maps domain → view model.

### 7.1 Domain concepts (fields TBD except notes)

| Concept | Notes |
|---------|--------|
| Product | Identity, slug, name, description, images (SEO filenames), category id(s), uom, variant list TBD |
| Category | Identity, slug, name, optional image stand-in from `DESIGN_ASSETS.md` |
| ProductVariant | Size/color **TBD** — model the type even if Phase 1 data has a single default variant |
| Uom | Code + label; Phase 1 may be a simple field |
| Inventory status | Enum TBD (`in_stock` / `out_of_stock` / unknown) — display TBD |
| Cart | Collection of cart items + totals rules |
| CartItem | Product identity, quantity, selected variant id if any |

Navy/tan dresses: product image exists; **category TBD** — do not infer Kids/Teens/Women in domain data.

---

## 8. Repository interfaces (as implemented, S1-T05)

Phase 1: Application → interface → `Static*Repository` → static records under `infrastructure/catalog/data/`.  
Phase 2: same interface → `Api*Repository` → FastAPI (not created). Composition: `config/catalog.ts`.

Methods:

**ProductRepository**

- `getById(id): Promise<Product | null>`
- `getBySlug(slug): Promise<Product | null>`
- `list(): Promise<readonly Product[]>`
- `listByCategorySlug(slug): Promise<readonly Product[]>`
- `listFeatured(): Promise<readonly Product[]>` — returns `[]` until merchandising is decided
- `search` — **not** on the interface (behavior TBD)

**CategoryRepository**

- `getById(id): Promise<Category | null>`
- `getBySlug(slug): Promise<Category | null>`
- `list(): Promise<readonly Category[]>`

**UomRepository**

- `list(): Promise<readonly Uom[]>` — empty in Phase 1 fixtures
- `getByCode(code): Promise<Uom | null>`

Cart: `CartRepository` (client) — `get`, `save` — Sprint 4. Storage library **TBD**; do not add one in this task.

---

## 9. Application services (S1-T05 catalog queries)

Belong here (not in React):

- Get product by slug / id — **S1-T05**
- List products / by category — **S1-T05**
- Get category / list categories — **S1-T05**
- List featured products — **S1-T05** (returns empty until merchandising exists)
- Search / filter products (rules TBD)
- Build home page data — **S3-T01** `getHomePage` + `toHomePageViewModel` (hero/promo asset refs, category stand-ins, `list()` products; not `listFeatured()`)
- Cart: add, update qty, remove, read  

**S2-T01 / S2-T02:** `getCategoryPage(categories, products, slug)` returns `{ category, products }` or `null` (unknown slug). S2-T02 did not add a second listing use case.

**S2-T03:** `getProductPage(products, categories, slug)` returns `{ product, categories }` or `null`. Reuses `getProductBySlug`; does not add a second product lookup. Unresolved category ids are omitted.

**S2-T04:** `toCatalogNavItems(categories)` maps `listCategories()` to `{ label, href: /c/{slug} }`. Layout loads nav; `StorefrontShell` / `CatalogNavigation` / `Breadcrumbs` receive props only.

Pages call `config/catalog.ts`, not fixtures. View models map domain → presentation props (no price/inventory).

Test with in-memory fake repositories (runner: S1-T06). No JSX.

---

## 10. Cart boundary (Phase 1)

```
Cart UI (Client Component)
    ↓
Cart application service
    ↓
Cart domain (add/update/remove rules)
    ↓
Cart repository interface
    ↓
Browser storage adapter (localStorage or memory — TBD Sprint 4)
```

The cart UI **must not** read/write `localStorage` directly.

Phase 2/Sprint 7: HTTP `CartRepository`; same service API as far as practical.

---

## 11. Data mapping

```
Static fixture or API JSON
    → Infrastructure mapper
        → Domain model
            → Application service
                → View model / UI props
                    → React component
```

Image `src` in view models uses **SEO filenames** from `DESIGN_ASSETS.md`.

---

## 12. Error and loading

| Situation | Flow |
|-----------|------|
| Loading a route | `loading.tsx` (routing layer) |
| Empty list | Application returns `[]`; presentation empty state |
| Unknown slug | Application `null` → page `notFound()` → `not-found.tsx` |
| Repository failure | Typed application error → page error UI or `error.tsx` |
| Unexpected throw | `error.tsx` |
| Cart mutation failure | Service result → client island message |

Do not swallow errors in presentation.

---

## 13. Mobile-first constraint

Priority: **Mobile → Tablet → Desktop**. Desktop extends mobile.

**S1-T07 layout:** `--mm-space-page` (16 / 24 / 32px), `--mm-container-max` 72rem, logo `max-w` on the header image. `overflow-x-hidden` on `body` is a backstop; the shell itself has no min-width wider than the viewport. Catalog grids are Sprint 2 (must not rely on clipping alone).

Every storefront UI task: mobile layout, touch (no hover-only), responsive type/images, no horizontal scroll, mobile nav/listing/PDP/cart, performance, Core Web Vitals.

Admin (Phase 2): desktop-priority, still responsive.

Breakpoints: business **TBD**. S1-T07 uses Tailwind defaults as implementation defaults (`sm` 640 / `md` 768 / `lg` 1024). Nav pattern / CWV numbers: **TBD**. Hero LCP: `baby-sleeveless-sets-new-collection-banner.jpg`. Secondary: `baby-dress-bloomer-sets-new-collection-banner.jpg`.

---

## 14. Performance

- Server Components by default; minimize client JS  
- `next/image`; sized images; lazy-load below-fold; hero `priority`  
- Font loading via Next.js (when app exists) — no extra font library unless a task requires it  
- No unnecessary client state or new optimization libraries  
- Route-level code splitting (App Router default)  
- Core Web Vitals considered; numeric budgets TBD  

---

## 15. Accessibility (Definition of Done)

Semantic HTML; keyboard access; real buttons; labeled inputs; visible focus; meaningful alt; contrast; touch-friendly targets; screen-reader names on icon-only controls.

WCAG numeric target still **TBD** (proposed 2.2 AA — not approved).

---

## 16. Testing boundaries

**Runner (S1-T06):** Vitest 4, Node environment, no jsdom. Commands: `npm test` (CI), `npm run test:watch`.

**Convention:** colocate `*.test.ts` next to the module under test. Do not put unit tests under `app/` or `components/` until a UI testing task.

| Layer | Test | Tool |
|-------|------|------|
| Domain | Behavior that exists (e.g. `isCatalogSlug`). Do not invent validators for type-only models. | Vitest |
| Application | Use cases with in-memory fakes of repository **interfaces**. Must not import `infrastructure/catalog/data`. | Vitest |
| Repository | Static list/get/slug/featured/UOM via `Static*Repository` classes | Vitest |
| Components | Render + interaction of client islands | **TBD** (not Vitest/jsdom in S1-T06) |
| Pages | Optional integration | **TBD** |
| E2E | Browse category → PDP → cart (later) | **TBD** (not Playwright/Cypress in S1-T06) |

No coverage thresholds. No component or E2E framework in this task.

---

## 17. Folder structure (as implemented through S3-T07)

Compatible with S1-T01. Names `application` / `infrastructure` are the approved terms (not a parallel `services/` + `repositories/` tree).

**S1-T03:** Next.js 16 App Router at `frontend/app/` (no `src/`). Logo at `frontend/public/mini-mystiq-logo.png`.

**S1-T04:** Layer directories exist with boundary READMEs only.

**S1-T05:** Catalog domain types, repository interfaces, static repositories, and a small fixture set. Pages must not import `infrastructure/catalog/data`.

**S1-T06:** Vitest (`*.test.ts` colocated). **S1-T07:** `Container`, `StorefrontShell`, Option 1 `--mm-*` tokens.

**Not created (intentional):**

- Top-level `repositories/` — interfaces live under `application/` (this file §2.6).
- Top-level `types/` — domain types belong in `domain/`; view models beside application/presentation.
- `domain/product` and `domain/category` as sibling trees — catalog concepts are grouped under `domain/catalog/`.
- Nested `infrastructure/config/` — composition/env binding is top-level `config/` (§2.8).

These choices follow this contract. They are **not** an ADR.

```
frontend/
  app/                           # routing (S1-T03); README boundary (S1-T04)
    layout.tsx
    page.tsx                     # S3-T01 Option 1 homepage; S3-T02 metadata
    sitemap.ts                   # S3-T04 /sitemap.xml from catalog + site origin
    robots.ts                    # S3-T05 /robots.txt allow + sitemap reference
    to-next-metadata.ts          # S3-T02 Next.js Metadata adapter
    json-ld.tsx                  # S3-T06/S3-T07 JSON-LD script renderer
    not-found.tsx                # S2-T01
    c/[slug]/page.tsx            # S2-T01 category listing; S3-T07 BreadcrumbList
    p/[slug]/page.tsx            # S2-T03 product detail; S3-T06 Product JSON-LD; S3-T07 BreadcrumbList
    globals.css
  public/
    mini-mystiq-logo.png
    baby-sleeveless-sets-new-collection-banner.jpg
    baby-dress-bloomer-sets-new-collection-banner.jpg
    pink-white-pleated-baby-dress.jpg
    sage-striped-baby-top-and-shorts.jpg
    cream-grey-rose-tiered-baby-dress.jpg
    navy-star-and-tan-bow-dresses.jpg
    olive-green-patterned-dress.jpg
    beige-motif-pleated-dress.jpg
    grey-pinafore-baby-set.jpg
    dusty-blue-floral-dress.jpg
    cream-tiered-shirt-dress.jpg
    kids-striped-shirts-burgundy-and-sage.jpg
    kids-button-down-shirts-rose-and-burgundy.jpg
    kids-linen-shirts-brown-and-sage.jpg
  components/
    ui/container.tsx             # S1-T07
    storefront/storefront-shell.tsx
    storefront/product-card.tsx  # S2-T01; view-model props only
    storefront/product-detail.tsx # S2-T03; view-model props only
    storefront/breadcrumbs.tsx   # S2-T04; presentation items only
    storefront/catalog-navigation.tsx # S2-T04; presentation items only
    storefront/announcement-bar.tsx   # S3-T01
    storefront/home-*.tsx             # S3-T01 homepage sections
    storefront/trust-bar.tsx          # S3-T01
  config/
    catalog.ts                   # composition root (S1-T05)
    site.ts                      # S3-T03 canonical origin / metadataBase
  domain/
    catalog/                     # Product, Category, Uom — types in S1-T05
    cart/                        # Cart, CartItem — Sprint 4
  application/
    catalog/                     # use cases + repository interfaces (S1-T05)
    cart/
    seo/                         # metadata, listIndexableUrls, Product + BreadcrumbList JSON-LD; Organization later
  infrastructure/
    catalog/                     # Static*Repository — S1-T05
    cart/                        # browser storage adapter — Sprint 4
  lib/                           # shared technical utils only (empty aside from README)
```

**S2-T01:** `/c/[slug]` is a Server Component. The page calls `catalog.getCategoryPage(slug)` (composition root). It must not import fixtures or `Static*Repository`. Unknown slug → `notFound()`. BreadcrumbList JSON-LD is S3-T07.

**S2-T03:** `/p/[slug]` is a Server Component. The page calls `catalog.getProductPage(slug)`. Unknown slug → `notFound()`. Product JSON-LD is S3-T06. BreadcrumbList JSON-LD is S3-T07.

Future routes (`cart`, `checkout`) stay under `app/` when those sprints arrive.

---

## 18. Admin boundary (Phase 2)

- Separate from public storefront (route group or later app — ADR in S6-T04)
- Desktop-priority, responsive, authenticated, not indexed  
- Must not import storefront marketing pages as admin  
- May reuse `components/ui` primitives  
- Must not leak admin actions into public catalog components  
- No admin code in Phase 1  

---

## 19. Phase 1 → Phase 2

UI + application + domain + interfaces stay.  
`StaticProductRepository` replaced by `ApiProductRepository` in infrastructure + config.  
No page rewrite. ADR 0004.

---

## 20. TBD

- Exact domain fields, variants, inventory display  
- Search/filter rules (S2-T05 deferred; `CATALOG_FILTER_SORT.md`)  
- Cart storage API (`localStorage` vs memory)  
- Breakpoint px as a **business** lock (S1-T07 uses Tailwind sm/md/lg as implementation defaults)  
- CWV budgets, WCAG numeric target  
- Site URL, legal name  
- Admin host  
- Whether `search()` exists in Phase 1  

No ADR for S1-T08: the review confirmed the S1-T01/S1-T02 contract; it does not change it.

There is **no S1-T09**. There is **no S2-T08**. Sprint 2 is complete. S3-T01–S3-T07 are complete. Next: **S3-T08** — do not start automatically.
