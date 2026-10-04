import { describe, expect, it } from "vitest";
import type { Inventory, Pricing, Product, ProductVariant } from "@/domain/catalog";
import type { PriceDisplayConfig } from "@/application/catalog/product-commerce-view-model";
import { toCartCandidates } from "./cart-candidate";
import { validateStorefrontCart } from "./validate-storefront-cart";
import { validateCheckoutDetails } from "./checkout-details";
import {
  readStoredStorefrontCart,
  STOREFRONT_CART_STORAGE_KEY,
  writeStoredStorefrontCart,
} from "./browser-cart-store";
import { addStorefrontItem, EMPTY_STOREFRONT_CART, storefrontSubtotal } from "@/domain/storefront-cart/storefront-cart";
import { STOREFRONT_TAX_NOTE, STOREFRONT_TAX_POLICY } from "./tax-policy";

const priceDisplay: PriceDisplayConfig = { locale: "en-IN", currencies: ["INR"] };

const price = (amount: number): Pricing => ({
  price: { amount, currency: "INR" },
  compareAtPrice: { amount: amount + 26, currency: "INR" },
});

const stock = (availableToSell: number | null, status: Inventory["status"] = "in_stock"): Inventory => ({
  stockOnHand: availableToSell,
  availableToSell,
  reserved: null,
  status,
});

function variant(overrides: Partial<ProductVariant> = {}): ProductVariant {
  return {
    id: "pink",
    sku: "GIR-0-3-PIN",
    attributes: [
      { name: "size", value: "0-3M" },
      { name: "color", value: "Pink" },
    ],
    pricing: price(464),
    inventory: stock(1),
    status: "active",
    ...overrides,
  };
}

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "group-1",
    slug: "girl-coord-set",
    name: "Girl Coord set",
    description: "",
    images: [{ src: "/api/catalog-images/pink/doc", alt: "Girl Coord set" }],
    categoryIds: [],
    sku: null,
    uom: null,
    pricing: null,
    inventory: null,
    status: "active",
    variants: [variant(), variant({ id: "green", sku: "GIR-0-3-GRE", attributes: [{ name: "size", value: "0-3M" }, { name: "color", value: "Green" }] })],
    ...overrides,
  };
}

describe("cart candidates", () => {
  it("prices the selected variant selling price and ignores compare-at", () => {
    const [pink] = toCartCandidates(product(), priceDisplay);
    expect(pink?.canAdd).toBe(true);
    expect(pink?.unitPrice).toEqual({ amount: 464, currency: "INR" });
    expect(pink?.sku).toBe("GIR-0-3-PIN");
    expect(pink?.variantLabel).toBe("size 0-3M, color Pink");
    expect(pink).not.toHaveProperty("compareAtPrice");
    expect(JSON.stringify(pink)).not.toMatch(/490/);
  });

  it("blocks an out-of-stock variant and a missing price", () => {
    const [soldOut] = toCartCandidates(
      product({ variants: [variant({ inventory: stock(0, "out_of_stock") })] }),
      priceDisplay,
    );
    expect(soldOut?.canAdd).toBe(false);
    expect(soldOut?.blockMessage).toBe("Out of stock");

    const [unpriced] = toCartCandidates(product(), null);
    expect(unpriced?.canAdd).toBe(false);
    expect(unpriced?.unitPrice).toBeNull();
    expect(unpriced?.blockMessage).toBe("Price is currently unavailable.");
  });

  it("leaves quantity unlimited when stock is unknown", () => {
    const [unknown] = toCartCandidates(
      product({ variants: [variant({ inventory: { stockOnHand: null, availableToSell: null, reserved: null, status: "unknown" } })] }),
      priceDisplay,
    );
    expect(unknown?.canAdd).toBe(true);
    expect(unknown?.availableToSell).toBeNull();
  });
});

