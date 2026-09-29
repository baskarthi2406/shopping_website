import {
  createErrorResponse,
  type CatalogErrorCode,
  type CategoryListResult,
} from "@/application/catalog";

export type LoadCategoryCollection = () => Promise<CategoryListResult>;

const HTTP_STATUS_BY_ERROR: Readonly<Record<CatalogErrorCode, number>> = {
  not_found: 404,
  invalid_request: 400,
  temporarily_unavailable: 500,
};

function json(body: CategoryListResult, status: number): Response {
  return Response.json(body, { status });
}

/** Maps the transport-neutral application result to public HTTP semantics. */
export function createGetCategoriesHandler(
  loadCategories: LoadCategoryCollection,
): () => Promise<Response> {
  return async function getCategories(): Promise<Response> {
    try {
      const result = await loadCategories();

      if ("error" in result) {
        return json(result, HTTP_STATUS_BY_ERROR[result.error.code]);
      }

      return json(result, 200);
    } catch {
      return json(
        createErrorResponse(
          "temporarily_unavailable",
          "Category data is temporarily unavailable",
        ),
        500,
      );
    }
  };
}
