# `application/catalog`

Catalog use cases and repository interfaces (S1-T05).

**Ports:** `ProductRepository`, `CategoryRepository`, `UomRepository`.

**Use cases:** get/list products and categories; `getCategoryPage` (S2-T01) returns category + products or `null`; `getProductPage` (S2-T03) returns product + known categories or `null`. View-model mappers: `toCategoryPageViewModel`, `toProductPageViewModel`, `toCatalogNavItems` (S2-T04). No search, pricing, or inventory engines.

Depends on domain + these interfaces only. Bind implementations in `config/`.
**S4-T09:** Storefront pages use `config/catalog.ts` (HTTP repositories). Dummy API routes
use `config/catalog-source.ts` (static repositories).

**S4-T10:** `CATALOG_UNAVAILABLE_MESSAGE` is the public catalog failure copy.
Empty collections are successful `[]` results, not errors. Null pricing,
inventory, and empty variants stay valid product data.

**S4-T11:** Layout and footer navigation call `catalog.listCategories()` and
the existing nav/footer view models. Presentation still receives only
`label`/`href`/`children`. Sitemap remains on `catalog-source.ts`.

**S4-T01 audit:** retain all ports/use cases. They are the clean swap boundary
for static, dummy API, production, and Zoho-backed repositories.

**S4-T02:** `toCatalogNavItems` selects visible, menu-enabled roots and maps
recursive domain children to `/c/{slug}` navigation view models. It contains no
customer taxonomy constants.

**S4-T03:** `catalog-contracts.ts` defines transport-neutral collection, detail,
pagination, and error envelopes. Category lists are ordered recursive trees;
product lists contain `ProductSummary` plus minimal page pagination; details
contain full products. Dummy/Zoho DTOs must not be added here.

**S4-T04:** `getCategoryCollection` obtains categories through
`CategoryRepository`, selects ordered roots, and returns the S4-T03 collection
envelope. Repository failures propagate to the HTTP adapter for safe mapping.

**S4-T05:** `getProductCollection` obtains the stable repository order, applies
one-based page slicing, maps only `ProductSummary`, and returns the S4-T03
pagination envelope. Default page/page size are 1/12 at the API boundary.

**S4-T06:** `getProductDetail` looks up one product by public SEO slug and
returns the S4-T03 detail envelope or `not_found`. Invalid catalog-slug syntax
is `invalid_request`. Repository failures propagate to the HTTP adapter.

**S5-T02:** `evaluatePurchasability({ product, variantId?, quantity })` is the
single purchase-eligibility rule. It is pure, deterministic, and returns
`{ purchasable, reasons }`, with `reasons` ordered as in
`PURCHASABILITY_REASONS`. Missing price, currency, status, or inventory always
blocks and is never defaulted. Variants are judged on their own pricing and
inventory (no parent inheritance). SKU/UOM never block. User-facing copy is
not defined here (Sprint 5 Q4). Codes and rules:
`docs/sprints/SPRINT-05.md` → S5-T02.

**S5-T03:** `toProductCommerceViewModel(product, { priceDisplay, variantId? })`
maps `evaluatePurchasability` (quantity 1) to PDP strings. A price is formatted
only when it is verified and its currency is listed in `priceDisplay`
(`config/commerce.ts`, currently `null`, so no price renders). Availability:
explicit `out_of_stock` → “Out of stock”; inactive → “Not currently
available”; unknown status/inventory or unresolved variant → “Availability not
confirmed”; confirmed stock shows no message (“In stock” is undecided, Q6).
Copy constants live in `catalog-messages.ts`.

Full semantics: `docs/architecture/STOREFRONT_CONTRACTS.md`.
