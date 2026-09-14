"use client";

import type {
  FocusEvent,
  KeyboardEvent,
  ReactNode,
  SyntheticEvent,
} from "react";
import Link from "next/link";

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
          ? "grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3"
          : "mt-1 space-y-0.5"
      }
    >
      {items.map((item) => (
        <li key={item.href}>
          <MenuLink
            item={item}
            className={
              depth === 0
                ? "inline-flex min-h-[var(--mm-tap-min)] items-center rounded-sm px-1.5 font-medium text-foreground transition-colors duration-[var(--mm-duration)] hover:bg-surface-muted hover:text-primary"
                : "inline-flex min-h-9 items-center rounded-sm px-1.5 text-small text-foreground-secondary transition-colors duration-[var(--mm-duration)] hover:bg-surface-muted hover:text-primary"
            }
          />
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
      <ul className="flex w-full items-stretch gap-1 overflow-x-auto lg:justify-center lg:gap-3">
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
                <summary className="flex min-h-13 cursor-pointer list-none items-center gap-1.5 rounded-md px-2 text-small font-semibold text-foreground transition-colors duration-[var(--mm-duration)] hover:bg-surface-muted hover:text-primary group-open:bg-surface-muted group-open:text-primary lg:px-3 [&::-webkit-details-marker]:hidden">
                  <span>{item.label}</span>
                  <span aria-hidden="true" className="text-caption">
                    ▾
                  </span>
                </summary>
                <div className="absolute inset-x-0 top-full z-40 rounded-b-lg border-x border-b border-border bg-background p-5 shadow-sm lg:p-6">
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
                    <div>
                      <p className="font-display text-h3 font-semibold text-foreground">
                        {item.label}
                      </p>
                      <p className="mt-1 text-caption text-foreground-muted">
                        Explore the collection
                      </p>
                    </div>
                    <MenuLink
                      item={item}
                      className="inline-flex min-h-[var(--mm-tap-min)] items-center gap-1 font-medium text-primary transition-colors duration-[var(--mm-duration)] hover:text-primary-hover"
                    >
                      View all {item.label}
                      <span aria-hidden="true">→</span>
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
  const tools = ["Search", "Account", "Cart", "Track Your Order"] as const;

  return (
    <ul className={className} aria-label="Store tools coming soon">
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
