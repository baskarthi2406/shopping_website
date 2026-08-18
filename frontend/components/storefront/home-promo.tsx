import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";

type HomePromoProps = {
  href: string | null;
  image: { src: string; alt: string };
};

export function HomePromo({ href, image }: HomePromoProps) {
  const imageFrame = (
    <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-surface-muted sm:aspect-[4/3] lg:aspect-[16/7] lg:max-h-[22rem]">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="100vw"
        className="object-contain sm:object-cover sm:object-center"
      />
    </div>
  );

  return (
    <section aria-labelledby="home-promo-heading">
      <Container className="py-8 sm:py-10">
        <h2
          id="home-promo-heading"
          className="text-h2 font-semibold tracking-tight text-foreground"
        >
          Baby dress and bloomer sets
        </h2>
        <div className="mt-4">
          {href ? (
            <Link href={href} className="block rounded-lg">
              {imageFrame}
            </Link>
          ) : (
            imageFrame
          )}
        </div>
      </Container>
    </section>
  );
}
