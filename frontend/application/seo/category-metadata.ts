import type { Category } from "@/domain/catalog";

export type CategoryMetadata = {
  readonly title: string;
  readonly description: string;
  readonly canonicalPath: string;
};

/**
 * Category document metadata from catalog data.
 * Does not invent marketing copy. Site origin remains TBD (no absolute domain).
 */
export function buildCategoryMetadata(category: Category): CategoryMetadata {
  const description =
    category.description?.trim() ||
    `${category.name} at Mini Mystiq. Baby Clothes & Toys.`;

  return {
    title: `${category.name} | Mini Mystiq`,
    description,
    canonicalPath: `/c/${category.slug}`,
  };
}
