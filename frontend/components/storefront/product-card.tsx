import Image from "next/image";
import Link from "next/link";

export type ProductCardProps = {
  href: string;
  name: string;
  description: string;
  image: { src: string; alt: string } | null;
};

export function ProductCard({
  href,
  name,
  description,
  image,
}: ProductCardProps) {
  return (
    <article className="h-full overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <Link
        href={href}
        className="flex h-full min-h-[var(--mm-tap-min)] flex-col rounded-lg"
      >
        <div className="relative aspect-[3/4] bg-surface-muted">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
              className="object-contain p-2"
            />
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <h2 className="text-small font-semibold text-foreground sm:text-body">
            {name}
          </h2>
          <p className="line-clamp-2 text-caption text-foreground-secondary">
            {description}
          </p>
        </div>
      </Link>
    </article>
  );
}
