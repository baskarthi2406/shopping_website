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

export type FooterNavLinkViewModel = {
  readonly label: string;
  readonly href: string;
};

export type FooterNavViewModel = {
  readonly shop: readonly FooterNavLinkViewModel[];
  readonly collections: readonly FooterNavLinkViewModel[];
};

function toFooterLink(category: Category): FooterNavLinkViewModel {
  return {
    label: category.name,
    href: `/c/${category.slug}`,
  };
}

/**
 * Footer shop vs collection columns from existing category data.
 * Shop matches homepage tiles (visible top-level categories with imagery).
 * Collections are the remaining visible top-level menu categories.
 */
export function toFooterNavViewModel(
  categories: readonly Category[],
): FooterNavViewModel {
  const roots = categories.filter(
    (category) => category.parentId === null && isMenuCategory(category),
  );

  return {
    shop: roots.filter((category) => category.image !== null).map(toFooterLink),
    collections: roots
      .filter((category) => category.image === null)
      .map(toFooterLink),
  };
}
