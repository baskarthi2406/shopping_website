# Target Architecture

**Status:** Accepted for S1-T01; revised through S4-T03, ADR 0005, and
ADR 0006 (Next.js-only, S6-T02).
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
- One **Next.js application** owns UI and server-side functionality
  (ADR 0006); no separate backend service
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
      → Static repository            → Dummy API repository (Sprint 4, current)
                                       → Server-side foundation (Sprint 6)
                                       → Zoho adapter, server-only (Sprint 7)
```

One Git repository (`shopping/`). `frontend/` contains the storefront, the
read-only dummy catalog Route Handlers, and all future server-side code.
`backend/` is a retired documentation placeholder (ADR 0006).

---

## 3. Layers and dependency direction

```
Interface (Next.js pages / Route Handlers)
        ↓
Application (use cases, repository interfaces)
        ↓
Domain (entities, value objects, rules)
        ↑
Infrastructure (static data, API client, future server-only provider adapters)
```

| Layer | May depend on | Must not depend on |
|-------|----------------|--------------------|
| Domain | Nothing (language types only) | Next.js, React, Tailwind, SQL, fetch, provider SDKs |
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
| Cart | Track B deferred (Sprint 5) | Persistence/workflow TBD (Sprint 8; ADR 0008) |
| Inventory | Provider-independent snapshot contract (S4-T03) | Zoho integration Sprint 7 |
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
| Sprint 6 | Server-only boundary, contract tests, provenance rules, outbound request policy (no provider) |
| Sprint 7 | Zoho-backed server-only adapters behind the same application semantics |

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

No provider integration, database, Zoho, auth, or admin implementation
exists.

S4-T04/S4-T05/S4-T06 additionally expose separate development paths without changing
UI data access:

```text
GET /api/categories
  → getCategoryCollection
    → CategoryRepository
      → StaticCategoryRepository
        → approved static category records

GET /api/products?page={page}&pageSize={pageSize}
  → getProductCollection
    → ProductRepository
      → StaticProductRepository
        → approved static product records

GET /api/products/{slug}
  → getProductDetail
    → ProductRepository
      → StaticProductRepository
        → approved static product records
```

---

## 7. Planned API and integration flow

```
Next.js (single application, ADR 0006)
  → same application services
    → same repository interfaces
      → implementation selected in config/
        → Mini Mystiq API contract
          → dummy implementation (Sprint 4, default)
          → server-only Zoho anti-corruption adapter (Sprint 7), reading a
            cache/snapshot refreshed under a request budget (ADR 0009)
```

No database is selected (ADR 0008). If one is approved later, only server-only
infrastructure may access it; browser code never does.

S4-T03 defines recursive category, product summary/detail, generic variant,
nullable pricing/inventory/SKU/UOM, minimal product pagination, and
provider-independent error contracts. S4-T08 finalized money and inventory
invariants without populating catalog commerce values. S4-T09 connected
storefront pages to the dummy category/product APIs through a provider-neutral
client. S4-T10 added loading, sanitized catalog errors, not-found, and empty
collection states. See `STOREFRONT_CONTRACTS.md`.

---

## 8. Frontend (summary)

- Next.js App Router, React, TypeScript, Tailwind (ADR 0002)
- Server Components for catalog/SEO pages; Client Components for cart, search box, wishlist chrome, mobile nav
- Mobile-first; Design Option 1
- **Layer contract (S1-T02):** `FRONTEND_ARCHITECTURE.md` — pages → presentation → application → domain → repository interfaces; infrastructure implements repositories. Storefront pages use dummy API HTTP repositories; they must not import fixtures.

---

## 9. Backend/API roadmap (summary)

- Sprint 4 defines stable contracts and dummy APIs. The S4-T03 contracts are
  transport-neutral. S4-T04 selected existing Next.js route handlers for the
  development API and implemented `GET /api/categories`; production remains
  independent.
- ADR 0006 (S6-T02) supersedes ADR 0003: no FastAPI service; server-side
  functionality stays in Next.js. Sprint 6 builds provider-independent server
  foundations; persistence is undecided (ADR 0008).
- Sprint 7 implements Zoho adapters as server-only Next.js modules. Vendor DTOs
  are infrastructure-only (ADR 0005); access policy in ADR 0009.
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
| Server-only boundary | Import-boundary tests; build-output secret check | Sprint 6+ |
| Catalog contract | Conformance tests reusable by any implementation | Sprint 6+ |
| Zoho adapter | Mapper/contract tests; no real provider in CI | Sprint 7+ |

Documentation-only tasks: review, no runtime tests. Frontend unit runner is Vitest.

---

## 14. Security boundaries

- No secrets in Git
- Current: no customer auth; Account remains a navigation expectation only
- Future: auth and RBAC in Next.js server code (Sprint 8 ADR); browser code
  never talks to persistence or providers
- Provider credentials only in server-only modules via non-`NEXT_PUBLIC_`
  environment variables (ADR 0009)
- Do not index cart, checkout, or admin
- Validate input at Route Handler boundaries and provider responses in adapters
- PII rules TBD Sprint 8

---

## 15. Target folder structure

Frontend layer folders were created in **S1-T04**. Static catalog **S1-T05**,
Vitest **S1-T06**, tokens/shell **S1-T07**. Dummy API work starts only when its
Sprint 4 task is explicitly requested. Server-side code stays in `frontend/`
(ADR 0006).

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
      catalog/              # static repos, API client, HTTP repositories
      cart/
                            # future: zoho/ (server-only adapter, Sprint 7)
    components/             # presentational, mobile-first
    config/                 # composition root (server-only)
    lib/
  backend/                  # retired placeholder README only (ADR 0006)
  public/                   # current approved assets (SEO names)
  docs/
```

---

## 16. ADRs

| ID | Decision |
|----|----------|
| 0001 | Design Option 1 homepage |
| 0002 | App Router + Server Components for catalog |
| 0003 | Modular monolith backend — **superseded by 0006** |
| 0004 | Repository interfaces; static → HTTP without UI rewrite |
| 0005 | Stable storefront contracts; dummy/Zoho adapters isolated |
| 0006 | Next.js-only application; no separate backend |
| 0007 | Field ownership and provenance (Proposed) |
| 0008 | Persistent storage — none in Sprint 6 (Proposed) |
| 0009 | Server-side provider access policy (Proposed) |

---

## 17. TBD (do not invent)

- Domain, trailing slash, locales
- Exact Tailwind breakpoint px and CWV budgets
- Remaining product endpoint/query mapping and default product page size
- Whether any persistent store is needed, and which (ADR 0008)
- Hosting provider and runtime model; whether `/api/*` stays public in production
- Admin UI host and schedule
- Auth provider and scope (Sprint 8)
- Verified Zoho API shape/auth/rate limits/sync behavior (Sprint 7)
- Payment/email/shipping vendors (Sprint 9)
- Legal entity (wireframe “Enn2Gee”)
- Category data taxonomy vs Option 1 nav labels
- Standalone Option 1 lifestyle hero photo

See also: `FRONTEND_ARCHITECTURE.md`, `BACKEND_ARCHITECTURE.md`.
