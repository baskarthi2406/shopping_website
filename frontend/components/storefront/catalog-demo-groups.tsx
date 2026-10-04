import { ProductCard } from "@/components/storefront/product-card";

type CatalogDemoGroupsProps = {
  groups: readonly {
    label: string;
    products: readonly {
      href: string;
      name: string;
      description: string;
      image: { src: string; alt: string } | null;
      placed: boolean;
    }[];
  }[];
};

export function CatalogDemoGroups({ groups }: CatalogDemoGroupsProps) {
  return (
    <div className="mt-8 flex flex-col gap-10">
      {groups.map((group, index) => {
        const headingId = `catalog-demo-group-${index}`;
        return (
          <section key={group.label} aria-labelledby={headingId}>
            <h2
              id={headingId}
              className="font-display text-h3 font-semibold tracking-tight text-foreground"
            >
              {group.label}{" "}
              <span className="text-small font-normal text-foreground-muted">
                ({group.products.length})
              </span>
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
              {group.products.map((product) => (
                <li key={product.href} className="flex min-w-0 flex-col gap-1">
                  <ProductCard
                    href={product.href}
                    name={product.name}
                    description={product.description}
                    image={product.image}
                    headingAs="h3"
                  />
                  {product.placed ? null : (
                    <p className="text-caption text-foreground-muted">
                      Not yet placed in a storefront category
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
