import type { Product } from "@/domain/catalog";
import type { ProductRepository } from "./product-repository";

export function getProductBySlug(
  products: ProductRepository,
  slug: string,
): Promise<Product | null> {
  return products.getBySlug(slug);
}
