import { CATALOG_IMAGE_ID_PATTERN } from "@/app/api/catalog-images/catalog-image-path";

export type CatalogImageBytes = { readonly contentType: string; readonly body: ArrayBuffer };

/** Resolves null when the image is not part of the current catalog or does not exist. */
export type LoadCatalogImage = (itemId: string, documentId: string) => Promise<CatalogImageBytes | null>;

const CACHE_CONTROL = "public, max-age=86400";

function errorResponse(status: number, code: string, message: string): Response {
  return Response.json(
    { error: { code, message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export function createGetCatalogImageHandler(
  loadImage: LoadCatalogImage,
  onError: (error: unknown) => void = () => {},
) {
  return async function getCatalogImage(itemId: string, documentId: string): Promise<Response> {
    if (!CATALOG_IMAGE_ID_PATTERN.test(itemId) || !CATALOG_IMAGE_ID_PATTERN.test(documentId)) {
      return errorResponse(404, "not_found", "Catalog image was not found");
    }
    let image: CatalogImageBytes | null;
    try {
      image = await loadImage(itemId, documentId);
    } catch (error) {
      onError(error);
      return errorResponse(503, "temporarily_unavailable", "Catalog image is temporarily unavailable");
    }
    if (image === null) {
      return errorResponse(404, "not_found", "Catalog image was not found");
    }
    return new Response(image.body, {
      status: 200,
      headers: {
        "Content-Type": image.contentType,
        "Content-Length": String(image.body.byteLength),
        "Cache-Control": CACHE_CONTROL,
        "X-Content-Type-Options": "nosniff",
      },
    });
  };
}
