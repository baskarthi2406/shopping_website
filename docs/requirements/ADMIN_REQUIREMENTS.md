# Admin Requirements

**Admin implementation belongs to Phase 2.** Do not build admin UI or admin APIs in Phase 1.

Module list is a **roadmap**, not a Sprint 1 backlog. Workflows, fields, and permissions are **TBD**.

---

## Planned modules

| Module | Intent | Earliest sprint (planned) |
|--------|--------|---------------------------|
| Dashboard | Operational overview | TBD (after core entities exist) |
| Products | Create/edit catalog products | Sprint 6 |
| Categories | Catalog taxonomy | Sprint 6 |
| UOM | Units of measure | Sprint 6 |
| Inventory | Stock levels / movements TBD | Sprint 7 |
| Orders | Order operations | Sprint 7 |
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
- Admin requires authentication and RBAC (Sprint 8). Until then, any early admin shell in Sprint 6 must not be treated as production-safe (**TBD** temporary protection).
- Prefer reusing backend application services rather than duplicating domain rules in the admin UI.

## TBD

- Admin UI hosted in `frontend/` vs separate app
- Permission matrix
- Dashboard KPIs
- Coupon and content models
