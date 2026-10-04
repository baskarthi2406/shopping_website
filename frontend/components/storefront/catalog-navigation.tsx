"use client";

import type {
  FocusEvent,
  KeyboardEvent,
  ReactNode,
  SyntheticEvent,
} from "react";
import Link from "next/link";
import { CartLink } from "@/components/storefront/cart-link";

export type CatalogNavItem = {
  label: string;
  href: string;
  children: readonly CatalogNavItem[];
};

type CatalogNavigationProps = {
  items: readonly CatalogNavItem[];
};

function closeMenuFromLink(link: HTMLAnchorElement) {
  let details = link.closest("details");
  while (details) {
    details.open = false;
    details = details.parentElement?.closest("details") ?? null;
  }
}

function handleMenuKeyDown(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== "Escape") {
    return;
  }

  const details = event.currentTarget.closest("details");
  if (!details?.open) {
    return;
  }

  event.preventDefault();
  details.open = false;
  details.querySelector("summary")?.focus();
}

function handleMenuBlur(event: FocusEvent<HTMLDetailsElement>) {
  const nextTarget = event.relatedTarget;
  if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
    return;
  }
  event.currentTarget.open = false;
}

function handleDesktopToggle(event: SyntheticEvent<HTMLDetailsElement>) {
  const current = event.currentTarget;
  if (!current.open) {
    return;
  }

  const navigation = current.closest("nav");
  navigation
    ?.querySelectorAll<HTMLDetailsElement>("details[data-desktop-menu]")
    .forEach((details) => {
      if (details !== current) {
        details.open = false;
      }
    });
}

function MenuLink({
  item,
  className,
  children,
}: {
  item: CatalogNavItem;
  className: string;
  children?: ReactNode;
}) {
  return (
    <Link
      href={item.href}
      className={className}
      onClick={(event) => closeMenuFromLink(event.currentTarget)}
    >
      {children ?? item.label}
    </Link>
  );
}

