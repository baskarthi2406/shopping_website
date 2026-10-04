import type {
  Category,
  Pricing,
  Product,
  ProductSummary,
  ProductVariant,
} from "@/domain/catalog";

export type CollectionResponse<T> = {
  readonly data: readonly T[];
};

export type Pagination = {
  /** One-based page number. */
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly hasNext: boolean;
};

export type PaginatedResponse<T> = CollectionResponse<T> & {
  readonly pagination: Pagination;
};

export type DetailResponse<T> = {
  readonly data: T;
};

export type CatalogErrorCode =
  | "not_found"
  | "invalid_request"
  | "temporarily_unavailable";

export type ErrorResponse = {
  readonly error: {
    readonly code: CatalogErrorCode;
    readonly message: string;
  };
};

export type DetailResult<T> = DetailResponse<T> | ErrorResponse;
export type CollectionResult<T> = CollectionResponse<T> | ErrorResponse;
export type PaginatedResult<T> = PaginatedResponse<T> | ErrorResponse;

/** Ordered root categories; descendants are represented recursively. */
export type CategoryListResult = CollectionResult<Category>;
export type CategoryDetailResult = DetailResult<Category>;
/** Product lists omit variants; product detail exposes the full product. */
export type ProductListResult = PaginatedResult<ProductSummary>;
export type ProductDetailResult = DetailResult<Product>;

export function createCollectionResponse<T>(
  data: readonly T[],
): CollectionResponse<T> {
  return { data };
}

export function createPagination(
  page: number,
  pageSize: number,
  total: number,
): Pagination {
  if (!Number.isInteger(page) || page < 1) {
    throw new RangeError("page must be a positive integer");
  }
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError("pageSize must be a positive integer");
  }
  if (!Number.isInteger(total) || total < 0) {
    throw new RangeError("total must be a non-negative integer");
  }

  return {
    page,
    pageSize,
    total,
    hasNext: page * pageSize < total,
  };
}

export function createPaginatedResponse<T>(
  data: readonly T[],
  pagination: Pagination,
): PaginatedResponse<T> {
  return { data, pagination };
}

export function createDetailResponse<T>(data: T): DetailResponse<T> {
  return { data };
}

export function createErrorResponse(
  code: CatalogErrorCode,
  message: string,
): ErrorResponse {
  return { error: { code, message } };
}

/**
 * One selling price for a product list. Product lists omit variants, so this
 * is set only when every variant has that same verified price. Mixed or
 * missing variant prices stay null. There is no "from" price.
 */
export function sharedVariantSellingPrice(
  variants: readonly ProductVariant[],
): Pricing | null {
  const first = variants[0]?.pricing;
  if (first === undefined || first === null) {
    return null;
  }
  const { amount, currency } = first.price;
  const shared = variants.every((variant) => {
    const price = variant.pricing?.price;
    return price !== undefined && price.amount === amount && price.currency === currency;
  });
  return shared ? { price: { amount, currency }, compareAtPrice: null } : null;
}

export function toProductSummary(product: Product): ProductSummary {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    images: product.images,
    categoryIds: product.categoryIds,
    sku: product.sku,
    uom: product.uom,
    pricing:
      product.variants.length > 0
        ? sharedVariantSellingPrice(product.variants)
        : product.pricing,
    inventory: product.inventory,
    status: product.status,
  };
}
