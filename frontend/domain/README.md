# Domain

Pure business concepts. Framework-free.

**May depend on:** TypeScript / language types only.

**Must not depend on:** Next.js, React, Tailwind, `fetch`, Node `fs`, browser storage, FastAPI, SQL.

Canonical models live here. Do **not** duplicate `Product` / `Category` / `Cart` under `types/` or `components/`.

| Folder | Concepts (fields TBD; types in S1-T05) |
|--------|----------------------------------------|
| `catalog/` | Product, Category, ProductVariant, Uom, inventory status |
| `cart/` | Cart, CartItem, line math |

Grouped as **catalog** + **cart** (S1-T01/S1-T02). Not separate top-level `product/` and `category/` trees.
