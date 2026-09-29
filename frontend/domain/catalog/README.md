# `domain/catalog`

Framework-free catalog types: `Product`, `ProductSummary`, `Category`,
`ProductVariant`, `VariantAttribute`, `Pricing`, `Money`, `Inventory`,
`ProductStatus`, `Uom`, `CatalogImage`, and `isCatalogSlug`.

**S4-T02:** `Category` includes nullable `parentId`, recursive `children`,
`visibility`, and `showInMenu`. Hierarchy depth is not fixed. Infrastructure
derives children from flat records; domain does not import fixture/API types.

**S4-T07:** Generic `VariantAttribute` name/value options represent size, color,
age, material, style, or any future option. Duplicate names and duplicate
combinations are rejected. Current fixtures keep `variants: []`. Do not invent
option values.

**S4-T08:** `Money` remains a non-negative major-unit `amount` plus uppercase
currency. `Pricing` requires current price and allows nullable compare-at.
`Inventory` keeps nullable integer quantities distinct from zero. Validation
rejects inconsistent known quantities and contradictory availability. Current
fixtures keep `sku`, `uom`, `pricing`, and `inventory` null.

**Must not import:** React, Next.js, Tailwind, `fetch`, browser storage, FastAPI, SQL.

Navy/tan dresses: product exists; **category TBD** (`categoryIds` empty).
Pricing, SKU, tax, brand, option values, inventory, and UOM are omitted or null
— do not invent them.

Full semantics: `docs/architecture/STOREFRONT_CONTRACTS.md`.
