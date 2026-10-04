# Enn2Gee Mini Mystiq

Repository: **shopping**

**Mini Mystiq** is a SEO-first, **mobile-first** storefront for baby clothes
and toys. The public brand is Mini Mystiq. The Zoho POS organization is
recorded as Enn2Gee Mini Mystiq. The legal entity name is not confirmed.

Tagline: **Delivering Style & Tech**

The application is **Next.js only** (React, TypeScript, Tailwind CSS). It is
built so a later Zoho POS integration can replace mock data without rewriting
the storefront. The verified normal catalog path is an in-memory **catalog
snapshot**: Zoho is read on a schedule, then pages read that snapshot.

Live status remains in `PROJECT_STATUS.md`, `SPRINT_STATUS.md`, and
`CURRENT_TASK.md`. This README summarizes that record. If they disagree, those
status files win.

---

## 1. Project overview

Customers should be able to find the store in search engines and browse a
controlled category tree through to a product and a variant.

| Choice | Decision |
|--------|----------|
| UI | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4 |
| Layout | Mobile → tablet → desktop |
| Application shape | One Next.js app. No separate backend (ADR 0006). `backend/` is a retired placeholder |
| Database | None selected (ADR 0008) |
| Catalog today | `CATALOG_PRODUCT_SOURCE=zoho-snapshot` serves the mapped snapshot. The code default remains `static` until that variable is set |
| Provider | Zoho POS / Zakya catalog, server-side only (ADR 0009) |

Approved logo and photos: `docs/project/DESIGN_ASSETS.md`. Homepage layout
follows Design Option 1 (`docs/project/DESIGN_OPTION_1.md`, ADR 0001).

---

## 2. Current storefront capabilities

These behaviors are implemented on the normal snapshot storefront. They are
not a promise that every Zoho product is published.

- **Homepage** — hero, category entry points, catalog product grid, promo,
  intro, and trust bar (Design Option 1).
- **Header and navigation** — Mini Mystiq category tree. Mobile uses a menu
  disclosure. Tablet and desktop use a category bar and mega-menu. Account and
  Track Your Order stay disabled. Cart links to `/cart`. Search is a real
  header field.
- **Taxonomy** — Mini Mystiq owns the storefront categories. A category page
  lists only its own products and links visible subcategories. Breadcrumbs
  include the ancestor trail.
- **Browse flow** — category → subcategory → product listing → product detail
  → variant.
- **Product cards** — image, name, and a price only when every variant shares
  one verified selling price. Otherwise the card says “Price not available.”
- **Product detail** — one URL per product. The shopper selects a real
  variant. The page then shows that variant’s SKU, verified selling price, and
  availability. There is no automatic variant selection.
- **Add to Cart** — shown when the selected variant has a verified price, is
  active, and has purchasable stock.
- **Cart** — browser-local lines for a product and variant, with quantity
  controls, a visible quantity, and a subtotal.
- **Checkout review** — customer name, mobile, and address, then a review of
  the same prices. It does not place an order or take payment.
- **Buy now** — adds the selected variant and opens that checkout review. It
  does not create an order.
- **Search** — header field on mobile and desktop, results at `/search`,
  links to existing `/p/[slug]` pages, and a no-results message.
- **Images** — server-side proxy at
  `/api/catalog-images/{itemId}/{documentId}`, with a safe fallback when an
  image is missing.
- **Responsive layout** — mobile-first. The header search was checked at a
  390px width and did not overflow.
- **SEO foundation** — unique titles and descriptions, canonical URLs,
  Open Graph, `/sitemap.xml`, `/robots.txt`, and JSON-LD for Product (without
  offers), BreadcrumbList, and Organization. Production domain is still TBD.
- **Demo catalog mode** — `CATALOG_PRODUCT_SOURCE=zoho-demo` publishes active,
  contract-valid Zoho products, including unmapped ones with no storefront
  category, for inspection at `/catalog`. That mode is separate from the
  frozen `/demo` order flow.

The static fixture catalog (12 approved products) is still the code default
and does not invent prices or variants.

---

## 3. Catalog and Zoho POS integration

```
Browser / UI
  → Next.js application
  → catalog / application layer
  → server-only Zoho integration
  → Zoho Inventory / Zakya catalog
```

Verified shape:

- Zoho credentials stay in server-only environment variables. The browser does
  not receive tokens, authorization headers, or Zoho URLs.
