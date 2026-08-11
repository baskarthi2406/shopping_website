import { Container } from "@/components/ui/container";

type HomeIntroProps = {
  title: string;
  body: string;
};

export function HomeIntro({ title, body }: HomeIntroProps) {
  return (
    <section aria-labelledby="home-intro-heading">
      <Container className="py-8 sm:py-10">
        <h2
          id="home-intro-heading"
          className="text-h2 font-semibold tracking-tight text-foreground"
        >
          {title}
        </h2>
        <p className="mt-3 max-w-prose text-body text-foreground-secondary">
          {body}
        </p>
      </Container>
    </section>
  );
}
