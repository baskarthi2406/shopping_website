import type { Category, Product } from "@/domain/catalog";
import type { BreadcrumbItemViewModel } from "./breadcrumb-view-model";

export type ProductImageViewModel = {
  readonly src: string;
  readonly alt: string;
};

export type ProductCategoryLinkViewModel = {
  readonly name: string;
  readonly href: string;
};

export type ProductPageViewModel = {
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly canonicalPath: string;
  readonly images: readonly ProductImageViewModel[];
  readonly categories: readonly ProductCategoryLinkViewModel[];
  readonly breadcrumb: readonly BreadcrumbItemViewModel[];
};

/**
 * The breadcrumb is one trail: Home › primary category ancestors › primary
 * category › product. All resolved categories remain in `categories`.
 */
export function toProductPageViewModel(
  product: Product,
  categories: readonly Category[],
  primaryCategoryAncestors: readonly Category[] = [],
): ProductPageViewModel {
  const toLink = (category: Category) => ({
    name: category.name,
    href: `/c/${category.slug}`,
  });
  const categoryLinks = categories.map(toLink);
  const primary = categories[0];
  const trail =
    primary === undefined ? [] : [...primaryCategoryAncestors, primary].map(toLink);

  const breadcrumb: BreadcrumbItemViewModel[] = [
    { label: "Home", href: "/" },
    ...trail.map((category) => ({
      label: category.name,
      href: category.href,
    })),
    { label: product.name, href: null },
  ];

  return {
    slug: product.slug,
    name: product.name,
    description: product.description,
    canonicalPath: `/p/${product.slug}`,
    images: product.images.map((image) => ({
      src: image.src,
      alt: image.alt,
    })),
    categories: categoryLinks,
    breadcrumb,
  };
}
