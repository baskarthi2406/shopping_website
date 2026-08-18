import type { Category } from "@/domain/catalog";
import type { IndexablePageMetadata } from "./page-metadata";

export type CategoryMetadata = IndexablePageMetadata;

/**
 * Category document metadata from catalog data.
 * Uses the documented product-photo stand-in when present. Site origin remains TBD.
 */
export function buildCategoryMetadata(category: Category): CategoryMetadata {
  const description =
    category.description?.trim() ||
    `${category.name} at Mini Mystiq. Baby Clothes & Toys.`;
  const image = category.image;

  return {
    title: `${category.name} | Mini Mystiq`,
    description,
    canonicalPath: `/c/${category.slug}`,
    image: image ? { src: image.src, alt: image.alt } : null,
  };
}
