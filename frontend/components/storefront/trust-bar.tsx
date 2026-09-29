import { Container } from "@/components/ui/container";

type TrustBarProps = {
  items: readonly { title: string; detail: string }[];
};

export function TrustBar({ items }: TrustBarProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section aria-label="Store policies from the approved homepage design">
      <Container className="py-10 sm:py-12">
        <ul className="grid grid-cols-1 gap-6 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {items.map((item) => (
            <li key={item.title} className="min-w-0">
              <p className="font-display text-small font-semibold text-foreground">
                {item.title}
              </p>
              <p className="mt-1 text-caption text-foreground-secondary">
                {item.detail}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