- A Zoho **item group** is a storefront product. A Zoho **item** is a variant.
- Mini Mystiq controls the storefront taxonomy. Zoho categories are mapped
  into that tree by Zoho category id, with a group override where a name is
  ambiguous. The mapping is partial: high-confidence rows plus the Girl Coord
  set override. Remaining placements wait on owner decision OD-6.
- Unmapped Zoho products are **not** published into normal storefront
  categories. `zoho-demo` can still list them, without a category, at
  `/catalog`.
- Pages do not call Zoho on each render. `zoho-snapshot` keeps an in-memory,
  per-process snapshot (background refresh, default 6 hours; a snapshot older
  than 24 hours is not served). The production build does not call Zoho.
- Product images are fetched server-side and served from the Mini Mystiq
  image route.
- The normal storefront does **not** create Zoho orders. The only recorded
  Zoho order is the frozen demo draft `SO-00001` from `/demo` (baseline
  `589b74a`). That flow is not production checkout. No invoice and no payment
  were created.

Sprint 6 feasibility is still in progress. Authentication passed. Read-only
catalog feasibility is partial and sufficient for the current snapshot.
Production gaps are listed in `docs/project/PRODUCTION-READINESS.md`.

---

## 4. Pricing

- The selling price is the verified Zoho field `rate`, in INR, when the
  catalog source is a Zoho source.
- A price is shown only after the existing provenance checks: the approved
  field, a valid amount, a fresh observation (24 hours), and the owning
  source. Stale, missing, and invalid rates stay hidden and block Add to Cart.
- When every variant has that same verified price, the product card shows it.
  When variants differ, the card says “Price not available.” There is no
  “From ₹…” price.
- After a variant is selected, that variant’s price is what the cart and the
  checkout review use.
- Checkout revalidation reports a price or stock change. It does not silently
  rewrite the cart.
- `label_rate` is not shown as MRP, compare-at, or savings. No discount is
  invented.
- Customer-facing GST is **unresolved** (`STOREFRONT_TAX_POLICY`). The
  storefront does not add tax, and it does not say the price includes or
  excludes GST. A demo Zoho order taxed 5% on top; that is not the storefront
  rule. Owner decisions OD-1 and OD-2 are still open.

---

## 5. Stock

- Purchase uses available-for-sale stock already on the catalog record.
- Zero stock shows out of stock and hides Add to Cart.
- A known quantity caps the cart line. The cart does not invent a limit when
  stock is unknown.
- Unknown stock is not labeled “In stock.”
- An inactive product or variant cannot be purchased.
- The storefront does not copy hosted scarcity copy such as “Only 2 left.” It
  uses the stock figure it actually has.
- Which location fulfils online orders, and what happens to the last unit, are
  still owner decisions (OD-3, OD-4).

---

## 6. Cart and checkout

- The cart lives in browser storage. It is not a Zoho cart.
- Each line is one product variant: identity, SKU, verified unit price,
  quantity, and known stock.
- Quantity controls stay within known available stock. Quantity is shown on
  the line (`Qty`).
- Subtotal is unit price × quantity. No GST and no shipping are added.
- Checkout collects name, mobile, and delivery address, then shows a review.
- The review re-reads the catalog. A changed price or stock is reported. The
  stored line is not rewritten.
- The review states that order submission is not connected.
- No Zoho order, payment, or production order confirmation is created from
  `/cart` or `/checkout`.

Homepage notices such as “Free Shipping on Orders above ₹999”, “Easy Returns”,
and “COD Available” are Design Option 1 copy. Whether the store honors them is
still TBD. Checkout does not calculate shipping.

---

## 7. Search

Header search is available on the homepage and on other storefront pages, on
mobile and desktop.

- It searches the catalog the storefront already loaded. The browser does not
  call Zoho.
- It matches the product name.
- It also matches a storefront category name, a product SKU, or a variant SKU
  **only when that text is already on the product record** passed to search.
- Results link to the existing product page `/p/[slug]`.
- An empty query asks for a product name. A query with no match says no
  products match.
- **Variant SKU search does not work on the normal storefront today.** Product
  lists omit variants, so a variant SKU such as `INS-8PA` is not in the search
  record. Searching the product name, or a mapped category name such as
  “In skirt”, does find the product.

There is no filter, sort, or typo-tolerant search.

---

## 8. SEO, responsive layout, and quality

Completed SEO work (Sprint 3, S3-T10 image optimization still deferred):

- Page metadata and canonical URLs for `/`, `/c/[slug]`, and `/p/[slug]`
- Open Graph review
- Sitemap and robots.txt
- Product, breadcrumb, and organization structured data, without invented
  offers or a legal name
