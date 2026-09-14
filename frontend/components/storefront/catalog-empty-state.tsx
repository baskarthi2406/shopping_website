import { Container } from "@/components/ui/container";

type CatalogEmptyStateProps = {
  message: string;
  className?: string;
};

export function CatalogEmptyState({
  message,
  className = "mt-8",
}: CatalogEmptyStateProps) {
  return (
    <p
      role="status"
      className={`${className} text-body text-foreground-secondary`}
    >
      {message}
    </p>
  );
}

type CatalogSectionEmptyProps = {
  headingId: string;
  heading: string;
  message: string;
};

export function CatalogSectionEmpty({
  headingId,
  heading,
  message,
}: CatalogSectionEmptyProps) {
  return (
    <section aria-labelledby={headingId}>
      <Container className="py-8 sm:py-10">
        <h2
          id={headingId}
          className="text-h2 font-semibold tracking-tight text-foreground"
        >
          {heading}
        </h2>
        <CatalogEmptyState message={message} className="mt-3" />
      </Container>
    </section>
  );
}
