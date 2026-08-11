import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href: string | null;
};

type BreadcrumbsProps = {
  items: readonly BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 text-small text-foreground-secondary">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-x-2"
            >
              {index > 0 ? (
                <span aria-hidden="true" className="text-foreground-muted">
                  /
                </span>
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="inline-flex min-h-[var(--mm-tap-min)] items-center text-primary hover:text-primary-hover"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="inline-flex min-h-[var(--mm-tap-min)] items-center text-foreground"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
