import { catalog } from "@/config/catalog";
import { createGetProductDetailHandler } from "./get-product-detail-handler";

/** Slug-specific responses are dynamic but deterministic over static data. */
export const dynamic = "force-dynamic";

const getProduct = createGetProductDetailHandler((slug) =>
  catalog.getProductDetail(slug),
);

type ProductDetailRouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(
  request: Request,
  { params }: ProductDetailRouteContext,
): Promise<Response> {
  const { slug } = await params;
  return getProduct(request, slug);
}
