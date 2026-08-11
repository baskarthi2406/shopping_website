import type { Product } from "@/domain/catalog";
import type { ProductRepository } from "./product-repository";

export function listProductsByCategory(
  products: ProductRepository,
  categorySlug: string,
): Promise<readonly Product[]> {
  return products.listByCategorySlug(categorySlug);
}
