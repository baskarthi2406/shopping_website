import {
  createErrorResponse,
  DEFAULT_PRODUCT_PAGE,
  DEFAULT_PRODUCT_PAGE_SIZE,
  type ErrorResponse,
  type PaginatedResponse,
  type ProductCollectionQuery,
} from "@/application/catalog";
import type { ProductSummary } from "@/domain/catalog";

export type LoadProductCollection = (
  query: ProductCollectionQuery,
) => Promise<PaginatedResponse<ProductSummary>>;

type QueryResult =
  | { readonly query: ProductCollectionQuery }
  | { readonly error: ErrorResponse };

const SUPPORTED_PARAMETERS = new Set(["page", "pageSize"]);

function parsePositiveInteger(
  searchParams: URLSearchParams,
  name: "page" | "pageSize",
  fallback: number,
): number | null {
  const values = searchParams.getAll(name);
  if (values.length === 0) {
    return fallback;
  }
  if (values.length !== 1 || !/^[1-9]\d*$/.test(values[0] ?? "")) {
    return null;
  }

  const value = Number(values[0]);
  return Number.isSafeInteger(value) ? value : null;
}

function parseQuery(request: Request): QueryResult {
  const searchParams = new URL(request.url).searchParams;
  for (const name of searchParams.keys()) {
    if (!SUPPORTED_PARAMETERS.has(name)) {
      return {
        error: createErrorResponse(
          "invalid_request",
          `Unsupported query parameter: ${name}`,
        ),
      };
    }
  }

  const page = parsePositiveInteger(
    searchParams,
    "page",
    DEFAULT_PRODUCT_PAGE,
  );
  const pageSize = parsePositiveInteger(
    searchParams,
    "pageSize",
    DEFAULT_PRODUCT_PAGE_SIZE,
  );

  if (page === null || pageSize === null) {
    return {
      error: createErrorResponse(
        "invalid_request",
        "page and pageSize must be positive integers",
      ),
    };
  }

  return { query: { page, pageSize } };
}

function json(
  body: PaginatedResponse<ProductSummary> | ErrorResponse,
  status: number,
): Response {
  return Response.json(body, { status });
}

/** Parses HTTP query values and maps safe application results to responses. */
export function createGetProductsHandler(
  loadProducts: LoadProductCollection,
): (request: Request) => Promise<Response> {
  return async function getProducts(request: Request): Promise<Response> {
    const queryResult = parseQuery(request);
    if ("error" in queryResult) {
      return json(queryResult.error, 400);
    }

    try {
      return json(await loadProducts(queryResult.query), 200);
    } catch (error) {
      if (error instanceof RangeError) {
        return json(
          createErrorResponse(
            "invalid_request",
            "page and pageSize must be positive integers",
          ),
          400,
        );
      }

      return json(
        createErrorResponse(
          "temporarily_unavailable",
          "Product data is temporarily unavailable",
        ),
        500,
      );
    }
  };
}
