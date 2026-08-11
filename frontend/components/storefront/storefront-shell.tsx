import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnnouncementBar } from "@/components/storefront/announcement-bar";
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
        <AnnouncementBar />
        <header className="border-b border-border bg-surface">
          <Container className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
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
            {navigation.length > 0 ? (
              <details className="sm:hidden">
                <summary className="inline-flex min-h-[var(--mm-tap-min)] cursor-pointer list-none items-center rounded-md text-small font-medium text-foreground [&::-webkit-details-marker]:hidden">
                  Categories
                </summary>
                <div className="pt-1">
                  <CatalogNavigation items={navigation} />
                </div>
              </details>
            ) : null}
            <div className="hidden sm:block">
              <CatalogNavigation items={navigation} />
            </div>
          </Container>
        </header>
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <footer className="border-t border-border bg-surface">
          <Container className="flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-small font-semibold text-foreground">
                Mini Mystiq
              </p>
              <p className="mt-1 text-caption text-foreground-muted">
                Baby Clothes & Toys
              </p>
              <p className="mt-1 text-caption text-foreground-muted">
                Delivering Style & Tech
              </p>
            </div>
            {navigation.length > 0 ? (
              <nav aria-label="Footer categories">
                <ul className="flex flex-col gap-1 sm:items-end">
                  {navigation.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="inline-flex min-h-[var(--mm-tap-min)] items-center text-small text-foreground-secondary hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </Container>
        </footer>
      </div>
    </>
  );
}
