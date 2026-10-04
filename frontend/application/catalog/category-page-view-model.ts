import type { Category, Product } from "@/domain/catalog";
import type { BreadcrumbItemViewModel } from "./breadcrumb-view-model";

export type ProductCardViewModel = {
  readonly href: string;
  readonly name: string;
  readonly description: string;
  readonly image: { readonly src: string; readonly alt: string } | null;
};

export type SubcategoryLinkViewModel = {
  readonly name: string;
  readonly href: string;
};

export type CategoryPageViewModel = {
  readonly slug: string;
  readonly name: string;
  readonly description: string | null;
  readonly canonicalPath: string;
  readonly productCount: number;
  readonly products: readonly ProductCardViewModel[];
  /** Visible direct subcategories, in category order. */
  readonly subcategories: readonly SubcategoryLinkViewModel[];
  readonly breadcrumb: readonly BreadcrumbItemViewModel[];
};

export function toProductCardViewModel(
  product: Product,
): ProductCardViewModel {
  const image = product.images[0];

  return {
    href: `/p/${product.slug}`,
    name: product.name,
    description: product.description,
    image: image ? { src: image.src, alt: image.alt } : null,
  };
}

/**
 * Category page view. Products are the category's own placements (no
 * aggregation from subcategories); subcategories link one level down.
 * `ancestors` (root first) prefix the breadcrumb.
 */
export function toCategoryPageViewModel(
  category: Category,
  products: readonly Product[],
  ancestors: readonly Category[] = [],
): CategoryPageViewModel {
  return {
    slug: category.slug,
    name: category.name,
    description: category.description,
    canonicalPath: `/c/${category.slug}`,
    productCount: products.length,
    products: products.map(toProductCardViewModel),
    subcategories: category.children
      .filter((child) => child.visibility === "visible")
      .map((child) => ({ name: child.name, href: `/c/${child.slug}` })),
    breadcrumb: [
      { label: "Home", href: "/" },
      ...ancestors.map((ancestor) => ({
        label: ancestor.name,
        href: `/c/${ancestor.slug}`,
      })),
      { label: category.name, href: null },
    ],
  };
}
