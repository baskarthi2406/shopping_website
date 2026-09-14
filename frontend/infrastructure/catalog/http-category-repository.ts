import type { CategoryRepository } from "@/application/catalog";
import type { Category } from "@/domain/catalog";
import type { CatalogApiClient } from "./catalog-api-client";

export function flattenCategoryTree(
  roots: readonly Category[],
): readonly Category[] {
  const flattened: Category[] = [];
  const seen = new Set<string>();

  function visit(category: Category): void {
    if (seen.has(category.id)) {
      return;
    }
    seen.add(category.id);
    flattened.push(category);
    for (const child of category.children) {
      visit(child);
    }
  }

  for (const root of roots) {
    visit(root);
  }

  return flattened;
}

export class HttpCategoryRepository implements CategoryRepository {
  constructor(private readonly api: CatalogApiClient) {}

  private async all(): Promise<readonly Category[]> {
    return flattenCategoryTree(await this.api.getCategoryTree());
  }

  async getById(id: string): Promise<Category | null> {
    return (await this.all()).find((category) => category.id === id) ?? null;
  }

  async getBySlug(slug: string): Promise<Category | null> {
    return (await this.all()).find((category) => category.slug === slug) ?? null;
  }

  async list(): Promise<readonly Category[]> {
    return this.all();
  }
}
