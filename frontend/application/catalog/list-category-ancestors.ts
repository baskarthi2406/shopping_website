import type { Category } from "@/domain/catalog";
import type { CategoryRepository } from "./category-repository";

const MAX_CATEGORY_DEPTH = 10;

/**
 * Parent chain of a category, root first, excluding the category itself.
 * Stops at a missing parent, a cycle, or `MAX_CATEGORY_DEPTH` levels.
 */
export async function listCategoryAncestors(
  categories: CategoryRepository,
  category: Category,
): Promise<readonly Category[]> {
  const ancestors: Category[] = [];
  const seen = new Set<string>([category.id]);
  let parentId = category.parentId;

  while (parentId !== null && ancestors.length < MAX_CATEGORY_DEPTH) {
    if (seen.has(parentId)) {
      break;
    }
    const parent = await categories.getById(parentId);
    if (parent === null) {
      break;
    }
    seen.add(parent.id);
    ancestors.unshift(parent);
    parentId = parent.parentId;
  }

  return ancestors;
}
