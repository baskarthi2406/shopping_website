import {
  DEFAULT_PRODUCT_PAGE,
  DEFAULT_PRODUCT_PAGE_SIZE,
  type PaginatedResponse,
  type ProductCollectionQuery,
} from "@/application/catalog";
import type { Category, Product, ProductSummary } from "@/domain/catalog";

export const CATALOG_UNAVAILABLE_MESSAGE =
  "Catalog is temporarily unavailable";

export type CatalogApiDispatch = (url: URL) => Promise<Response>;

export type CatalogApiClient = {
  getCategoryTree(): Promise<readonly Category[]>;
  getProductCollection(
    query?: Partial<ProductCollectionQuery>,
  ): Promise<PaginatedResponse<ProductSummary>>;
  getProductBySlug(slug: string): Promise<Product | null>;
};

function unavailable(): Error {
  return new Error(CATALOG_UNAVAILABLE_MESSAGE);
}

function catalogUrl(path: string): URL {
  return new URL(path, "http://catalog.local");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw unavailable();
  }
}

function errorCode(payload: unknown): string | null {
  if (!isRecord(payload) || !isRecord(payload.error)) {
    return null;
  }
  return typeof payload.error.code === "string" ? payload.error.code : null;
}

function requireOkEnvelope(response: Response, payload: unknown): void {
  if (response.ok) {
    return;
  }

  const code = errorCode(payload);
  if (code === "not_found" || code === "invalid_request") {
    return;
  }

  throw unavailable();
}

export function createCatalogApiClient(
  dispatch: CatalogApiDispatch,
): CatalogApiClient {
  return {
    async getCategoryTree() {
      const response = await dispatch(catalogUrl("/api/categories"));
      const payload = await readJson(response);
      requireOkEnvelope(response, payload);

      if (!response.ok || !isRecord(payload) || !Array.isArray(payload.data)) {
        throw unavailable();
      }

      return payload.data as Category[];
    },

    async getProductCollection(query = {}) {
      const page = query.page ?? DEFAULT_PRODUCT_PAGE;
      const pageSize = query.pageSize ?? DEFAULT_PRODUCT_PAGE_SIZE;
      const url = catalogUrl("/api/products");
      url.searchParams.set("page", String(page));
      url.searchParams.set("pageSize", String(pageSize));

      const response = await dispatch(url);
      const payload = await readJson(response);
      requireOkEnvelope(response, payload);

      if (
        !response.ok ||
        !isRecord(payload) ||
        !Array.isArray(payload.data) ||
        !isRecord(payload.pagination)
      ) {
        throw unavailable();
      }

      return payload as PaginatedResponse<ProductSummary>;
    },

    async getProductBySlug(slug: string) {
      const response = await dispatch(
        catalogUrl(`/api/products/${encodeURIComponent(slug)}`),
      );
      const payload = await readJson(response);
      requireOkEnvelope(response, payload);

      if (response.status === 404 || response.status === 400) {
        return null;
      }

      if (!response.ok || !isRecord(payload) || !isRecord(payload.data)) {
        throw unavailable();
      }

      return payload.data as Product;
    },
  };
}
