"use client";

import { CatalogUnavailable } from "@/components/storefront/catalog-unavailable";

type CatalogErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

function isNextNavigationError(error: Error & { digest?: string }): boolean {
  const digest = error.digest ?? "";
  return (
    digest.includes("NEXT_HTTP_ERROR_FALLBACK") ||
    digest.includes("NEXT_NOT_FOUND") ||
    digest.includes("NEXT_REDIRECT")
  );
}

export default function CatalogErrorPage({
  error,
  reset,
}: CatalogErrorPageProps) {
  if (isNextNavigationError(error)) {
    throw error;
  }

  return (
    <div className="py-6 sm:py-8 lg:py-10">
      <CatalogUnavailable headingAs="h1" onRetry={reset} />
    </div>
  );
}
