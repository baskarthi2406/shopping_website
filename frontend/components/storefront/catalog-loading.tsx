import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";

function Placeholder({ className }: { className: string }) {
  return <div className={`bg-surface-muted ${className}`} />;
}

function LoadingStatus({ children }: { children: ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <p className="sr-only">Loading catalog</p>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

export function HomeCatalogLoading() {
  return (
    <LoadingStatus>
      <section className="bg-surface-accent">
        <Container className="grid gap-6 py-6 sm:py-8 lg:grid-cols-2 lg:items-center lg:gap-10 lg:py-10">
          <div className="min-w-0">
            <Placeholder className="h-10 w-4/5 rounded-md" />
            <Placeholder className="mt-4 h-16 w-full max-w-prose rounded-md" />
          </div>
          <Placeholder className="mx-auto aspect-[3/4] w-full max-w-md rounded-lg lg:mx-0 lg:h-[28rem] lg:max-w-none" />
        </Container>
      </section>
      <Container className="py-8 sm:py-10">
        <Placeholder className="h-8 w-48 rounded-md" />
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <li key={index} className="flex flex-col items-center gap-2">
              <Placeholder className="aspect-square w-full max-w-[8.5rem] rounded-full" />
              <Placeholder className="h-4 w-20 rounded-md" />
            </li>
          ))}
        </ul>
      </Container>
      <Container className="py-8 sm:py-10">
        <Placeholder className="h-8 w-64 rounded-md" />
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <li key={index}>
              <Placeholder className="aspect-[3/4] rounded-lg" />
              <Placeholder className="mt-3 h-4 w-3/4 rounded-md" />
            </li>
          ))}
        </ul>
      </Container>
    </LoadingStatus>
  );
}

export function CategoryCatalogLoading() {
  return (
    <LoadingStatus>
      <Container className="py-6 sm:py-8 lg:py-10">
        <Placeholder className="h-4 w-40 rounded-md" />
        <Placeholder className="mt-4 h-10 w-64 rounded-md" />
        <Placeholder className="mt-3 h-4 w-24 rounded-md" />
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <li key={index}>
              <Placeholder className="aspect-[3/4] rounded-lg" />
              <Placeholder className="mt-3 h-4 w-3/4 rounded-md" />
            </li>
          ))}
        </ul>
      </Container>
    </LoadingStatus>
  );
}

export function ProductCatalogLoading() {
  return (
    <LoadingStatus>
      <Container className="py-6 sm:py-8 lg:py-10">
        <Placeholder className="h-4 w-48 rounded-md" />
        <div className="mt-4 grid gap-6 lg:grid-cols-2 lg:gap-10">
          <Placeholder className="aspect-[3/4] rounded-lg" />
          <div>
            <Placeholder className="h-10 w-4/5 rounded-md" />
            <Placeholder className="mt-4 h-24 w-full rounded-md" />
          </div>
        </div>
      </Container>
    </LoadingStatus>
  );
}
