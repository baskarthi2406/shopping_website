import { describe, expect, it } from "vitest";
import type { Product } from "./product";
import {
  validateInventory,
  validatePricing,
  validateProduct,
  validateProductCatalog,
} from "./contract-validation";

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "baby-frock",
    slug: "baby-frock",
    name: "Baby Frock",
    description: "Product description",
    images: [],
    categoryIds: ["baby-girl"],
    sku: null,
    uom: null,
    pricing: null,
    inventory: null,
    status: "active",
    variants: [],
    ...overrides,
  };
}

describe("catalog contract validation", () => {
  it("accepts products with unknown optional commerce data", () => {
    expect(validateProduct(product())).toEqual([]);
  });

  it("accepts generic variant attributes, SKU, UOM, pricing, and inventory", () => {
    const populated = product({
      sku: "FROCK-PARENT",
      uom: { code: "each", label: "Each" },
      pricing: {
        price: { amount: 799, currency: "INR" },
        compareAtPrice: { amount: 999, currency: "INR" },
      },
      inventory: {
        stockOnHand: 12,
        availableToSell: 10,
        reserved: 2,
        status: "in_stock",
      },
      variants: [
        {
          id: "baby-frock-pink-0-3m",
          sku: "FROCK-PINK-0-3M",
          attributes: [
            { name: "Size", value: "0-3M" },
            { name: "Color", value: "Pink" },
          ],
          pricing: {
            price: { amount: 749, currency: "INR" },
            compareAtPrice: null,
          },
          inventory: {
            stockOnHand: 3,
            availableToSell: 3,
            reserved: 0,
            status: "in_stock",
          },
          status: "active",
        },
      ],
    });

    expect(validateProduct(populated)).toEqual([]);
    expect(populated.pricing?.price.amount).toBe(799);
    expect(populated.variants[0]?.pricing?.price.amount).toBe(749);
    expect(populated.inventory?.stockOnHand).toBe(12);
    expect(populated.variants[0]?.inventory?.stockOnHand).toBe(3);
  });

  it("rejects invalid money and inventory quantities", () => {
    expect(
      validatePricing({
        price: { amount: -1, currency: "inr" },
        compareAtPrice: { amount: 2, currency: "USD" },
      }),
    ).toEqual([
      {
        path: "pricing.price.amount",
        message: "must be a finite, non-negative number",
      },
      {
        path: "pricing.price.currency",
        message: "must be a three-letter uppercase code",
      },
      {
        path: "pricing.compareAtPrice.currency",
        message: "must match the current price currency",
      },
    ]);

    expect(
      validateInventory({
        stockOnHand: -1,
        availableToSell: Number.NaN,
        reserved: null,
        status: "unknown",
      }),
    ).toHaveLength(2);
  });

  it("rejects duplicate variant ids and invalid generic attributes", () => {
    const invalidVariant = {
      id: "duplicate",
      sku: null,
      attributes: [
        { name: "Size", value: "0-3M" },
        { name: " size ", value: "" },
      ],
      pricing: null,
      inventory: null,
      status: "active" as const,
    };

    const issues = validateProduct(
      product({ variants: [invalidVariant, invalidVariant] }),
    );

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "product.variants[0].attributes[1].name",
        }),
        expect.objectContaining({
          path: "product.variants[0].attributes[1].value",
        }),
        expect.objectContaining({ path: "product.variants[1].id" }),
      ]),
    );
  });

  it("enforces unique product ids and SEO slugs across a catalog", () => {
    const issues = validateProductCatalog([
      product(),
      product({ name: "Duplicate" }),
    ]);

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "products[1].id" }),
        expect.objectContaining({ path: "products[1].slug" }),
      ]),
    );
  });

  it("keeps product ids independent from public SEO slugs", () => {
    expect(
      validateProduct(
        product({
          id: "internal-product-4891",
          slug: "pink-baby-frock",
        }),
      ),
    ).toEqual([]);
  });
});
