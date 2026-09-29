# `components/storefront`

Storefront composites. Receive view-model props. Do not import repositories or fixtures.

**S1-T07:** `StorefrontShell` — skip link, `<header>` (logo home link only), `<main>`, `<footer>`. Not the final Option 1 header/nav/footer.

**S2-T01:** `ProductCard` — presentation only (href, name, description, image). No repositories, fixtures, or cart.

**S2-T03:** `ProductDetail` — presentation only (name, description, images, breadcrumb, category links). No cart, price, or variant selectors.

**S2-T04:** `Breadcrumbs` and `CatalogNavigation` — presentation props only.
S4-T02 evolves `CatalogNavigation` to recursively render supplied child items:
mobile Menu disclosure, tablet/desktop category bar, and hierarchy dropdowns.
Components still contain no customer category names or repository imports.

**S4-T10A:** Classic-modern polish — self-hosted display/UI fonts, warmed tokens,
mega-menu panel, category/product card hover, CTA class, boutique footer.
No fake policy/account routes. Header IA and catalog data unchanged.
