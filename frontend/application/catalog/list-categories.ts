import type { Category } from "@/domain/catalog";
import type { CategoryRepository } from "./category-repository";

export function listCategories(
  categories: CategoryRepository,
): Promise<readonly Category[]> {
  return categories.list();
}
