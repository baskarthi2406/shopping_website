import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { Product } from "@/domain/catalog";
import { createValidateStorefrontCartHandler } from "./validate-handler";

const product: Product = {
  id: "group-1",
  slug: "girl-coord-set",
  name: "Girl Coord set",
  description: "",
  images: [],
  categoryIds: [],
  sku: null,
  uom: null,
  pricing: null,
  inventory: null,
  status: "active",
  variants: [
    {
      id: "pink",
      sku: "GIR-0-3-PIN",
      attributes: [{ name: "color", value: "Pink" }],
      pricing: { price: { amount: 464, currency: "INR" }, compareAtPrice: null },
      inventory: { stockOnHand: 1, availableToSell: 1, reserved: null, status: "in_stock" },
      status: "active",
    },
  ],
};

describe("storefront cart validation route", () => {
  const handler = createValidateStorefrontCartHandler({
    loadProduct: async (slug) => (slug === product.slug ? product : null),
    priceDisplay: { locale: "en-IN", currencies: ["INR"] },
  });

  it("accepts a current variant and rejects an empty cart", async () => {
    const accepted = await handler(
      new Request("http://localhost/api/storefront-cart/validate", {
        method: "POST",
        body: JSON.stringify({
          lines: [
            {
              productId: "group-1",
              productSlug: "girl-coord-set",
              variantId: "pink",
              quantity: 1,
              unitPrice: { amount: 464, currency: "INR" },
            },
          ],
        }),
      }),
    );
    expect(accepted.status).toBe(200);
    expect(await accepted.json()).toEqual({ ok: true, issues: [] });

    const empty = await handler(
      new Request("http://localhost/api/storefront-cart/validate", {
        method: "POST",
        body: JSON.stringify({ lines: [] }),
      }),
    );
    expect(await empty.json()).toMatchObject({ ok: false });
  });
});

describe("storefront cart client boundary", () => {
  const root = path.resolve(import.meta.dirname, "../../../..");
  const files = [
    "application/storefront-cart/browser-cart-store.ts",
    "application/storefront-cart/use-storefront-cart.ts",
    "components/storefront/product-cart-actions.tsx",
    "components/storefront/cart-view.tsx",
    "components/storefront/checkout-view.tsx",
    "components/storefront/cart-link.tsx",
  ];

  it("keeps credentials out of the browser cart modules", () => {
    for (const file of files) {
      const source = readFileSync(path.join(root, file), "utf8");
      expect(source, file).not.toMatch(/client_secret|access_token|refresh_token|authorization|organization_id/i);
      expect(source, file).not.toMatch(/zoho/i);
    }
  });
});
