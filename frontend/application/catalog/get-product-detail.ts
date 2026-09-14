import { isCatalogSlug } from "@/domain/catalog";
import {
  createDetailResponse,
  createErrorResponse,
  type ProductDetailResult,
} from "./catalog-contracts";
import type { ProductRepository } from "./product-repository";

/**
 * Looks up one product by its public SEO slug and returns the detail envelope.
 * Unknown well-formed slugs are `not_found`; invalid slug syntax is
 * `invalid_request`.
 */
export async function getProductDetail(
  products: ProductRepository,
  slug: string,
): Promise<ProductDetailResult> {
  if (!isCatalogSlug(slug)) {
    return createErrorResponse(
      "invalid_request",
      "Product slug must be a valid catalog slug",
    );
  }

  const product = await products.getBySlug(slug);
  if (product === null) {
    return createErrorResponse("not_found", "Product was not found");
  }

  return createDetailResponse(product);
}
