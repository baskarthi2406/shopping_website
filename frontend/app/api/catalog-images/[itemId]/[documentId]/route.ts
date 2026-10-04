import { loadCatalogImage, logCatalogImageError } from "@/config/catalog-images";
import { createGetCatalogImageHandler } from "./get-catalog-image-handler";

export const dynamic = "force-dynamic";

const getCatalogImage = createGetCatalogImageHandler(loadCatalogImage, logCatalogImageError);

export async function GET(
  _request: Request,
  context: { params: Promise<{ itemId: string; documentId: string }> },
): Promise<Response> {
  const { itemId, documentId } = await context.params;
  return getCatalogImage(itemId, documentId);
}
