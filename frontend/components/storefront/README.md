# `components/storefront`

Storefront composites. Receive view-model props. Do not import repositories or fixtures.

**S1-T07:** `StorefrontShell` — skip link, `<header>` (logo home link only), `<main>`, `<footer>`. Not the final Option 1 header/nav/footer.

**S2-T01:** `ProductCard` — presentation only (href, name, description, image). No repositories, fixtures, or cart.

**S2-T03:** `ProductDetail` — presentation only (name, description, images, breadcrumb, category links). No cart, price, or variant selectors.

**S5-T03:** `ProductCommercePanel` (rendered by `ProductDetail` via the optional
`commerce` prop) is a server-rendered price/availability panel. It receives
formatted strings from `toProductCommerceViewModel` and the verified store
telephone. It shows a price or “Price not available”, an optional availability
message, and a `tel:` “Call …” link. It has no purchase controls, cart, stock
counts, or business logic.

**S5-T04:** `ProductPurchaseOptions` (client) renders one native radio
`fieldset` per variant option and swaps between server-precomputed commerce
view models via `resolveVariantSelection`. `ProductDetail` uses it only when
`variantOptions` is supplied (real, selectable variants); otherwise it renders
the plain panel. No auto-selection, purchasability logic, storage, or fetch.

**S2-T04:** `Breadcrumbs` and `CatalogNavigation` — presentation props only.
S4-T02 evolves `CatalogNavigation` to recursively render supplied child items:
mobile Menu disclosure, tablet/desktop category bar, and hierarchy dropdowns.
Components still contain no customer category names or repository imports.

**S4-T10A:** Classic-modern polish — self-hosted display/UI fonts, warmed tokens,
mega-menu panel, category/product card hover, CTA class, boutique footer.
No fake policy/account routes. Header IA and catalog data unchanged.
