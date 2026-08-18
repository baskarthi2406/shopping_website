import type { Product } from "@/domain/catalog";
import type { IndexablePageMetadata } from "./page-metadata";

export type ProductMetadata = IndexablePageMetadata;

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
