import type { Category } from "@/domain/catalog";

export type CatalogNavItemViewModel = {
  readonly label: string;
  readonly href: string;
};

export function toCatalogNavItems(
  categories: readonly Category[],
): readonly CatalogNavItemViewModel[] {
  return categories.map((category) => ({
    label: category.name,
    href: `/c/${category.slug}`,
  }));
}
