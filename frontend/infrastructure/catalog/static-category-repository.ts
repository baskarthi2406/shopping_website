import type { Category } from "@/domain/catalog";
import type { CategoryRepository } from "@/application/catalog/category-repository";
import { categoryRecords } from "./data/category-records";
import { mapCategory } from "./map-category";

export class StaticCategoryRepository implements CategoryRepository {
  async getById(id: string): Promise<Category | null> {
    const record = categoryRecords.find((category) => category.id === id);
    return record ? mapCategory(record) : null;
  }

  async getBySlug(slug: string): Promise<Category | null> {
    const record = categoryRecords.find((category) => category.slug === slug);
    return record ? mapCategory(record) : null;
  }

  async list(): Promise<readonly Category[]> {
    return categoryRecords.map(mapCategory);
  }
}
