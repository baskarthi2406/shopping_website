import Link from "next/link";

export type CatalogNavItem = {
  label: string;
  href: string;
};

type CatalogNavigationProps = {
  items: readonly CatalogNavItem[];
};

export function CatalogNavigation({ items }: CatalogNavigationProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Categories">
      <ul className="flex flex-wrap items-center gap-x-4">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="inline-flex min-h-[var(--mm-tap-min)] items-center text-small font-medium text-foreground hover:text-primary"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