- Unknown category and product URLs return 404 and `noindex`

The storefront is mobile-first. Header search at about 390px width fits on
one row without horizontal overflow. That check was manual for the search and
cart-quantity task, not a standing automated viewport suite.

Latest verified `npm test` result, from the storefront polish task:

| Check | Result |
|-------|--------|
| Unit tests | 95 files, 732 passed |
| Typecheck | Passed |
| Lint | Passed |
| Production build | Passed, including `/search` |
| 390px header search | Verified, no horizontal overflow |
| Cart quantity | Verified (`Qty` on the line) |

`npm run test:http` and `npm run test:boundary` exist (production HTTP status
and the server-only boundary). They were not re-run as part of that polish
verification. Automated tests do not call live Zoho.

---

## 9. Current verified status

| Area | Status |
|------|--------|
| Storefront foundation | Complete |
| Catalog integration | Complete for the current in-memory snapshot. Durable/shared snapshot is a production decision |
| Category → subcategory navigation | Complete on the Mini Mystiq tree. Zoho → storefront mapping is partial (OD-6) |
| Product and variant flow | Complete |
| Image proxy | Complete for the current snapshot. Production image cache and authorship remain open (OD-7) |
| Verified selling prices | Complete |
| Stock-aware cart | Complete for org-level available stock. Location and last-unit policy are open (OD-3, OD-4) |
| Checkout review | Complete. It does not place an order |
| Buy now | Complete as “add and open checkout review.” It does not place an order |
| Header search | Complete for product name, plus category or SKU text already on the record |
| Variant SKU search | Not available. Improvement, not a committed requirement |
| SEO foundation | Complete. Production domain is undecided |
| Zoho order creation | Pending. Only the frozen demo draft `SO-00001` exists |
| Payment | Pending |
| GST / tax policy | Business decision (OD-1, OD-2). Not a missing calculation in the current UI |
| Shipping and delivery calculation | Pending. Homepage shipping copy is not a calculated policy |
| Account and order tracking | Pending. Header entries stay disabled |
| Production hosting and snapshot refresh | Production decision (OD-9). Not chosen |
| Production monitoring and API budget | Pending. Reported Zoho quota is not verified |

---

## 10. Pending work

These groups follow the project’s decision records. They are **not** an
approved build queue. `CURRENT_TASK.md` is the only task that may be started.

### A. Business decisions

- GST treatment: whether `rate` is tax-inclusive, and what the shopper should
  see (OD-1, OD-2).
- Which location sells online, and what happens if two sales take the last
  unit (OD-3, OD-4).
- Payment method and when an order is confirmed (OD-5). Cash on delivery is
  not an implemented checkout method.
- Whether the current category tree and the remaining Zoho mappings are
  approved (OD-6).
- Whether Zoho item images are the production image source, and who writes
  alt text (OD-7).
- One shared online customer versus a Zoho contact per shopper (OD-8).
- Hosting and budget (OD-9).
- Shipping, returns, and the Design Option 1 service claims. Honor of that
  copy is still TBD.

### B. Commerce implementation

Not started for the normal storefront:

- Creating a real Zoho order from checkout.
- Payment collection.
- An order confirmation the customer can rely on.
- Inventory reservation and order synchronization.

Buy now already opens the review. Turning it into a placed order is part of
the order work above, not a separate button task.

### C. Customer features

Not started. Whether they are required is still an owner choice:

- Customer accounts.
- Track Your Order.
- Order history.
- Customer notifications.

### D. Search and catalog improvements

- Variant SKU search, if product lists should carry variant SKUs. Not
  committed.
- Richer search or filtering. Listing filter and sort were deferred in Sprint 2.
- A production catalog refresh that survives process restarts and serverless
  hosts. The current snapshot is in-memory and per process.

### E. Production readiness

Undecided or not built. See `docs/project/HOSTING-SNAPSHOT-DECISION.md` and
`docs/project/PRODUCTION-READINESS.md`.

- Hosting (long-running Node versus serverless).
- Production secrets and OAuth client. Local `.env` is not a production setup.
- Scheduled, durable catalog refresh and caching.
- Monitoring, logging, and alerts.
- Operational monitoring of the Zoho request budget. The 7,500 requests/month
  figure is reported, not verified.

---

## 11. Constraints

