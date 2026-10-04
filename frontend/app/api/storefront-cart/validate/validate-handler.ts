import type { Product } from "@/domain/catalog";
import type { PriceDisplayConfig } from "@/application/catalog/product-commerce-view-model";
import {
  validateStorefrontCart,
  type StorefrontCartCheckLine,
  type StorefrontCartIssue,
} from "@/application/storefront-cart/validate-storefront-cart";

export type LoadCartProduct = (slug: string) => Promise<Product | null>;

const MAX_BODY_CHARS = 100_000;
const MAX_LINES = 40;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseCartValidationBody(value: unknown): StorefrontCartCheckLine[] | null {
  if (!isRecord(value) || !Array.isArray(value.lines) || value.lines.length > MAX_LINES) {
    return null;
  }
  const lines: StorefrontCartCheckLine[] = [];
  for (const raw of value.lines) {
    if (
      !isRecord(raw) ||
      typeof raw.productId !== "string" ||
      typeof raw.productSlug !== "string" ||
      typeof raw.variantId !== "string" ||
      typeof raw.quantity !== "number" ||
      !isRecord(raw.unitPrice) ||
      typeof raw.unitPrice.amount !== "number" ||
      typeof raw.unitPrice.currency !== "string"
    ) {
      return null;
    }
    lines.push({
      productId: raw.productId,
      productSlug: raw.productSlug,
      variantId: raw.variantId,
      quantity: raw.quantity,
      unitPrice: { amount: raw.unitPrice.amount, currency: raw.unitPrice.currency },
    });
  }
  return lines;
}

export function createValidateStorefrontCartHandler(options: {
  readonly loadProduct: LoadCartProduct;
  readonly priceDisplay: PriceDisplayConfig | null;
}): (request: Request) => Promise<Response> {
  return async function postValidateStorefrontCart(request: Request): Promise<Response> {
    let text: string;
    try {
      text = await request.text();
    } catch {
      return Response.json({ ok: false, issues: [{ variantId: "", message: "The cart could not be checked." }] }, { status: 400 });
    }
    if (text.length > MAX_BODY_CHARS) {
      return Response.json({ ok: false, issues: [{ variantId: "", message: "The cart could not be checked." }] }, { status: 400 });
    }

    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return Response.json({ ok: false, issues: [{ variantId: "", message: "The cart could not be checked." }] }, { status: 400 });
    }

    const lines = parseCartValidationBody(body);
    if (lines === null) {
      return Response.json({ ok: false, issues: [{ variantId: "", message: "The cart could not be checked." }] }, { status: 400 });
    }

    try {
      const products = new Map<string, Product | null>();
      for (const line of lines) {
        if (!products.has(line.productSlug)) {
          products.set(line.productSlug, await options.loadProduct(line.productSlug));
        }
      }
      const result = validateStorefrontCart(
        lines,
        (slug) => products.get(slug) ?? null,
        options.priceDisplay,
      );
      return Response.json({ ok: result.ok, issues: result.issues satisfies readonly StorefrontCartIssue[] });
    } catch {
      return Response.json(
        { ok: false, issues: [{ variantId: "", message: "The catalog could not be checked. Try again." }] },
        { status: 503 },
      );
    }
  };
}
