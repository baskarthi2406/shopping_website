import type { Product } from "@/domain/catalog";
import type { ProductRepository } from "@/application/catalog/product-repository";
import { categoryRecords } from "./data/category-records";

/**
 * Product repository over a catalog snapshot. Category membership is the
 * product's storefront `categoryIds`; categories themselves stay in the
 * storefront category records. No featured selection exists yet.
 */
export class SnapshotProductRepository implements ProductRepository {
  constructor(private readonly products: () => Promise<readonly Product[]>) {}

  async getById(id: string): Promise<Product | null> {
    return (await this.products()).find((product) => product.id === id) ?? null;
  }

  async getBySlug(slug: string): Promise<Product | null> {
    return (await this.products()).find((product) => product.slug === slug) ?? null;
  }

  async list(): Promise<readonly Product[]> {
    return this.products();
  }

  async listByCategorySlug(slug: string): Promise<readonly Product[]> {
    const category = categoryRecords.find((item) => item.slug === slug);
    if (!category) {
      return [];
    }
    return (await this.products()).filter((product) =>
      product.categoryIds.includes(category.id),
    );
  }

  async listFeatured(): Promise<readonly Product[]> {
    return [];
  }
}
