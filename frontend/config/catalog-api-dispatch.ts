import "server-only";
import { createGetCategoriesHandler } from "@/app/api/categories/get-categories-handler";
import { createGetProductsHandler } from "@/app/api/products/get-products-handler";
import { createGetProductDetailHandler } from "@/app/api/products/[slug]/get-product-detail-handler";
import type { CatalogApiDispatch } from "@/infrastructure/catalog/catalog-api-client";
import { catalogSource } from "./catalog-source";
import type { Catalog } from "./create-catalog";

/**
 * Same-process dummy API transport. Invokes the public route handlers so the
 * storefront consumes HTTP envelopes without fetching its own origin (which
 * deadlocks during RSC/build). A future external API can replace this dispatch
 * with fetch() without changing pages.
 */
export function createCatalogApiDispatch(source: Catalog): CatalogApiDispatch {
  const getCategories = createGetCategoriesHandler(() => source.getCategoryCollection());
  const getProducts = createGetProductsHandler((query) => source.getProductCollection(query));
  const getProduct = createGetProductDetailHandler((slug) => source.getProductDetail(slug));

  return async (url) => {
    const request = new Request(url);

    if (url.pathname === "/api/categories") {
      return getCategories();
    }

    const productDetail = /^\/api\/products\/([^/]+)$/.exec(url.pathname);
    if (productDetail?.[1] !== undefined) {
      return getProduct(request, decodeURIComponent(productDetail[1]));
    }

    if (url.pathname === "/api/products") {
      return getProducts(request);
    }

    return Response.json(
      {
        error: {
          code: "not_found",
          message: "Catalog endpoint was not found",
        },
      },
      { status: 404 },
    );
  };
}

export const dispatchCatalogApi: CatalogApiDispatch = createCatalogApiDispatch(catalogSource);
