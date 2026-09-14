import type { Category } from "@/domain/catalog";

export type CatalogNavItemViewModel = {
  readonly label: string;
  readonly href: string;
  readonly children: readonly CatalogNavItemViewModel[];
};

function isMenuCategory(category: Category): boolean {
  return category.visibility === "visible" && category.showInMenu;
}

function toCatalogNavItem(category: Category): CatalogNavItemViewModel {
  return {
    label: category.name,
    href: `/c/${category.slug}`,
    children: category.children
      .filter(isMenuCategory)
      .map(toCatalogNavItem),
  };
}

export function toCatalogNavItems(
  categories: readonly Category[],
): readonly CatalogNavItemViewModel[] {
  return categories
    .filter(
      (category) => category.parentId === null && isMenuCategory(category),
    )
    .map(toCatalogNavItem);
}
