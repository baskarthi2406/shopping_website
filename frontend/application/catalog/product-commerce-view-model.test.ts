import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { Inventory, Pricing, Product, ProductVariant } from "@/domain/catalog";
import {
  AVAILABILITY_NOT_CONFIRMED_MESSAGE,
  NOT_CURRENTLY_AVAILABLE_MESSAGE,
  OUT_OF_STOCK_MESSAGE,
  PRICE_NOT_AVAILABLE_MESSAGE,
} from "./catalog-messages";
import {
  toProductCommerceViewModel,
  type PriceDisplayConfig,
} from "./product-commerce-view-model";

// Synthetic test data and display config only; not approved business values.
const TEST_DISPLAY: PriceDisplayConfig = { locale: "en-IN", currencies: ["INR"] };
const expectedPrice = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

const pricing = (amount: number, currency = "INR", compareAt: number | null = null): Pricing => ({
  price: { amount, currency },
  compareAtPrice: compareAt === null ? null : { amount: compareAt, currency },
});

const stock = (
  availableToSell: number | null,
  status: Inventory["status"] = "in_stock",
): Inventory => ({ stockOnHand: availableToSell, availableToSell, reserved: 0, status });

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "test-product",
    slug: "test-product",
    name: "Test product",
    description: "Synthetic",
    images: [],
    categoryIds: [],
    sku: null,
    uom: null,
    pricing: pricing(1299),
    inventory: stock(4),
    status: "active",
    variants: [],
    ...overrides,
  };
}

const catalogShaped = product({ pricing: null, inventory: null });

const view = (item: Product, variantId?: string | null) =>
  toProductCommerceViewModel(item, { priceDisplay: TEST_DISPLAY, variantId });

describe("toProductCommerceViewModel", () => {
  it("shows today's catalog shape as price not available and unconfirmed", () => {
    expect(view(catalogShaped)).toEqual({
      price: null,
      compareAtPrice: null,
      priceMessage: PRICE_NOT_AVAILABLE_MESSAGE,
      availability: "unconfirmed",
      availabilityMessage: AVAILABILITY_NOT_CONFIRMED_MESSAGE,
      purchasable: false,
    });
  });

  it("never renders a missing, zero, or negative price as an amount", () => {
    for (const item of [
      product({ pricing: null }),
      product({ pricing: pricing(0) }),
      product({ pricing: pricing(-5) }),
    ]) {
      const result = view(item);
      expect(result.price).toBeNull();
      expect(result.priceMessage).toBe(PRICE_NOT_AVAILABLE_MESSAGE);
    }
  });

  it("formats a verified price in an approved currency", () => {
    expect(view(product())).toEqual({
      price: expectedPrice(1299),
      compareAtPrice: null,
      priceMessage: null,
      availability: null,
      availabilityMessage: null,
      purchasable: true,
    });
  });

  it("shows compare-at only when it is higher and in the same currency", () => {
    expect(view(product({ pricing: pricing(1299, "INR", 1599) })).compareAtPrice).toBe(
      expectedPrice(1599),
    );
    expect(view(product({ pricing: pricing(1299, "INR", 1299) })).compareAtPrice).toBeNull();
  });

  it("hides missing, invalid, or unapproved currencies", () => {
    for (const currency of ["", "inr", "RUPEES", "USD"]) {
      const result = view(product({ pricing: pricing(1299, currency) }));
      expect(result.price).toBeNull();
      expect(result.priceMessage).toBe(PRICE_NOT_AVAILABLE_MESSAGE);
    }
  });

  it("shows no price at all while no display config is approved", () => {
    const result = toProductCommerceViewModel(product(), { priceDisplay: null });
    expect(result.price).toBeNull();
    expect(result.priceMessage).toBe(PRICE_NOT_AVAILABLE_MESSAGE);
  });

  it("treats unknown inventory as unconfirmed, never in stock", () => {
    for (const inventory of [null, stock(3, "unknown"), stock(null)]) {
      const result = view(product({ inventory }));
      expect(result.availability).toBe("unconfirmed");
      expect(result.availabilityMessage).toBe(AVAILABILITY_NOT_CONFIRMED_MESSAGE);
      expect(result.purchasable).toBe(false);
    }
  });

  it("shows out of stock only for explicit out-of-stock data", () => {
    const result = view(product({ inventory: stock(0, "out_of_stock") }));
    expect(result.availability).toBe("out_of_stock");
    expect(result.availabilityMessage).toBe(OUT_OF_STOCK_MESSAGE);
    expect(result.price).toBe(expectedPrice(1299));
  });

  it("reports inactive products as not currently available", () => {
    const result = view(product({ status: "inactive" }));
    expect(result.availabilityMessage).toBe(NOT_CURRENTLY_AVAILABLE_MESSAGE);
    expect(result.purchasable).toBe(false);
  });

  it("uses only the selected variant's own price", () => {
    const variant: ProductVariant = {
      id: "v1",
      sku: null,
      attributes: [{ name: "option", value: "a" }],
      pricing: null,
      inventory: stock(2),
      status: "active",
    };
    const withVariant = product({ variants: [variant] });
    expect(view(withVariant).price).toBeNull();
    expect(view(withVariant).availability).toBe("unconfirmed");
    expect(view(withVariant, "v1").price).toBeNull();
    expect(
      view(product({ variants: [{ ...variant, pricing: pricing(999) }] }), "v1").price,
    ).toBe(expectedPrice(999));
  });

  it("delegates eligibility to evaluatePurchasability", () => {
    const source = readFileSync(
      new URL("./product-commerce-view-model.ts", import.meta.url),
      "utf8",
    );
    expect(source).toContain("evaluatePurchasability(");
    expect(source).not.toMatch(/availableToSell|stockOnHand|reserved/);
  });
});