describe("cart validation", () => {
  const line = {
    productId: "group-1",
    productSlug: "girl-coord-set",
    variantId: "pink",
    quantity: 1,
    unitPrice: { amount: 464, currency: "INR" },
  };

  it("rejects an empty cart, a missing product, and a stale variant", () => {
    expect(validateStorefrontCart([], () => null, priceDisplay).ok).toBe(false);
    expect(validateStorefrontCart([line], () => null, priceDisplay).issues[0]?.message).toBe(
      "This product is no longer available.",
    );
    const missingVariant = validateStorefrontCart(
      [{ ...line, variantId: "gone" }],
      () => product(),
      priceDisplay,
    );
    expect(missingVariant.issues[0]?.message).toBe("This variant is no longer available.");
  });

  it("accepts the current variant and blocks a price that is no longer displayable", () => {
    expect(validateStorefrontCart([line], () => product(), priceDisplay).ok).toBe(true);
    const hidden = validateStorefrontCart([line], () => product(), null);
    expect(hidden.ok).toBe(false);
    expect(hidden.issues[0]?.message).toBe(
      "Girl Coord set (size 0-3M, color Pink): Price is currently unavailable.",
    );
  });

  it("blocks a changed selling price without rewriting the cart line", () => {
    const stale = { ...line, unitPrice: { amount: 400, currency: "INR" as const } };
    const before = structuredClone(stale);
    const result = validateStorefrontCart([stale], () => product(), priceDisplay);
    expect(result.ok).toBe(false);
    expect(result.issues[0]?.message).toBe(
      "The price for Girl Coord set (size 0-3M, color Pink) changed. Review your cart and add it again before checkout.",
    );
    expect(stale).toEqual(before);
  });

  it("blocks a quantity the current catalog can no longer fill", () => {
    const over = { ...line, quantity: 2 };
    const result = validateStorefrontCart([over], () => product(), priceDisplay);
    expect(result.ok).toBe(false);
    expect(result.issues[0]?.message).toBe(
      "Only 1 available for Girl Coord set (size 0-3M, color Pink).",
    );
    expect(over.quantity).toBe(2);

    const soldOut = validateStorefrontCart(
      [line],
      () => product({ variants: [variant({ inventory: stock(0, "out_of_stock") })] }),
      priceDisplay,
    );
    expect(soldOut.issues[0]?.message).toContain("Out of stock");
    expect(soldOut.issues[0]?.message).toContain("Girl Coord set");
  });

  it("blocks an inactive variant", () => {
    const inactive = validateStorefrontCart(
      [line],
      () => product({ variants: [variant({ status: "inactive" })] }),
      priceDisplay,
    );
    expect(inactive.ok).toBe(false);
    expect(inactive.issues[0]?.message).toContain("Not currently available");
  });
});

describe("storefront tax policy", () => {
  it("leaves GST unresolved and does not add tax to the selling price", () => {
    expect(STOREFRONT_TAX_POLICY).toBe("unresolved");
    expect(STOREFRONT_TAX_NOTE).not.toMatch(/including GST|GST are not included|\+ .*GST|5%/i);
    const cart = addStorefrontItem(EMPTY_STOREFRONT_CART, {
      productId: "group-1",
      productSlug: "girl-coord-set",
      productName: "Girl Coord set",
      variantId: "pink",
      sku: "GIR-0-3-PIN",
      attributes: [{ name: "color", value: "Pink" }],
      variantLabel: "color Pink",
      unitPrice: { amount: 464, currency: "INR" },
      priceLocale: "en-IN",
      availableToSell: 1,
      imageSrc: null,
      imageAlt: null,
    }).cart;
    expect(storefrontSubtotal(cart)).toEqual({ amount: 464, currency: "INR" });
    expect(storefrontSubtotal(cart)?.amount).not.toBe(487.2);
  });
});

describe("checkout details", () => {
  it("requires a name, a mobile number, and an address", () => {
    const missing = validateCheckoutDetails({ name: " ", mobile: "", address: "" });
    expect(missing.ok).toBe(false);
    if (!missing.ok) {
      expect(missing.errors.name).toBeTruthy();
      expect(missing.errors.mobile).toBeTruthy();
      expect(missing.errors.address).toBeTruthy();
    }
  });

  it("rejects an invalid mobile number and accepts a valid checkout", () => {
    const invalid = validateCheckoutDetails({
      name: "Asha",
      mobile: "12345",
      address: "12 Avanam Road, Peravurani",
    });
    expect(invalid.ok).toBe(false);
    const valid = validateCheckoutDetails({
      name: "Asha",
      mobile: "+91 98765 43210",
      address: "12 Avanam Road, Peravurani",
    });
    expect(valid).toEqual({
      ok: true,
      details: { name: "Asha", mobile: "9876543210", address: "12 Avanam Road, Peravurani" },
    });
  });
});

describe("browser cart storage", () => {
  it("persists the cart and recovers from malformed storage", () => {
    const saved = new Map<string, string>();
    const storage = {
      getItem: (key: string) => saved.get(key) ?? null,
      setItem: (key: string, value: string) => {
        saved.set(key, value);
      },
    };
    const cart = addStorefrontItem(EMPTY_STOREFRONT_CART, {
      productId: "group-1",
      productSlug: "girl-coord-set",
      productName: "Girl Coord set",
      variantId: "pink",
      sku: "GIR-0-3-PIN",
      attributes: [{ name: "color", value: "Pink" }],
      variantLabel: "color Pink",
      unitPrice: { amount: 464, currency: "INR" },
      priceLocale: "en-IN",
      availableToSell: 1,
      imageSrc: null,
      imageAlt: null,
    }).cart;
    writeStoredStorefrontCart(storage, cart);
    expect(saved.has(STOREFRONT_CART_STORAGE_KEY)).toBe(true);
    expect(saved.get(STOREFRONT_CART_STORAGE_KEY)).not.toMatch(/token|secret|authorization/i);
    expect(readStoredStorefrontCart(storage).lines[0]?.sku).toBe("GIR-0-3-PIN");
    saved.set(STOREFRONT_CART_STORAGE_KEY, "{");
    expect(readStoredStorefrontCart(storage)).toEqual(EMPTY_STOREFRONT_CART);
  });
});