function DesktopMenuItems({
  items,
  depth = 0,
}: {
  items: readonly CatalogNavItem[];
  depth?: number;
}) {
  return (
    <ul
      className={
        depth === 0
          ? "grid w-full auto-rows-min grid-cols-1 items-start gap-x-5 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-3"
          : "mt-0.5 space-y-0.5"
      }
    >
      {items.map((item) => (
        <li key={item.href}>
          <MenuLink
            item={item}
            className={
              depth === 0 ? "mm-mega-link" : "mm-mega-link mm-mega-nested"
            }
          >
            <span>{item.label}</span>
            <span aria-hidden="true" className="mm-mega-link-arrow">
              →
            </span>
          </MenuLink>
          {item.children.length > 0 ? (
            <DesktopMenuItems items={item.children} depth={depth + 1} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function MobileMenuItems({
  items,
  depth = 0,
}: {
  items: readonly CatalogNavItem[];
  depth?: number;
}) {
  return (
    <ul className={depth === 0 ? "space-y-1" : "ml-3 border-l border-border pl-3"}>
      {items.map((item) => (
        <li key={item.href}>
          {item.children.length > 0 ? (
            <details
              onBlur={handleMenuBlur}
              onKeyDown={handleMenuKeyDown}
            >
              <summary className="flex min-h-[var(--mm-tap-min)] cursor-pointer list-none items-center justify-between gap-3 rounded-md px-2 font-medium text-foreground transition-colors duration-[var(--mm-duration)] hover:bg-surface-muted [&::-webkit-details-marker]:hidden">
                <span>{item.label}</span>
                <span aria-hidden="true" className="text-foreground-muted">
                  +
                </span>
              </summary>
              <div className="pb-2">
                <MenuLink
                  item={{ ...item, label: `View all ${item.label}` }}
                  className="inline-flex min-h-[var(--mm-tap-min)] items-center px-2 text-small font-medium text-primary"
                />
                <MobileMenuItems items={item.children} depth={depth + 1} />
              </div>
            </details>
          ) : (
            <MenuLink
              item={item}
              className="inline-flex min-h-[var(--mm-tap-min)] w-full items-center rounded-md px-2 text-small text-foreground transition-colors duration-[var(--mm-duration)] hover:bg-surface-muted hover:text-primary"
            />
          )}
        </li>
      ))}
    </ul>
  );
}

export function DesktopCatalogNavigation({
  items,
}: CatalogNavigationProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Primary categories"
      className="relative hidden min-h-13 w-full items-stretch md:flex"
    >
      <ul className="flex w-full flex-wrap items-stretch gap-1 lg:flex-nowrap lg:justify-center lg:gap-3">
        {items.map((item) => (
          <li key={item.href} className="flex shrink-0 items-stretch">
            {item.children.length > 0 ? (
              <details
                data-desktop-menu
                className="group static flex items-stretch"
                onBlur={handleMenuBlur}
                onKeyDown={handleMenuKeyDown}
                onToggle={handleDesktopToggle}
              >
                <summary className="flex min-h-13 cursor-pointer list-none items-center gap-1.5 rounded-md px-2 text-small font-semibold text-foreground transition-colors duration-[var(--mm-duration)] hover:bg-surface-muted hover:text-primary group-open:relative group-open:z-50 group-open:rounded-t-md group-open:bg-surface-accent group-open:text-primary lg:px-3 [&::-webkit-details-marker]:hidden">
                  <span>{item.label}</span>
                  <span aria-hidden="true" className="text-caption">
                    ▾
                  </span>
                </summary>
                <div className="mm-mega-panel">
                  <div className="mm-mega-header">
                    <div>
                      <p className="text-caption font-semibold tracking-[0.14em] text-foreground-muted uppercase">
                        Shop by category
                      </p>
                      <p className="mt-0.5 font-display text-h3 font-semibold leading-snug text-foreground">
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-caption text-foreground-muted">
                        Explore the collection
                      </p>
                    </div>
                    <MenuLink item={item} className="mm-mega-view-all">
                      View all {item.label}
                      <span aria-hidden="true" className="mm-mega-view-all-arrow">
                        →
                      </span>
                    </MenuLink>
                  </div>
                  <DesktopMenuItems items={item.children} />
                </div>
              </details>
            ) : (
              <MenuLink
                item={item}
                className="inline-flex min-h-13 items-center rounded-md px-2 text-small font-semibold text-foreground transition-colors duration-[var(--mm-duration)] hover:bg-surface-muted hover:text-primary lg:px-3"
              />
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function MobileCatalogNavigation({ items }: CatalogNavigationProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <details
      className="block shrink-0 md:hidden"
      onBlur={handleMenuBlur}
      onKeyDown={handleMenuKeyDown}
    >
      <summary className="inline-flex min-h-[var(--mm-tap-min)] cursor-pointer list-none items-center rounded-md px-2 text-small font-semibold text-foreground transition-colors duration-[var(--mm-duration)] hover:bg-surface-muted [&::-webkit-details-marker]:hidden">
        Menu
      </summary>
      <div className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-6rem)] overflow-y-auto border-y border-border bg-background px-[var(--mm-space-page)] py-3 shadow-sm">
        <MobileMenuItems items={items} />
        <div className="mt-3 border-t border-border pt-3">
          <p className="px-2 text-caption font-semibold uppercase tracking-wide text-foreground-muted">
            Store tools
          </p>
          <StoreToolPlaceholders className="mt-1 grid grid-cols-2 gap-1" />
        </div>
      </div>
    </details>
  );
}

export function StoreToolPlaceholders({ className = "" }: { className?: string }) {
  const tools = ["Search", "Account", "Track Your Order"] as const;

  return (
    <ul className={className} aria-label="Store tools">
      <li>
        <CartLink />
      </li>
      {tools.map((tool) => (
        <li key={tool}>
          <span
            aria-disabled="true"
            title={`${tool} is not available yet`}
            className="inline-flex min-h-[var(--mm-tap-min)] w-full items-center rounded-md px-2 text-small text-foreground-muted"
          >
            {tool}
            <span className="sr-only"> (coming soon)</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
