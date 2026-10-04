import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => undefined }),
}));
import { ProductCartActions } from "./product-cart-actions";
import { CartLineRow } from "./cart-view";
import { OrderReview } from "./checkout-view";
import type { CartCandidate } from "@/application/storefront-cart/cart-candidate";
import { STOREFRONT_TAX_NOTE } from "@/application/storefront-cart/tax-policy";
import type { StorefrontCart } from "@/domain/storefront-cart/storefront-cart";

const ready: CartCandidate = {
  productId: "group-1",
  productSlug: "girl-coord-set",
  productName: "Girl Coord set",
  variantId: "pink",
  sku: "GIR-0-3-PIN",
  attributes: [{ name: "color", value: "Pink" }],
  variantLabel: "color Pink",
  unitPrice: { amount: 464, currency: "INR" },
  unitPriceLabel: "₹464.00",
  priceLocale: "en-IN",
  imageSrc: null,
  imageAlt: null,
  availableToSell: 1,
  canAdd: true,
  blockMessage: null,
};

const cart: StorefrontCart = {
  lines: [
    {
      productId: ready.productId,
      productSlug: ready.productSlug,
      productName: ready.productName,
      variantId: ready.variantId,
      sku: ready.sku,
      attributes: ready.attributes,
      variantLabel: ready.variantLabel,
      unitPrice: { amount: 464, currency: "INR" },
      priceLocale: "en-IN",
      quantity: 2,
      availableToSell: 2,
      imageSrc: null,
      imageAlt: null,
    },
  ],
};

describe("product cart actions", () => {
  it("asks for a variant and hides purchase buttons when the price is unavailable", () => {
    const unselected = renderToStaticMarkup(createElement(ProductCartActions, { choice: null }));
    expect(unselected).toContain("Select a variant before adding it to the cart.");
    expect(unselected).not.toContain("<button");

    const blocked = renderToStaticMarkup(
      createElement(ProductCartActions, {
        choice: { ...ready, canAdd: false, unitPrice: null, unitPriceLabel: null, priceLocale: null, blockMessage: "Price is currently unavailable." },
      }),
    );
    expect(blocked).toContain("Price is currently unavailable.");
    expect(blocked).not.toContain("Add to cart");
  });

  it("offers add to cart and buy now for an available variant", () => {
    const html = renderToStaticMarkup(createElement(ProductCartActions, { choice: ready }));
    expect(html).toContain("Add to cart");
    expect(html).toContain("Buy now");
  });
});

describe("cart line quantity", () => {
  it("shows Qty beside the product name and price", () => {
    const html = renderToStaticMarkup(
      createElement(CartLineRow, {
        line: cart.lines[0],
        notice: null,
        onSetQuantity: () => null,
        onRemove: () => undefined,
      }),
    );
    expect(html).toContain("Girl Coord set");
    expect(html).toContain("Qty:");
    expect(html).toContain(">2<");
    expect(html).toContain("tabular-nums");
    expect(html).toContain("Decrease quantity of Girl Coord set");
    expect(html).toContain("Increase quantity of Girl Coord set");
  });
});

describe("order review", () => {
  it("shows the cart, customer, and that submission is not connected", () => {
    const html = renderToStaticMarkup(
      createElement(OrderReview, {
        cart,
        details: { name: "Asha", mobile: "9876543210", address: "12 Avanam Road, Peravurani" },
        onEditDetails: () => undefined,
      }),
    );
    expect(html).toContain("Order review");
    expect(html).toContain("Order submission is not connected yet.");
    expect(html).toContain("Girl Coord set");
    expect(html).toContain("color Pink");
    expect(html).toContain("GIR-0-3-PIN");
    expect(html).toContain("Asha");
    expect(html).toContain("9876543210");
    expect(html).toContain("12 Avanam Road, Peravurani");
    expect(html).toContain('href="/cart"');
    expect(html).toContain("Subtotal");
    expect(html).toContain(STOREFRONT_TAX_NOTE);
    expect(html).not.toMatch(/including GST|GST are not included|\+ .*GST|5%/i);
    expect(html).not.toContain("487");
    expect(html).not.toMatch(/order placed|payment successful/i);
  });
});
