# Functional Requirements

Only decided capabilities are listed as requirements. Everything else is **TBD**.

---

## Phase 1 — Storefront (decided direction)

The public site must eventually allow visitors to:

1. Land on a storefront home page matching **Design Option 1** (`docs/project/DESIGN_OPTION_1.md`). Copy in that spec is intended homepage copy.
2. Browse prominent ecommerce navigation for Baby Essentials, Infants, Kids,
   Teens, and Women. The customer reference includes deeper hierarchy such as
   Infants → Baby Girl/Baby Boy → product subcategories. Exact complete
   taxonomy/order remains **TBD** and must come from data, not React constants.
3. Browse product listings.
4. View product details.
5. Use SEO-friendly, crawlable catalog URLs.
6. Eventually access Search, Account, Cart, and Track Your Order from customer
   navigation. Their behavior is scheduled separately and remains **TBD** until
   the corresponding task.
7. Use the storefront comfortably on a phone (mobile-first). See `MOBILE_REQUIREMENTS.md`.

## Catalog (partially decided)

- Products may belong to one or more categories; exact cardinality and
  descendant-listing behavior are **TBD**.
- Categories require parent/child hierarchy, visibility, and menu-display
  semantics. S4-T02 implements these in the domain/static repository and
  recursive UI; S4-T03 will formalize transport contracts.
- Units of measure (UOM) are a planned domain concept (needed in Phase 2 admin; Phase 1 mock data may include a simple UOM field).
- Product attributes beyond name, description, images, price display, and category: **TBD**.
- Variants (size/color): **TBD**.
- Stock display on the storefront: **TBD**.
- Listing filter/sort: **TBD**. S2-T05 deferred this; see `CATALOG_FILTER_SORT.md`. Do not invent facets.
- Phase 1 static catalog (S2-T06, reviewed S2-T07): 12 approved product photos. Toys pending assets. Five dresses remain uncategorized (age/taxonomy TBD). Infants/teens/women may stay empty.

## Commerce UI (Sprint 5)

- Cart/application persistence contract: **TBD**.
- Guest vs authenticated cart: **TBD**.
- Promo codes: **TBD** (coupons in later admin; commerce rules TBD).

## API/backend capabilities (planned, not specified in detail)

- Sprint 4: stable API/domain contracts and dummy category/product APIs.
- Sprint 6: production API and persistence.
- Sprint 7: Zoho POS integration behind repository adapters.
- Sprint 8: approved orders, checkout, account/auth, and operations workflows.

Exact workflows, statuses, and business rules: **TBD**.

## Phase 3 — Commerce

Payment, email, messaging, shipping: **TBD** (providers and rules).

## Phase 4 — Marketing

Segmentation, campaigns, analytics: **TBD**.

## Non-goals for S4-T01

- FastAPI
- PostgreSQL
- Dummy API implementation
- Zoho integration
- Admin UI
- Payments
- Customer accounts
