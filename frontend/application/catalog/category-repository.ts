import type { Category } from "@/domain/catalog";

export interface CategoryRepository {
  getById(id: string): Promise<Category | null>;
  getBySlug(slug: string): Promise<Category | null>;
  list(): Promise<readonly Category[]>;
}
