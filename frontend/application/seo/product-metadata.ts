import type { Product } from "@/domain/catalog";

export type ProductMetadata = {
  readonly title: string;
  readonly description: string;
  readonly canonicalPath: string;
  readonly image: { readonly src: string; readonly alt: string } | null;
};

/**
 * Product document metadata from catalog data.
 * Does not invent marketing copy, price, or availability. Site origin remains TBD.
 */
export function buildProductMetadata(product: Product): ProductMetadata {
  const description =
    product.description.trim() ||
    `${product.name} at Mini Mystiq. Baby Clothes & Toys.`;
  const image = product.images[0];

  return {
    title: `${product.name} | Mini Mystiq`,
    description,
    canonicalPath: `/p/${product.slug}`,
    image: image ? { src: image.src, alt: image.alt } : null,
  };
}
