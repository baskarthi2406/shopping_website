# `components/storefront`

Storefront composites. Receive view-model props. Do not import repositories or fixtures.

**S1-T07:** `StorefrontShell` — skip link, `<header>` (logo home link only), `<main>`, `<footer>`. Not the final Option 1 header/nav/footer.

**S2-T01:** `ProductCard` — presentation only (href, name, description, image). No repositories, fixtures, or cart.

**S2-T03:** `ProductDetail` — presentation only (name, description, images, breadcrumb, category links). No cart, price, or variant selectors.

**S2-T04:** `Breadcrumbs` and `CatalogNavigation` — presentation props only. Shell header shows category links; pages pass breadcrumb items from view models.

Hero, search/wishlist/account/cart chrome: later tasks.
