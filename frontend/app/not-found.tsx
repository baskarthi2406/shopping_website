import type { Metadata } from "next";
import Link from "next/link";
import { toNextNotFoundMetadata } from "@/app/to-next-metadata";
import { buildNotFoundMetadata } from "@/application/seo/page-metadata";
import { Container } from "@/components/ui/container";

export function generateMetadata(): Metadata {
  return toNextNotFoundMetadata(buildNotFoundMetadata());
}

export default function NotFound() {
  return (
    <Container className="py-12">
      <h1 className="text-h1 font-semibold tracking-tight text-foreground">
        Page not found
      </h1>
      <p className="mt-2 text-body text-foreground-secondary">
        That page does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-[var(--mm-tap-min)] items-center text-primary hover:text-primary-hover"
      >
        Back to Mini Mystiq
      </Link>
    </Container>
  );
}
