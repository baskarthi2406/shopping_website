# Domain

Pure business concepts. Framework-free.

**May depend on:** TypeScript / language types only.

**Must not depend on:** Next.js, React, Tailwind, `fetch`, Node `fs`, browser storage, FastAPI, SQL.

Canonical models live here. Do **not** duplicate `Product` / `Category` / `Cart` under `types/` or `components/`.

| Folder | Concepts |
|--------|----------|
| `catalog/` | Product, Category, ProductVariant, Uom, inventory status (S1-T05 types; many fields TBD) |
| `cart/` | Cart, CartItem, line math (Sprint 4) |

Grouped as **catalog** + **cart** (S1-T01/S1-T02). Not separate top-level `product/` and `category/` trees.
