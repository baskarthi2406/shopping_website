# Target Architecture

**Status:** Accepted for S1-T01; revised by S4-T01 and ADR 0005.
Significant changes require an ADR.

**Product:** Mini Mystiq — Baby Clothes & Toys  
**Tagline:** Delivering Style & Tech  
**Homepage UI:** Design Option 1 (`docs/project/DESIGN_OPTION_1.md`, ADR 0001)

---

## 1. Goals

- SEO-first, crawlable storefront
- Mobile-first (Mobile → Tablet → Desktop)
- SOLID, testable domain and application layers
- Static repositories replaced by dummy/API/Zoho-backed repositories **without
  a storefront rewrite**
- Backend: **modular monolith** (ADR 0003) — not microservices
- Vendor isolation: Zoho DTOs stay behind repository adapters (ADR 0005)
- Approved assets only (`docs/project/DESIGN_ASSETS.md`); logo `mini-mystiq-logo.png`

---

## 2. System overview

```
Current                         Planned
───────                         ───────
Next.js UI                      Next.js UI (same)
  → Application services         → Application services (same)
    → Repository interface         → Repository interface (same)
      → Static repository            → Dummy API repository (Sprint 4)
                                       → Production backend (Sprint 6)
                                       → Zoho adapter (Sprint 7)
```

One Git repository (`shopping/`). `frontend/` is implemented. `backend/`
contains documentation only; production implementation is scheduled for
Sprint 6.

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

| Domain | Current/planned storefront | Future production/integration |
|--------|--------------------|-----------------|
| Catalog (Product, Category, UOM) | Yes (static) | Yes |
| Cart | Commerce UI planned Sprint 5 | Persistence/workflow TBD Sprint 6/8 |
| Inventory | Contract planned S4-T08 | Production/Zoho integration S6–S7 |
| Ordering | No implementation | Sprint 8 |
| Identity / Customer | Navigation expectation only | Sprint 8 scope TBD |
| Admin / Audit | No implementation | Production/operations scope TBD |
| Marketing / CMS | No | Later; TBD |

Keep module folders aligned with these names so a domain can be extracted later **without** starting as microservices.

---

## 5. Repository swap

```
ProductRepository
CategoryRepository
CartRepository   (future; exact persistence contract TBD)
```

| Stage | Frontend implementation |
|-------|-------------------------|
| Current | `StaticProductRepository` / `StaticCategoryRepository` / `StaticUomRepository`; bound in `frontend/config/catalog.ts` |
| Sprint 4 | Dummy API repositories implementing stable Mini Mystiq contracts |
| Sprint 6 | Production API/backend repositories |
| Sprint 7 | Zoho-backed adapters behind the same application semantics |

Composition selects the implementation. **Do not** branch inside page files.
Raw dummy or Zoho DTOs do not cross infrastructure mappers (ADR 0005).

ADR 0004.

---

## 6. Current data flow

```
Next.js (Server Components for catalog)
  → Catalog application services
    → ProductRepository / CategoryRepository
      → Static repository
        → Static product/category data + SEO image paths from DESIGN_ASSETS.md
```

No API server, FastAPI, PostgreSQL, Zoho, auth, or admin implementation exists.

---

## 7. Planned API and integration flow

```
Next.js
  → same application services
    → same repository interfaces
      → HTTP repository
        → Mini Mystiq API contract
          → dummy implementation (Sprint 4)
          → production backend (Sprint 6)
              → Zoho anti-corruption adapter (Sprint 7)
```

Next.js **never** opens a DB connection.

---

## 8. Frontend (summary)

- Next.js App Router, React, TypeScript, Tailwind (ADR 0002)
- Server Components for catalog/SEO pages; Client Components for cart, search box, wishlist chrome, mobile nav
- Mobile-first; Design Option 1
- **Layer contract (S1-T02):** `FRONTEND_ARCHITECTURE.md` — pages → presentation → application → domain → repository interfaces; infrastructure implements repositories. No React → JSON/API.

---

## 9. Backend/API roadmap (summary)

- Sprint 4 defines stable contracts and dummy APIs; runtime/transport is TBD
  until S4-T03.
- Sprint 6 implements the production backend. Python + FastAPI + PostgreSQL and
  modular-monolith shape remain accepted (ADR 0003) unless superseded.
- Sprint 7 implements Zoho adapters. Vendor DTOs are infrastructure-only
  (ADR 0005).
- Audit evidence: `BACKEND_API_AUDIT.md`.

---

## 10. Admin

Future production/operations work. UI host and schedule are **TBD**. Admin stays
responsive, authenticated, and not indexed. Modules:
`docs/requirements/ADMIN_REQUIREMENTS.md`.

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
| Domain / application | Pure unit tests | Vitest (S1-T06); fakes for use cases |
| Static repositories | List/get/slug | Vitest (S1-T06) |
| UI | Optional component tests | Later; not configured |
| Dummy API | Contract/API tests with fakes | Sprint 4+ |
| Production backend | API + repository tests | Sprint 6+ |
| Zoho adapter | Mapper/contract tests; no real provider in CI | Sprint 7+ |

Documentation-only tasks: review, no runtime tests. Frontend unit runner is Vitest.

---

## 14. Security boundaries

- No secrets in Git
- Current: no customer auth; Account remains a navigation expectation only
- Future: auth at API; RBAC on admin; frontend does not talk to persistence
- Do not index cart, checkout, or admin
- Validate input at FastAPI boundaries
- PII rules TBD Sprint 8

---

## 15. Target folder structure

Frontend layer folders were created in **S1-T04**. Static catalog **S1-T05**,
Vitest **S1-T06**, tokens/shell **S1-T07**. Dummy API work starts only when its
Sprint 4 task is explicitly requested; production backend remains Sprint 6.

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
      catalog/              # static now; dummy/http adapters later
      cart/
    components/             # presentational, mobile-first
    config/
    lib/
  backend/                  # docs only now; production backend Sprint 6
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
| 0005 | Stable storefront contracts; dummy/Zoho adapters isolated |

---

## 17. TBD (do not invent)

- Domain, trailing slash, locales
- Exact Tailwind breakpoint px and CWV budgets
- Dummy API runtime, transport, pagination, and error envelope (S4-T03)
- ORM and migration tool (Sprint 6)
- Admin UI host and schedule
- Auth provider and scope (Sprint 8)
- Verified Zoho API shape/auth/rate limits/sync behavior (Sprint 7)
- Payment/email/shipping vendors (Sprint 9)
- Legal entity (wireframe “Enn2Gee”)
- Category data taxonomy vs Option 1 nav labels
- Standalone Option 1 lifestyle hero photo

See also: `FRONTEND_ARCHITECTURE.md`, `BACKEND_ARCHITECTURE.md`.
