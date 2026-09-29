import type { Category } from "@/domain/catalog";
import type { CategoryRepository } from "@/application/catalog/category-repository";
import { categoryRecords } from "./data/category-records";
import { mapCategories } from "./map-category";

export class StaticCategoryRepository implements CategoryRepository {
  private readonly categories = mapCategories(categoryRecords);

  async getById(id: string): Promise<Category | null> {
    return this.categories.find((category) => category.id === id) ?? null;
  }

  async getBySlug(slug: string): Promise<Category | null> {
    return this.categories.find((category) => category.slug === slug) ?? null;
  }

  async list(): Promise<readonly Category[]> {
    return this.categories;
  }
}
