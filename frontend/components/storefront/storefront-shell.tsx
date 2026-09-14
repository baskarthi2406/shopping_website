import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnnouncementBar } from "@/components/storefront/announcement-bar";
import {
  DesktopCatalogNavigation,
  MobileCatalogNavigation,
  StoreToolPlaceholders,
  type CatalogNavItem,
} from "@/components/storefront/catalog-navigation";
import {
  StorefrontFooter,
  type FooterContact,
  type FooterNavLink,
} from "@/components/storefront/storefront-footer";
import { Container } from "@/components/ui/container";

type StorefrontShellProps = {
  children: ReactNode;
  navigation?: readonly CatalogNavItem[];
  footerNav?: {
    shop: readonly FooterNavLink[];
    collections: readonly FooterNavLink[];
  };
  contact: FooterContact;
};

const EMPTY_FOOTER_NAV = {
  shop: [],
  collections: [],
} as const;

export function StorefrontShell({
  children,
  navigation = [],
  footerNav = EMPTY_FOOTER_NAV,
  contact,
}: StorefrontShellProps) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="flex min-h-dvh flex-col bg-background text-foreground">
        <AnnouncementBar />
        <header className="border-b border-border bg-surface">
          <Container className="relative flex min-h-[var(--mm-header-min)] items-center justify-between gap-3 py-2 md:gap-6">
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
                className="h-[var(--mm-logo-height)] w-auto object-contain"
                style={{ width: "auto" }}
              />
            </Link>
            <StoreToolPlaceholders className="hidden items-center gap-1 md:flex" />
            <MobileCatalogNavigation items={navigation} />
          </Container>
          <div className="hidden border-t border-border md:block">
            <Container>
              <DesktopCatalogNavigation items={navigation} />
            </Container>
          </div>
        </header>
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <StorefrontFooter
          shop={footerNav.shop}
          collections={footerNav.collections}
          contact={contact}
        />
      </div>
    </>
  );
}
