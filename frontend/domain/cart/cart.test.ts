import { describe, expect, it } from "vitest";
import {
  addToCart,
  cartItemCount,
  cartSubtotal,
  EMPTY_CART,
  MAX_LINE_QUANTITY,
  parseStoredCart,
  removeFromCart,
  setCartQuantity,
} from "./cart";

const line = (variantId: string, amount = 100, maxQuantity = 5) => ({
  productId: "p1",
  variantId,
  productName: "Product",
  variantLabel: "M / Red",
  sku: "SKU-1",
  unitPrice: { amount, currency: "XTS" },
  maxQuantity,
});

describe("cart", () => {
  it("adds a line and merges repeated adds", () => {
    const cart = addToCart(addToCart(EMPTY_CART, line("v1")), line("v1"));
    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0].quantity).toBe(2);
  });

  it("caps quantity at available stock and the per-line maximum", () => {
    expect(addToCart(EMPTY_CART, line("v1", 100, 2), 5).lines[0].quantity).toBe(2);
    expect(addToCart(EMPTY_CART, line("v1", 100, 99), 50).lines[0].quantity).toBe(MAX_LINE_QUANTITY);
  });

  it("does not add a line with no available stock", () => {
    expect(addToCart(EMPTY_CART, line("v1", 100, 0)).lines).toHaveLength(0);
  });

  it("updates quantity and removes at zero", () => {
    const cart = addToCart(EMPTY_CART, line("v1"));
    expect(setCartQuantity(cart, "v1", 3).lines[0].quantity).toBe(3);
    expect(setCartQuantity(cart, "v1", 0).lines).toHaveLength(0);
  });

  it("removes a line", () => {
    const cart = addToCart(addToCart(EMPTY_CART, line("v1")), line("v2"));
    expect(removeFromCart(cart, "v1").lines.map((item) => item.variantId)).toEqual(["v2"]);
  });

  it("computes item count and subtotal in minor units", () => {
    let cart = addToCart(EMPTY_CART, line("v1", 0.1), 3);
    cart = addToCart(cart, line("v2", 464), 2);
    expect(cartItemCount(cart)).toBe(5);
    expect(cartSubtotal(cart)).toEqual({ amount: 928.3, currency: "XTS" });
  });

  it("has no subtotal when empty or with mixed currencies", () => {
    expect(cartSubtotal(EMPTY_CART)).toBeNull();
    const mixed = addToCart(addToCart(EMPTY_CART, line("v1")), {
      ...line("v2"),
      unitPrice: { amount: 1, currency: "XXX" },
    });
    expect(cartSubtotal(mixed)).toBeNull();
  });

  it("restores only valid lines from storage", () => {
    const cart = parseStoredCart({
      lines: [
        { ...line("v1"), quantity: 2 },
        { ...line("v2"), unitPrice: { amount: -1, currency: "XTS" }, quantity: 1 },
        "junk",
      ],
    });
    expect(cart.lines.map((item) => [item.variantId, item.quantity])).toEqual([["v1", 2]]);
    expect(parseStoredCart(null)).toEqual(EMPTY_CART);
  });
});
