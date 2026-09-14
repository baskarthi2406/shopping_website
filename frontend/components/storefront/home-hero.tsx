import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";

type HomeHeroProps = {
  headline: string;
  subhead: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  image: { src: string; alt: string };
};

export function HomeHero({
  headline,
  subhead,
  ctaLabel,
  ctaHref,
  image,
}: HomeHeroProps) {
  return (
    <section aria-labelledby="home-hero-heading" className="bg-surface-accent">
      <Container className="grid gap-8 py-8 sm:py-10 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-12">
        <div className="min-w-0">
          <h1
            id="home-hero-heading"
            className="text-balance font-display text-display font-semibold tracking-tight text-foreground"
          >
            {headline}
          </h1>
          <p className="mt-4 max-w-prose text-body text-foreground-secondary">
            {subhead}
          </p>
          {ctaHref && ctaLabel ? (
            <Link href={ctaHref} className="mm-btn-primary mt-6 gap-2">
              {ctaLabel}
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
        <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-lg border border-border bg-surface lg:mx-0 lg:aspect-auto lg:h-[28rem] lg:max-w-none">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 50vw"
            className="object-contain"
          />
        </div>
      </Container>
    </section>
  );
}
