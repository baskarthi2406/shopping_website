import type { ProductSummary } from "@/domain/catalog";
import {
  createPaginatedResponse,
  createPagination,
  toProductSummary,
  type PaginatedResponse,
} from "./catalog-contracts";
import type { ProductRepository } from "./product-repository";

export const DEFAULT_PRODUCT_PAGE = 1;
export const DEFAULT_PRODUCT_PAGE_SIZE = 12;

export type ProductCollectionQuery = {
  readonly page: number;
  readonly pageSize: number;
};

/** Applies stable ordering and page-number pagination to product summaries. */
export async function getProductCollection(
  products: ProductRepository,
  query: ProductCollectionQuery,
): Promise<PaginatedResponse<ProductSummary>> {
  createPagination(query.page, query.pageSize, 0);

  const allProducts = await products.list();
  const offset = (query.page - 1) * query.pageSize;
  const data = allProducts
    .slice(offset, offset + query.pageSize)
    .map(toProductSummary);

  return createPaginatedResponse(
    data,
    createPagination(query.page, query.pageSize, allProducts.length),
  );
}
