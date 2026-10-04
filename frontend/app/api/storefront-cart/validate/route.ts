import { catalog } from "@/config/catalog";
import { priceDisplay } from "@/config/commerce";
import { createValidateStorefrontCartHandler } from "./validate-handler";

const postValidate = createValidateStorefrontCartHandler({
  loadProduct: (slug) => catalog.getProductBySlug(slug),
  priceDisplay,
});

export function POST(request: Request): Promise<Response> {
  return postValidate(request);
}
