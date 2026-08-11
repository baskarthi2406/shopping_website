# Frontend Architecture — Layer Boundaries

**Task:** S1-T02 (documentation only). **Do not initialize Next.js until S1-T03.**

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

**Owns:** `src/app` route tree, URL segments, layouts, `loading.tsx`, `error.tsx`, `not-found.tsx`, `generateMetadata` **calls**, sitemap/robots **routes**.

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

Lived next to application (TypeScript interfaces). Implementations live in infrastructure.

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

## 3. App Router responsibilities (not implemented)

| Artifact | Responsibility |
|----------|----------------|
| `app/` | Route tree only |
| `layout.tsx` | Shell: announcement, header, footer, fonts; semantic `header`/`main`/`footer` |
| `page.tsx` | Thin page: call services, render presentation |
| Route segments | `c/[slug]`, `p/[slug]`, `cart`, `checkout` |
| Dynamic routes | Resolve slug via application; `notFound()` if missing |
| `loading.tsx` | Route-level pending UI |
| `error.tsx` | Unexpected render/request errors (client boundary) |
| `not-found.tsx` | Unknown routes and unknown slugs |
| `generateMetadata` | Calls SEO helpers + catalog services |
| `sitemap.ts` | Indexable URLs from catalog services |
| `robots.ts` | Allow catalog; disallow cart/checkout/admin; sitemap link |

Do not implement these files in S1-T02.

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
| JSON-LD Product, BreadcrumbList, Organization | Application SEO builders; page renders `<script type="application/ld+json">` |
| Breadcrumb **UI** | Presentation, data from application |
| Sitemap, robots | `app` routes calling application/catalog |
| Semantic headings, landmarks | Presentation + layouts |
| Image alt | View model from application/domain data — **not** the filename |
| Internal links | Presentation using `/c/{slug}`, `/p/{slug}` |

Do not copy-paste metadata objects in every `page.tsx`. Reuse helpers under `application/seo/` (name TBD at S1-T04).

Index: `/`, `/c/*`, `/p/*`. Do not index `/cart`, `/checkout`, admin.

Canonical **domain** TBD (`NEXT_PUBLIC_SITE_URL`). Legal name TBD; brand Mini Mystiq.

---

## 6. Design system boundary

**Option 1 only.** Green-led, white background, pastels, rounded, mobile-first. Logo: `mini-mystiq-logo.png`.

Organize reusable UI (created in later tasks, not now):

| Kind | Examples | Folder (target) |
|------|----------|-----------------|
| Primitives | Button, Input, Card, Badge, Modal, Container, Typography | `components/ui/` |
| Storefront composites | ProductCard, Price, ImageGallery, CategoryCircle, Hero | `components/storefront/` |

Primitives have **no** catalog fetching. `ProductCard` receives a product view model.

Do not invent another visual language. Exact hex in first UI task from Option 1.

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

## 8. Repository interfaces (not implemented)

Phase 1: Application → interface → `Static*Repository` → static data.  
Phase 2: same interface → `Api*Repository` → FastAPI.

Suggested methods (refine in S1-T05):

**ProductRepository**

- `getBySlug(slug): Promise<Product | null>`
- `list(query?: ListProductsQuery): Promise<Product[]>`
- `listByCategorySlug(slug): Promise<Product[]>`
- `listFeatured(): Promise<Product[]>`
- `search(query: string): Promise<Product[]>` — behavior TBD if search is later

**CategoryRepository**

- `getBySlug(slug): Promise<Category | null>`
- `list(): Promise<Category[]>`

**UomRepository**

- `list(): Promise<Uom[]>`
- `getByCode(code): Promise<Uom | null>`

Cart: `CartRepository` (client) — `get`, `save` — Sprint 4. Storage library **TBD**; do not add one in this task.

---

## 9. Application services (not implemented)

Belong here (not in React):

- Get product by slug  
- List products / by category  
- Get category / list categories  
- Search / filter products (rules TBD)  
- Get featured products  
- Build home page data (hero refs, category stand-ins, featured)  
- Cart: add, update qty, remove, read  

Catalog use cases for **Sprint 2** (high level): list categories, list products in a category, get product by slug, 404 on unknown slug.

Test with in-memory fake repositories. No JSX.

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

Every storefront UI task: mobile layout, touch (no hover-only), responsive type/images, no horizontal scroll, mobile nav/listing/PDP/cart, performance, Core Web Vitals.

Admin (Phase 2): desktop-priority, still responsive.

Breakpoints / nav pattern / CWV numbers: **TBD**. Hero LCP: `baby-sleeveless-sets-new-collection-banner.jpg`. Secondary: `baby-dress-bloomer-sets-new-collection-banner.jpg`.

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

| Layer | Test | Tool |
|-------|------|------|
| Domain | Invariants, cart math, slugs | Unit — runner **TBD** S1-T06 |
| Application | Use cases with fakes | Unit |
| Repository | Static list/get/slug | Unit |
| Components | Render + interaction of client islands | **TBD** |
| Pages | Optional integration | **TBD** |
| E2E | Browse category → PDP → cart (later) | **TBD** |

Do not add a test framework in S1-T02.

---

## 17. Target folder structure (do not create yet)

Compatible with S1-T01. Names `application` / `infrastructure` are the approved terms (not a parallel `services/` + `repositories/` tree).

```
frontend/
  src/
    app/                         # routing layer
      layout.tsx
      page.tsx
      c/[slug]/page.tsx
      p/[slug]/page.tsx
      cart/
      checkout/
      sitemap.ts
      robots.ts
    domain/
      catalog/
      cart/
    application/
      catalog/
      cart/
      seo/
    infrastructure/
      catalog/                   # static now; api later
      cart/
      config/
    components/
      ui/
      storefront/
    lib/                         # shared utils only
    styles/
```

If the Next.js scaffold uses `frontend/app` instead of `frontend/src/app`, keep domain/application/infrastructure **outside** the route folder (S1-T04).

Do not add `types/` as a dump; prefer domain + view-model types beside their layer.

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
- Search/filter rules  
- Cart storage API (`localStorage` vs memory)  
- Test/lint tools (S1-T06)  
- Breakpoint px, CWV budgets, WCAG target  
- Site URL, legal name  
- Admin host  
- Whether `search()` exists in Phase 1  

No ADR for this task: it specifies S1-T01 decisions; it does not change them.
