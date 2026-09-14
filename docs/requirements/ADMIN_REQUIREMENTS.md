# Admin Requirements

**Admin implementation belongs to future production/operations work.** Do not
build admin UI or admin APIs unless the current task explicitly schedules them.

Module list is a **roadmap**, not a Sprint 1 backlog. Workflows, fields, and permissions are **TBD**.

---

## Planned modules

| Module | Intent | Earliest sprint (planned) |
|--------|--------|---------------------------|
| Dashboard | Operational overview | TBD (after core entities exist) |
| Products | Create/edit catalog products | TBD after production backend |
| Categories | Catalog taxonomy | TBD after production backend |
| UOM | Units of measure | TBD after production backend |
| Inventory | Stock levels / movements TBD | TBD after S7 integration |
| Orders | Order operations | Sprint 8 or later |
| Customers | Customer records | Sprint 8 |
| Coupons | Promotions TBD | Sprint 9 (or later) |
| Content | Storefront content TBD | TBD |
| SEO | Admin-editable SEO fields TBD | TBD (storefront SEO is Phase 1 Sprint 3) |
| Media | Images/files | TBD (needed with products) |
| Users/Roles | RBAC | Sprint 8 |
| Audit Logs | Who changed what | Sprint 8 |
| Settings | Site configuration TBD | TBD |

## Rules

- Admin must not be publicly indexable.
- Admin requires authentication and RBAC (scope planned Sprint 8, details TBD).
  Do not expose an unauthenticated temporary admin shell.
- Prefer reusing backend application services rather than duplicating domain rules in the admin UI.
- Admin may **prioritize desktop** usability but **must remain responsive**. Unlike the customer storefront, admin is not required to be mobile-first.

## TBD

- Admin UI hosted in `frontend/` vs separate app
- Permission matrix
- Dashboard KPIs
- Coupon and content models
