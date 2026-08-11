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

export function toProductPageViewModel(
  product: Product,
  categories: readonly Category[],
): ProductPageViewModel {
  const categoryLinks = categories.map((category) => ({
    name: category.name,
    href: `/c/${category.slug}`,
  }));

  const breadcrumb: BreadcrumbItemViewModel[] = [
    { label: "Home", href: "/" },
    ...categoryLinks.map((category) => ({
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
