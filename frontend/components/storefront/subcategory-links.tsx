import Link from "next/link";
import type { SubcategoryLinkViewModel } from "@/application/catalog";

type SubcategoryLinksProps = {
  categoryName: string;
  subcategories: readonly SubcategoryLinkViewModel[];
};

export function SubcategoryLinks({
  categoryName,
  subcategories,
}: SubcategoryLinksProps) {
  if (subcategories.length === 0) {
    return null;
  }

  return (
    <nav aria-label={`${categoryName} subcategories`} className="mt-5">
      <h2 className="text-small font-semibold text-foreground">
        Shop by subcategory
      </h2>
      <ul className="mt-2 flex flex-wrap gap-2">
        {subcategories.map((subcategory) => (
          <li key={subcategory.href}>
            <Link
              href={subcategory.href}
              className="inline-flex min-h-[var(--mm-tap-min)] items-center rounded-full border border-border px-4 text-small font-medium text-foreground transition-colors duration-[var(--mm-duration)] hover:border-primary hover:text-primary"
            >
              {subcategory.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
