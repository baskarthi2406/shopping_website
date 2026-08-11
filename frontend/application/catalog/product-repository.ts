import type { Product } from "@/domain/catalog";

export interface ProductRepository {
  getById(id: string): Promise<Product | null>;
  getBySlug(slug: string): Promise<Product | null>;
  list(): Promise<readonly Product[]>;
  listByCategorySlug(slug: string): Promise<readonly Product[]>;
  listFeatured(): Promise<readonly Product[]>;
}
