# `domain/catalog`

Framework-free catalog types (S1-T05): `Product`, `Category`, `ProductVariant`, `Uom`, `CatalogImage`, `InventoryStatus`, `isCatalogSlug`.

**S4-T02:** `Category` includes nullable `parentId`, recursive `children`,
`visibility`, and `showInMenu`. Hierarchy depth is not fixed. Infrastructure
derives children from flat records; domain does not import fixture/API types.

**Must not import:** React, Next.js, Tailwind, `fetch`, browser storage, FastAPI, SQL.

Navy/tan dresses: product exists; **category TBD** (`categoryIds` empty). Pricing, SKU, tax, brand, size/color values, and UOM codes are omitted or null — do not invent them.
