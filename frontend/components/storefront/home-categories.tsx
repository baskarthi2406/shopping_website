import Image from "next/image";
import Link from "next/link";
import { CatalogSectionEmpty } from "@/components/storefront/catalog-empty-state";
import { Container } from "@/components/ui/container";

type HomeCategoriesProps = {
  categories: readonly {
    name: string;
    href: string;
    image: { src: string; alt: string } | null;
  }[];
};

export function HomeCategories({ categories }: HomeCategoriesProps) {
  if (categories.length === 0) {
    return (
      <CatalogSectionEmpty
        headingId="home-categories-heading"
        heading="Shop by category"
        message="Categories will appear here when they are available."
      />
    );
  }

  return (
    <section aria-labelledby="home-categories-heading">
      <Container className="py-10 sm:py-12">
        <h2
          id="home-categories-heading"
          className="font-display text-h2 font-semibold tracking-tight text-foreground"
        >
          Shop by category
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-5">
          {categories.map((category) => (
            <li key={category.href} className="min-w-0">
              <Link
                href={category.href}
                className="group flex flex-col items-center gap-3 rounded-lg p-2 text-center"
              >
                <span className="relative block aspect-square w-full max-w-[8.5rem] overflow-hidden rounded-full bg-surface-warm ring-1 ring-border">
                  {category.image ? (
                    <Image
                      src={category.image.src}
                      alt={category.image.alt}
                      fill
                      sizes="(max-width: 639px) 40vw, (max-width: 1023px) 25vw, 10vw"
                      className="mm-hover-zoom object-cover"
                    />
                  ) : null}
                </span>
                <span className="text-small font-medium text-foreground transition-colors duration-[var(--mm-duration)] group-hover:text-primary">
                  {category.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
