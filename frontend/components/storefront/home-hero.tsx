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
      <Container className="grid gap-6 py-6 sm:py-8 lg:grid-cols-2 lg:items-center lg:gap-10 lg:py-10">
        <div className="min-w-0">
          <h1
            id="home-hero-heading"
            className="text-balance text-h1 font-semibold tracking-tight text-foreground"
          >
            {headline}
          </h1>
          <p className="mt-3 max-w-prose text-body text-foreground-secondary">
            {subhead}
          </p>
          {ctaHref && ctaLabel ? (
            <Link
              href={ctaHref}
              className="mt-5 inline-flex min-h-[var(--mm-tap-min)] items-center rounded-md bg-primary px-5 text-small font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {ctaLabel}
            </Link>
          ) : null}
        </div>
        <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-lg bg-surface-muted lg:mx-0 lg:aspect-auto lg:h-[28rem] lg:max-w-none">
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
