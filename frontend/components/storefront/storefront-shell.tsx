import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { CatalogNavigation } from "@/components/storefront/catalog-navigation";
import { Container } from "@/components/ui/container";

type StorefrontShellProps = {
  children: ReactNode;
  navigation?: readonly { label: string; href: string }[];
};

export function StorefrontShell({
  children,
  navigation = [],
}: StorefrontShellProps) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="flex min-h-dvh flex-col bg-background text-foreground">
        <header className="border-b border-border bg-surface">
          <Container className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <Link
              href="/"
              className="inline-flex min-h-[var(--mm-tap-min)] shrink-0 items-center rounded-md"
            >
              <Image
                src="/mini-mystiq-logo.png"
                alt="Mini Mystiq"
                width={160}
                height={73}
                priority
                className="h-10 w-auto max-w-[9rem] sm:h-12 sm:max-w-[11rem]"
                style={{ width: "auto", height: "auto" }}
              />
            </Link>
            <CatalogNavigation items={navigation} />
          </Container>
        </header>
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <footer className="border-t border-border bg-surface">
          <Container className="py-4">
            <p className="text-small text-foreground-muted">Mini Mystiq</p>
          </Container>
        </footer>
      </div>
    </>
  );
}
