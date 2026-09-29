import {
  createErrorResponse,
  type CatalogErrorCode,
  type ProductDetailResult,
} from "@/application/catalog";

export type LoadProductDetail = (slug: string) => Promise<ProductDetailResult>;

const HTTP_STATUS_BY_ERROR: Readonly<Record<CatalogErrorCode, number>> = {
  not_found: 404,
  invalid_request: 400,
  temporarily_unavailable: 500,
};

function json(body: ProductDetailResult, status: number): Response {
  return Response.json(body, { status });
}

/** Parses the public SEO slug path and maps application results to HTTP. */
export function createGetProductDetailHandler(
  loadProduct: LoadProductDetail,
): (request: Request, slug: string) => Promise<Response> {
  return async function getProductDetail(
    request: Request,
    slug: string,
  ): Promise<Response> {
    const searchParams = new URL(request.url).searchParams;
    for (const name of searchParams.keys()) {
      return json(
        createErrorResponse(
          "invalid_request",
          `Unsupported query parameter: ${name}`,
        ),
        400,
      );
    }

    try {
      const result = await loadProduct(slug);

      if ("error" in result) {
        return json(result, HTTP_STATUS_BY_ERROR[result.error.code]);
      }

      return json(result, 200);
    } catch {
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
