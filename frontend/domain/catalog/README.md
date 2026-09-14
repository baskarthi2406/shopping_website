# `domain/catalog`

Framework-free catalog types: `Product`, `ProductSummary`, `Category`,
`ProductVariant`, `VariantAttribute`, `Pricing`, `Money`, `Inventory`,
`ProductStatus`, `Uom`, `CatalogImage`, and `isCatalogSlug`.

**S4-T02:** `Category` includes nullable `parentId`, recursive `children`,
`visibility`, and `showInMenu`. Hierarchy depth is not fixed. Infrastructure
derives children from flat records; domain does not import fixture/API types.

**S4-T03:** Product and variant commerce fields are provider-independent and
nullable when unknown. Variant options are generic name/value attributes;
missing fixture variants are empty rather than synthetic. Contract validation
checks IDs/slugs, variant structure, money, and inventory quantities.

**Must not import:** React, Next.js, Tailwind, `fetch`, browser storage, FastAPI, SQL.

Navy/tan dresses: product exists; **category TBD** (`categoryIds` empty).
Pricing, SKU, tax, brand, option values, inventory, and UOM are omitted or null
— do not invent them.

Full semantics: `docs/architecture/STOREFRONT_CONTRACTS.md`.
