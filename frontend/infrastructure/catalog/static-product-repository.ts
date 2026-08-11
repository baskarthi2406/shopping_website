import type { Product } from "@/domain/catalog";
import type { ProductRepository } from "@/application/catalog/product-repository";
import { categoryRecords } from "./data/category-records";
import { productRecords } from "./data/product-records";
import { mapProduct } from "./map-product";

export class StaticProductRepository implements ProductRepository {
  async getById(id: string): Promise<Product | null> {
    const record = productRecords.find((product) => product.id === id);
    return record ? mapProduct(record) : null;
  }

  async getBySlug(slug: string): Promise<Product | null> {
    const record = productRecords.find((product) => product.slug === slug);
    return record ? mapProduct(record) : null;
  }

  async list(): Promise<readonly Product[]> {
    return productRecords.map(mapProduct);
  }

  async listByCategorySlug(slug: string): Promise<readonly Product[]> {
    const category = categoryRecords.find((item) => item.slug === slug);
    if (!category) {
      return [];
    }

    return productRecords
      .filter((product) => product.categoryIds.includes(category.id))
      .map(mapProduct);
  }

  async listFeatured(): Promise<readonly Product[]> {
    return [];
  }
}
