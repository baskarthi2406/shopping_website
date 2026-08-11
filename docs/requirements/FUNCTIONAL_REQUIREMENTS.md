# Functional Requirements

Only decided capabilities are listed as requirements. Everything else is **TBD**.

---

## Phase 1 — Storefront (decided direction)

The public site must eventually allow visitors to:

1. Land on a storefront home page matching **Design Option 1** (`docs/project/DESIGN_OPTION_1.md`). Copy in that spec is intended homepage copy.
2. Browse categories shown in Option 1: Baby Essentials, Infants, Kids, Teens, Women (plus New Arrivals, Offers in nav). Data model / catalog completeness **TBD**.
3. Browse product listings.
4. View product details.
5. Use SEO-friendly, crawlable catalog URLs.
6. Manage a cart (add/update/remove). Checkout payment is **not** Phase 1.
7. Use the storefront comfortably on a phone (mobile-first). See `MOBILE_REQUIREMENTS.md`.

## Catalog (partially decided)

- Products belong to categories.
- Units of measure (UOM) are a planned domain concept (needed in Phase 2 admin; Phase 1 mock data may include a simple UOM field).
- Product attributes beyond name, description, images, price display, and category: **TBD**.
- Variants (size/color): **TBD**.
- Stock display on the storefront: **TBD**.

## Cart (Phase 1)

- Client-side cart for storefront completion (Sprint 4).
- Guest vs authenticated cart: **TBD** (auth is Phase 2).
- Promo codes: **TBD** (coupons in later admin; commerce rules TBD).

## Phase 2 — Backend capabilities (planned, not specified in detail)

- Persist products, categories, UOM, inventory, carts, orders, customers.
- Admin management of those entities.
- Authentication, RBAC, audit logs.

Exact workflows, statuses, and business rules: **TBD**.

## Phase 3 — Commerce

Payment, email, messaging, shipping: **TBD** (providers and rules).

## Phase 4 — Marketing

Segmentation, campaigns, analytics: **TBD**.

## Non-goals for Phase 1

- FastAPI
- PostgreSQL
- Admin UI
- Payments
- Customer accounts