- Do not send Zoho credentials, tokens, or provider URLs to the browser.
- Do not call Zoho from browser code. Pages read the snapshot or the dummy API.
- Do not invent price, stock, SKU, tax, discount, shipping, or savings.
- Keep the Mini Mystiq category tree. Do not mirror the Zoho tree blindly.
- Product = Zoho item group. Variant = Zoho item.
- Do not publish an unmapped Zoho product into a normal category.
- Do not store a full provider payload in the client.
- Keep `/demo` (frozen order spike) separate from `zoho-demo` (catalog
  inspection) and from `zoho-snapshot` (normal storefront).
- Do not place a Zoho order, edit `SO-00001`, or change
  `STOREFRONT_TAX_POLICY` unless a task says so.
- No database and no separate backend unless ADR 0006 or ADR 0008 is amended
  and accepted.

---

## 12. Development and verification

From `frontend/`:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:http
npm run test:boundary
```

`npm run test:http` needs a production build first. It checks HTTP status for
the static catalog. `npm run test:boundary` checks that client bundles cannot
import server-only modules or secrets. Neither test calls Zoho.

Copy `frontend/.env.example` to a gitignored env file for local Zoho settings.
Never commit secrets. Public site origin, when set, is
`NEXT_PUBLIC_SITE_URL` via `config/site.ts`. Production hostname is TBD.

The latest verified unit-test result is **95 files, 732 passed**, with
typecheck, lint, and production build also passed, including `/search`. That
verification did not switch branches, push, merge, or amend an existing commit.

---

## 13. Milestones

| Milestone | What landed |
|-----------|-------------|
| Foundation | Project control, Next.js app, design tokens, semantic shell |
| Catalog | Categories, product listings, product pages, 12-product static catalog, dummy HTTP API |
| Product and variant | Purchasability rules, price and availability panel, variant selector, then real Zoho variants on the snapshot |
| SEO | Metadata, sitemap, robots, structured data |
| Server boundary | Next.js-only architecture, `server-only` isolation, catalog contract tests, field provenance, server-only Zoho client |
| Mapping and snapshot | Partial Zoho → Mini Mystiq category mapping, in-memory catalog snapshot, `zoho-demo` inspection mode |
| Price, stock, and images | Verified `rate`, stock-aware purchase, server-side image proxy. GST left unresolved |
| Cart and checkout | Browser cart and checkout review. No Zoho order from the normal storefront |
| Search and UI polish | Shared price typography, visible cart quantity, header search |

Useful recorded commits already in the status docs:

- `589b74a` — frozen `/demo` order baseline (`SO-00001`)
- `4478477` — interim catalog snapshot

Sprint index: `SPRINT_STATUS.md` and `docs/sprints/`. Architecture decisions:
`docs/decisions/`.

---

## Repository structure

```
shopping/
├── PROJECT_DEVELOPMENT_RULES.md
├── PROJECT_STATUS.md
├── CURRENT_TASK.md
├── SPRINT_STATUS.md
├── README.md
├── docs/
│   ├── project/
│   ├── architecture/
│   ├── requirements/
│   ├── sprints/
│   └── decisions/
├── .cursor/rules/
├── frontend/          # Next.js storefront
└── backend/           # Retired placeholder (ADR 0006)
```

---

## How development works

1. One task at a time (`CURRENT_TASK.md`).
2. Workflow: Plan → Implement → Test → Review → Document → Update status → Commit → **Stop**.
3. Never start the next task automatically.
4. Git documentation and source are the source of truth. Do not use previous chat history.

Continuation order for a new session:

1. `PROJECT_DEVELOPMENT_RULES.md`
2. `PROJECT_STATUS.md`
3. `SPRINT_STATUS.md`
4. `CURRENT_TASK.md`
5. `docs/architecture/` and `docs/decisions/` as relevant
6. `docs/requirements/` as relevant
7. The current sprint file in `docs/sprints/`
8. `.cursor/rules/`
9. Existing source code

Then implement **only** the current task.

---

## Phase roadmap

| Phase | Name | Sprints | Status |
|-------|------|---------|--------|
| Bootstrap | Project control | S0 | Complete |
| 1 | Storefront, dummy API, commerce UI | S1–S5 | Complete for the approved track. Sprint 5 Track B task ids stay deferred; cart and checkout arrived later as owner requests |
| 2 | Next.js server-side foundation and Zoho | S6–S8 | Sprint 6 in progress. S6-T03–S6-T10 (separate backend) withdrawn |
| 3 | Commerce | S9 | Not started |
| 4 | Digital marketing | S10 | Not started |
| 5 | Production | S11 | Not started. Hosting is undecided |
