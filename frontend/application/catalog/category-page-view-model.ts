import type { Category, Product } from "@/domain/catalog";

export type ProductCardViewModel = {
  readonly href: string;
  readonly name: string;
  readonly description: string;
  readonly image: { readonly src: string; readonly alt: string } | null;
};

export type CategoryPageViewModel = {
  readonly slug: string;
  readonly name: string;
  readonly description: string | null;
  readonly canonicalPath: string;
  readonly productCount: number;
  readonly products: readonly ProductCardViewModel[];
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

export function toCategoryPageViewModel(
  category: Category,
  products: readonly Product[],
): CategoryPageViewModel {
  return {
    slug: category.slug,
    name: category.name,
    description: category.description,
    canonicalPath: `/c/${category.slug}`,
    productCount: products.length,
    products: products.map(toProductCardViewModel),
  };
}
