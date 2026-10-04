import Link from "next/link";
import { Container } from "@/components/ui/container";

export function CatalogDemoLink() {
  return (
    <Container className="pb-10">
      <p className="text-small text-foreground-secondary">
        Demo:{" "}
        <Link
          href="/catalog"
          className="inline-flex min-h-[var(--mm-tap-min)] items-center font-semibold text-primary transition-colors duration-[var(--mm-duration)] hover:text-primary-hover"
        >
          Browse the full catalog by inventory category
        </Link>
      </p>
    </Container>
  );
}
