import type { ProductCardViewModel } from "@/application/catalog";
import { ProductCard } from "@/components/storefront/product-card";

export function SearchResults({
  query,
  products,
}: {
  query: string;
  products: readonly ProductCardViewModel[];
}) {
  if (query === "") {
    return (
      <p className="mt-4 text-body text-foreground-secondary">
        Enter a product name to search the catalog.
      </p>
    );
  }

  return (
    <>
      <p className="mt-3 text-small text-foreground-secondary">
        {products.length === 0
          ? `No products match “${query}”.`
          : `${products.length} ${products.length === 1 ? "product" : "products"}`}
      </p>
      {products.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {products.map((product) => (
            <li key={product.href}>
              <ProductCard {...product} />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
