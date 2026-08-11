import { ProductCard } from "@/components/storefront/product-card";
import { Container } from "@/components/ui/container";

type HomeProductsProps = {
  products: readonly {
    href: string;
    name: string;
    description: string;
    image: { src: string; alt: string } | null;
  }[];
};

export function HomeProducts({ products }: HomeProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="home-products-heading">
      <Container className="py-8 sm:py-10">
        <h2
          id="home-products-heading"
          className="text-h2 font-semibold tracking-tight text-foreground"
        >
          Clothing in the catalog
        </h2>
        <p className="mt-2 max-w-prose text-body text-foreground-secondary">
          Current products from the Mini Mystiq catalog. This is not a featured
          selection.
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {products.map((product) => (
            <li key={product.href} className="min-w-0">
              <ProductCard {...product} headingAs="h3" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
