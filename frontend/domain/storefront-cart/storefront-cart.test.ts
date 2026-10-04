import { describe, expect, it } from "vitest";
import {
  addStorefrontItem,
  clearStorefrontCart,
  EMPTY_STOREFRONT_CART,
  parseStoredStorefrontCart,
  removeStorefrontItem,
  setStorefrontQuantity,
  storefrontItemCount,
  storefrontSubtotal,
  type StorefrontCartDraft,
} from "./storefront-cart";

const pink = (availableToSell: number | null = 5): StorefrontCartDraft => ({
  productId: "group-1",
  productSlug: "girl-coord-set",
  productName: "Girl Coord set",
  variantId: "pink",
  sku: "GIR-0-3-PIN",
  attributes: [
    { name: "size", value: "0-3M" },
    { name: "color", value: "Pink" },
  ],
  variantLabel: "size 0-3M, color Pink",
  unitPrice: { amount: 464, currency: "INR" },
  priceLocale: "en-IN",
  availableToSell,
  imageSrc: "/api/catalog-images/pink/doc",
  imageAlt: "Girl Coord set",
});

const green = (): StorefrontCartDraft => ({
  ...pink(5),
  variantId: "green",
  sku: "GIR-0-3-GRE",
  attributes: [
    { name: "size", value: "0-3M" },
    { name: "color", value: "Green" },
  ],
  variantLabel: "size 0-3M, color Green",
});

describe("storefront cart", () => {
  it("starts empty", () => {
    expect(EMPTY_STOREFRONT_CART.lines).toEqual([]);
    expect(storefrontItemCount(EMPTY_STOREFRONT_CART)).toBe(0);
    expect(storefrontSubtotal(EMPTY_STOREFRONT_CART)).toBeNull();
  });

  it("adds a variant and increases quantity when that variant is added again", () => {
    const once = addStorefrontItem(EMPTY_STOREFRONT_CART, pink());
    const twice = addStorefrontItem(once.cart, pink());
    expect(twice.error).toBeNull();
    expect(twice.cart.lines).toHaveLength(1);
    expect(twice.cart.lines[0]?.quantity).toBe(2);
    expect(twice.cart.lines[0]?.sku).toBe("GIR-0-3-PIN");
    expect(storefrontSubtotal(twice.cart)).toEqual({ amount: 928, currency: "INR" });
  });

  it("keeps different variants as separate lines", () => {
    const cart = addStorefrontItem(addStorefrontItem(EMPTY_STOREFRONT_CART, pink()).cart, green()).cart;
    expect(cart.lines.map((line) => [line.variantId, line.quantity])).toEqual([
      ["pink", 1],
      ["green", 1],
    ]);
    expect(storefrontSubtotal(cart)).toEqual({ amount: 928, currency: "INR" });
  });

  it("removes one line and can clear the cart", () => {
    const cart = addStorefrontItem(addStorefrontItem(EMPTY_STOREFRONT_CART, pink()).cart, green()).cart;
    expect(removeStorefrontItem(cart, "pink").lines.map((line) => line.variantId)).toEqual(["green"]);
    expect(clearStorefrontCart().lines).toEqual([]);
  });

  it("increases and decreases quantity without going below 1", () => {
    const cart = addStorefrontItem(EMPTY_STOREFRONT_CART, pink(), 2).cart;
    expect(setStorefrontQuantity(cart, "pink", 3).cart.lines[0]?.quantity).toBe(3);
    const decreased = setStorefrontQuantity(cart, "pink", 1);
    expect(decreased.cart.lines[0]?.quantity).toBe(1);
    const blocked = setStorefrontQuantity(decreased.cart, "pink", 0);
    expect(blocked.error).toBe("Quantity must be at least 1.");
    expect(blocked.cart.lines[0]?.quantity).toBe(1);
  });

  it("does not exceed known stock and does not invent a limit when stock is unknown", () => {
    const limited = addStorefrontItem(EMPTY_STOREFRONT_CART, pink(1), 2);
    expect(limited.error).toBe("Only 1 available.");
    expect(limited.cart.lines).toEqual([]);

    const raised = addStorefrontItem(addStorefrontItem(EMPTY_STOREFRONT_CART, pink(2)).cart, pink(2));
    const over = setStorefrontQuantity(raised.cart, "pink", 3);
    expect(over.error).toBe("Only 2 available.");
    expect(over.cart.lines[0]?.quantity).toBe(2);

    const unknown = addStorefrontItem(EMPTY_STOREFRONT_CART, pink(null), 12);
    expect(unknown.error).toBeNull();
    expect(unknown.cart.lines[0]?.quantity).toBe(12);
  });

  it("rejects an unavailable variant and a missing price", () => {
    expect(addStorefrontItem(EMPTY_STOREFRONT_CART, pink(0)).error).toBe("Out of stock.");
    const missing = addStorefrontItem(EMPTY_STOREFRONT_CART, {
      ...pink(),
      unitPrice: { amount: 0, currency: "INR" },
    });
    expect(missing.error).toBe("Price is currently unavailable.");
    expect(missing.cart.lines).toEqual([]);
  });

  it("computes a subtotal from unit price times quantity", () => {
    let cart = addStorefrontItem(EMPTY_STOREFRONT_CART, pink(), 2).cart;
    cart = addStorefrontItem(cart, green()).cart;
    expect(storefrontItemCount(cart)).toBe(3);
    expect(storefrontSubtotal(cart)).toEqual({ amount: 1392, currency: "INR" });
  });

  it("drops a malformed stored cart and ignores credential-like fields", () => {
    expect(parseStoredStorefrontCart("not-json")).toEqual(EMPTY_STOREFRONT_CART);
    expect(parseStoredStorefrontCart(null)).toEqual(EMPTY_STOREFRONT_CART);
    const restored = parseStoredStorefrontCart({
      accessToken: "secret",
      lines: [
        { ...pink(), quantity: 2, refreshToken: "nope" },
        { ...pink(), variantId: "", quantity: 1 },
        "junk",
      ],
    });
    expect(restored.lines).toHaveLength(1);
    expect(restored.lines[0]?.quantity).toBe(2);
    expect(JSON.stringify(restored)).not.toMatch(/secret|token|authorization/i);
  });
});
