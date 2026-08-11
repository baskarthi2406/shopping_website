import type { Product } from "@/domain/catalog";
import type { ProductRepository } from "./product-repository";

export function getProductById(
  products: ProductRepository,
  id: string,
): Promise<Product | null> {
  return products.getById(id);
}
