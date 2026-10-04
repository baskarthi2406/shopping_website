import Image from "next/image";
import Link from "next/link";

export type ProductCardProps = {
  href: string;
  name: string;
  description: string;
  image: { src: string; alt: string } | null;
  price?: string | null;
  priceMessage?: string | null;
  availabilityMessage?: string | null;
  headingAs?: "h2" | "h3";
};

export function ProductCard({
  href,
  name,
  description,
  image,
  price = null,
  priceMessage = null,
  availabilityMessage = null,
  headingAs = "h2",
}: ProductCardProps) {
  const Heading = headingAs;

  return (
    <article className="h-full overflow-hidden rounded-md border border-border bg-surface transition-shadow duration-[var(--mm-duration)] hover:shadow-sm">
      <Link
        href={href}
        className="group flex h-full min-h-[var(--mm-tap-min)] flex-col rounded-md"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-surface-muted">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
              className="mm-hover-zoom object-contain p-3"
            />
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <Heading className="font-sans text-small font-medium text-foreground sm:text-body">
            {name}
          </Heading>
          <p className="line-clamp-2 text-caption text-foreground-secondary">
            {description}
          </p>
          {price !== null ? (
            <p className="text-small font-semibold text-foreground">{price}</p>
          ) : priceMessage !== null ? (
            <p className="text-caption text-foreground-muted">{priceMessage}</p>
          ) : null}
          {availabilityMessage !== null ? (
            <p className="text-caption font-semibold text-foreground">{availabilityMessage}</p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
