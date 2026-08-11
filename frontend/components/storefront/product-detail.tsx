import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";

export type ProductDetailProps = {
  product: {
    name: string;
    description: string;
    images: readonly { src: string; alt: string }[];
    categories: readonly { name: string; href: string }[];
    breadcrumb: readonly { label: string; href: string | null }[];
  };
};

export function ProductDetail({ product }: ProductDetailProps) {
  const primaryImage = product.images[0] ?? null;
  const additionalImages = product.images.slice(1);

  return (
    <>
      <Breadcrumbs items={product.breadcrumb} />

      <article className="mt-4 grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-10">
        <div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-surface-muted">
            {primaryImage ? (
              <Image
                src={primaryImage.src}
                alt={primaryImage.alt}
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 50vw"
                className="object-contain p-4"
              />
            ) : null}
          </div>
          {additionalImages.length > 0 ? (
            <ul className="mt-3 grid grid-cols-2 gap-3">
              {additionalImages.map((image) => (
                <li
                  key={image.src}
                  className="relative aspect-[3/4] overflow-hidden rounded-md bg-surface-muted"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 1023px) 50vw, 25vw"
                    className="object-contain p-2"
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <h1 className="text-h1 font-semibold tracking-tight text-foreground">
            {product.name}
          </h1>
          {product.description ? (
            <p className="mt-3 text-body text-foreground-secondary">
              {product.description}
            </p>
          ) : null}
          {product.categories.length > 0 ? (
            <p className="mt-6 text-small text-foreground-secondary">
              {product.categories.map((category, index) => (
                <span key={category.href}>
                  {index > 0 ? ", " : null}
                  <Link
                    href={category.href}
                    className="inline-flex min-h-[var(--mm-tap-min)] items-center text-primary hover:text-primary-hover"
                  >
                    {category.name}
                  </Link>
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </article>
    </>
  );
}
