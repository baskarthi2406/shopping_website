"use client";

import Link from "next/link";
import { CATALOG_UNAVAILABLE_MESSAGE } from "@/application/catalog";
import { Container } from "@/components/ui/container";

type CatalogUnavailableProps = {
  headingAs?: "h1" | "h2";
  onRetry?: () => void;
};

export function CatalogUnavailable({
  headingAs = "h1",
  onRetry,
}: CatalogUnavailableProps) {
  const Heading = headingAs;

  function handleRetry(): void {
    if (onRetry) {
      onRetry();
      return;
    }

    window.location.reload();
  }

  return (
    <Container className="py-8 sm:py-10">
      <Heading
        className={`${headingAs === "h1" ? "text-h1" : "text-h2"} font-semibold tracking-tight text-foreground`}
      >
        {CATALOG_UNAVAILABLE_MESSAGE}
      </Heading>
      <p className="mt-2 max-w-prose text-body text-foreground-secondary">
        Please try again in a moment.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleRetry}
          className="mm-btn-primary"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex min-h-[var(--mm-tap-min)] items-center text-primary hover:text-primary-hover"
        >
          Back to Mini Mystiq
        </Link>
      </div>
    </Container>
  );
}
