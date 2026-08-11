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
      <Container className="py-8 sm:py-10">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <li
              key={item.title}
              className="rounded-lg bg-surface-muted px-4 py-4"
            >
              <p className="text-small font-semibold text-foreground">
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
