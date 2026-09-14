import type { Category } from "@/domain/catalog";
import {
  createCollectionResponse,
  type CollectionResponse,
} from "./catalog-contracts";
import type { CategoryRepository } from "./category-repository";

/**
 * Builds the ordered category-tree response. Repositories may retain a flat
 * lookup collection; the public collection contains roots with nested children.
 */
export async function getCategoryCollection(
  categories: CategoryRepository,
): Promise<CollectionResponse<Category>> {
  const allCategories = await categories.list();
  const roots = allCategories.filter((category) => category.parentId === null);

  return createCollectionResponse(roots);
}
