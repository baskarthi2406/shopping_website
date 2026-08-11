# Target Architecture

**Status:** Accepted for S1-T01 (documentation). Implementation starts in later Sprint 1 tasks.  
Significant changes require an ADR.

**Product:** Mini Mystiq — Baby Clothes & Toys  
**Tagline:** Delivering Style & Tech  
**Homepage UI:** Design Option 1 (`docs/project/DESIGN_OPTION_1.md`, ADR 0001)

---

## 1. Goals

- SEO-first, crawlable storefront
- Mobile-first (Mobile → Tablet → Desktop)
- SOLID, testable domain and application layers
- Phase 1 static repositories replaced in Phase 2 by API repositories **without a storefront rewrite**
- Backend: **modular monolith** (ADR 0003) — not microservices
- Approved assets only (`docs/project/DESIGN_ASSETS.md`); logo `mini-mystiq-logo.png`

---

## 2. System overview

```
Phase 1                          Phase 2
───────                          ───────
Next.js UI                       Next.js UI  (same)
  → Application services           → Application services  (same)
    → Repository interface           → Repository interface  (same)
      → Static repository              → HTTP repository
                                           → FastAPI modular monolith
                                             → Application / Domain
                                               → SQL repository
                                                 → PostgreSQL
```

One Git repository (`shopping/`). Apps: `frontend/` (Phase 1+), `backend/` (Phase 2).

---

## 3. Layers and dependency direction

```
Interface (Next.js pages / FastAPI routers)
        ↓
Application (use cases, repository interfaces)
        ↓
Domain (entities, value objects, rules)
        ↑
Infrastructure (static data, HTTP client, PostgreSQL)
```

| Layer | May depend on | Must not depend on |
|-------|----------------|--------------------|
| Domain | Nothing (language types only) | Next.js, React, Tailwind, FastAPI, SQL, fetch |
| Application | Domain | UI, ORM, route files |
| Infrastructure | Domain + application interfaces | UI components |
| Interface | Application | SQL, fixture JSON, other apps’ internals |

**Rule:** UI and HTTP adapters call application services. They never import static JSON or SQL models.

---

## 4. Domain boundaries

Logical domains (modules). Not services.

| Domain | Phase 1 storefront | Phase 2 backend |
|--------|--------------------|-----------------|
| Catalog (Product, Category, UOM) | Yes (static) | Yes |
| Cart | Client-side (Sprint 4) | Persisted (Sprint 7) |
| Inventory | Display **TBD** | Sprint 7 |
| Ordering | Checkout shell only | Sprint 7–9 |
| Identity / Customer | Header chrome only | Sprint 8 |
| Admin / Audit | No | Sprint 6–8 |
| Marketing / CMS | No | Later; TBD |

Keep module folders aligned with these names so a domain can be extracted later **without** starting as microservices.

---

## 5. Repository swap

```
IProductRepository
ICategoryRepository
ICartRepository   (Phase 1: client storage; Phase 2: HTTP)
```

| Phase | Frontend implementation |
|-------|-------------------------|
| 1 | `StaticProductRepository` / `StaticCategoryRepository` / `StaticUomRepository` (S1-T05); bound in `frontend/config/catalog.ts` |
| 2 | `HttpProductRepository` calling FastAPI; same method signatures |

Composition (env or config) selects the implementation. **Do not** branch inside page files.

ADR 0004.

---

## 6. Phase 1 data flow

```
Next.js (Server Components for catalog)
  → Catalog application services
    → IProductRepository / ICategoryRepository
      → Static repository
        → Static product/category data + SEO image paths from DESIGN_ASSETS.md
```

No FastAPI, no PostgreSQL, no admin implementation.

---

## 7. Phase 2 data flow

```
Next.js
  → same application services
    → same repository interfaces
      → HTTP repository (API client)
        → FastAPI (modular monolith)
          → application / domain
            → repository interface
              → PostgreSQL
```

Next.js **never** opens a DB connection.

---

## 8. Frontend (summary)

- Next.js App Router, React, TypeScript, Tailwind (ADR 0002)
- Server Components for catalog/SEO pages; Client Components for cart, search box, wishlist chrome, mobile nav
- Mobile-first; Design Option 1
- **Layer contract (S1-T02):** `FRONTEND_ARCHITECTURE.md` — pages → presentation → application → domain → repository interfaces; infrastructure implements repositories. No React → JSON/API.

