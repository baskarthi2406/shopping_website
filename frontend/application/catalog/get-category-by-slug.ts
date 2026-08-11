import type { Category } from "@/domain/catalog";
import type { CategoryRepository } from "./category-repository";

export function getCategoryBySlug(
  categories: CategoryRepository,
  slug: string,
): Promise<Category | null> {
  return categories.getBySlug(slug);
}
