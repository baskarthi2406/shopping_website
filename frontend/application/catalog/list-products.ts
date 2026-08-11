import type { Product } from "@/domain/catalog";
import type { ProductRepository } from "./product-repository";

export function listProducts(
  products: ProductRepository,
): Promise<readonly Product[]> {
  return products.list();
}