---

## 9. Backend (summary)

- Python + FastAPI + PostgreSQL
- **Modular monolith**, one deployable, one database
- Thin routers; domain in modules
- Details: `BACKEND_ARCHITECTURE.md`, ADR 0003

---

## 10. Admin

Phase 2. Same backend application services. UI host **TBD** (ADR in Sprint 6). Desktop-priority, still responsive. Not indexed. Modules: `docs/requirements/ADMIN_REQUIREMENTS.md`.

---

## 11. SEO architecture

First-class. Default URL shapes (implement Sprint 2–3; change only via ADR):

| Page | Path | Indexed |
|------|------|---------|
| Home | `/` | Yes |
| Category | `/c/{categorySlug}` | Yes |
| Product | `/p/{productSlug}` | Yes |
| Cart | `/cart` | No |
| Checkout | `/checkout` | No |
| Admin | TBD Phase 2 | No |

Also: `generateMetadata`, canonicals, sitemap, `robots.txt`, Product / BreadcrumbList / Organization JSON-LD, OpenGraph, Next.js `Image`, semantic HTML, internal links. Catalog HTML from the server.

Canonical **domain** TBD. Organization legal name TBD (brand Mini Mystiq).

Details: `docs/requirements/SEO_REQUIREMENTS.md`.

---

## 12. Mobile-first architecture

Mandatory for the storefront. Priority: **Mobile → Tablet → Desktop**.

Every storefront UI task: mobile layout, touch, responsive type/images, no horizontal scroll, mobile nav/listing/PDP/cart, performance, Core Web Vitals.

Desktop extends mobile. Admin may be desktop-first but responsive.

Breakpoints / nav pattern / CWV numbers: **TBD** (Tailwind defaults when UI starts, then document).

---

## 13. Testing architecture

| Layer | What to test | When |
|-------|----------------|------|
| Domain / application | Pure unit tests | S1-T05+ |
| Static repositories | List/get/slug | S1-T05 |
| UI | Optional component tests | S1-T06+ |
| FastAPI | API + repository tests | Sprint 5+ |

Documentation-only tasks: review, no runtime tests. Tooling TBD in S1-T06.

---

## 14. Security boundaries

- No secrets in Git
- Phase 1: no customer auth; Account/Wishlist icons are chrome (behavior TBD)
- Phase 2: auth at API; RBAC on admin; frontend does not talk to Postgres
- Do not index cart, checkout, or admin
- Validate input at FastAPI boundaries
- PII rules TBD Sprint 8

---

## 15. Target folder structure

Frontend layer folders were created in **S1-T04** (boundary READMEs; no catalog code). Backend remains Sprint 5+.

As implemented, Next.js routes are `frontend/app/` (no `src/`). Domain, application, infrastructure, components, config, and lib sit beside `app/`. Details: `FRONTEND_ARCHITECTURE.md` §17.

```
shopping/
  frontend/                 # Next.js app (S1-T03+)
    app/                    # routes, layouts, metadata (thin)
    domain/
      catalog/
      cart/
    application/
      catalog/
      cart/
      seo/
    infrastructure/
      catalog/              # static/ now; http/ in Phase 2
      cart/
    components/             # presentational, mobile-first
    config/
    lib/
  backend/                  # FastAPI modular monolith (Sprint 5+)
    app/
      api/                  # routers by module
      modules/
        catalog/
        inventory/
        ordering/
        identity/
      shared/
  public/                   # current approved assets (SEO names)
  docs/
```

---

## 16. ADRs

| ID | Decision |
|----|----------|
| 0001 | Design Option 1 homepage |
| 0002 | App Router + Server Components for catalog |
| 0003 | Modular monolith backend (not microservices) |
| 0004 | Repository interfaces; static → HTTP without UI rewrite |

---

## 17. TBD (do not invent)

- Domain, trailing slash, locales
- Exact Tailwind breakpoint px and CWV budgets
- ORM, migration tool, API error envelope (Sprint 5)
- Admin UI host (Sprint 6)
- Auth provider (Sprint 8)
- Payment/email/shipping vendors (Sprint 9)
- Legal entity (wireframe “Enn2Gee”)
- Category data taxonomy vs Option 1 nav labels
- Standalone Option 1 lifestyle hero photo

See also: `FRONTEND_ARCHITECTURE.md`, `BACKEND_ARCHITECTURE.md`.
