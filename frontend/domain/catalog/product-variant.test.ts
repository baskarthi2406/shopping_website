import { describe, expect, it } from "vitest";
import {
  validateProduct,
  validateVariant,
  variantAttributeSignature,
} from "./contract-validation";
import type { Product } from "./product";
import type { ProductVariant } from "./product-variant";

function variant(
  overrides: Partial<ProductVariant> = {},
): ProductVariant {
  return {
    id: "variant-1",
    sku: null,
    attributes: [],
    pricing: null,
    inventory: null,
    status: "active",
    ...overrides,
  };
}

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

describe("generic product variant model", () => {
  it("accepts one generic attribute", () => {
    expect(
      validateVariant(
        variant({ attributes: [{ name: "size", value: "0-3M" }] }),
      ),
    ).toEqual([]);
  });

  it("accepts multiple generic attributes", () => {
    expect(
      validateVariant(
        variant({
          attributes: [
            { name: "size", value: "0-3M" },
            { name: "color", value: "Pink" },
            { name: "age", value: "Infant" },
          ],
        }),
      ),
    ).toEqual([]);
  });

  it("represents size as a generic attribute, not a typed size field", () => {
    const sized = variant({
      attributes: [{ name: "size", value: "0-3M" }],
    });

    expect(sized).not.toHaveProperty("size");
    expect(sized.attributes).toEqual([{ name: "size", value: "0-3M" }]);
  });

  it("represents color as a generic attribute, not a typed color field", () => {
    const colored = variant({
      attributes: [{ name: "color", value: "Pink" }],
    });

    expect(colored).not.toHaveProperty("color");
    expect(colored.attributes).toEqual([{ name: "color", value: "Pink" }]);
  });

  it("represents size and color together as generic attributes", () => {
    expect(
      validateProduct(
        product({
          variants: [
            variant({
              id: "baby-frock-0-3m-pink",
              attributes: [
                { name: "size", value: "0-3M" },
                { name: "color", value: "Pink" },
              ],
            }),
          ],
        }),
      ),
    ).toEqual([]);
  });

  it("accepts arbitrary future attributes such as material, style, and age", () => {
    expect(
      validateVariant(
        variant({
          attributes: [
            { name: "material", value: "Cotton" },
            { name: "style", value: "A-line" },
            { name: "age", value: "0-3M" },
          ],
        }),
      ),
    ).toEqual([]);
  });

  it("rejects empty attribute names and values", () => {
    const issues = validateVariant(
      variant({
        attributes: [
          { name: " ", value: "Pink" },
          { name: "color", value: "   " },
        ],
      }),
    );

    expect(issues).toEqual([
      {
        path: "variant.attributes[0].name",
        message: "must be non-empty",
      },
      {
        path: "variant.attributes[1].value",
        message: "must be non-empty",
      },
    ]);
  });

  it("rejects duplicate attribute names within a variant", () => {
    const issues = validateVariant(
      variant({
        attributes: [
          { name: "Size", value: "0-3M" },
          { name: " size ", value: "3-6M" },
        ],
      }),
    );

    expect(issues).toEqual([
      {
        path: "variant.attributes[1].name",
        message: "must be unique within the variant",
      },
    ]);
  });

  it("treats attribute order as insignificant when detecting duplicate combinations", () => {
    expect(
      variantAttributeSignature([
        { name: "Color", value: "Pink" },
        { name: "size", value: "0-3M" },
      ]),
    ).toBe(
      variantAttributeSignature([
        { name: "size", value: "0-3M" },
        { name: "color", value: "Pink" },
      ]),
    );

    const issues = validateProduct(
      product({
        variants: [
          variant({
            id: "first",
            attributes: [
              { name: "size", value: "0-3M" },
              { name: "color", value: "Pink" },
            ],
          }),
          variant({
            id: "second",
            attributes: [
              { name: "Color", value: "Pink" },
              { name: "Size", value: "0-3M" },
            ],
          }),
        ],
      }),
    );

    expect(issues).toEqual([
      {
        path: "product.variants[1].attributes",
        message: "must be a unique attribute combination within the product",
      },
    ]);
  });

  it("keeps SKU, pricing, and inventory nullable on a valid variant", () => {
    const optionalCommerce = variant({
      sku: null,
      pricing: null,
      inventory: null,
      attributes: [{ name: "size", value: "0-3M" }],
    });

    expect(validateVariant(optionalCommerce)).toEqual([]);
    expect(optionalCommerce.sku).toBeNull();
    expect(optionalCommerce.pricing).toBeNull();
    expect(optionalCommerce.inventory).toBeNull();
  });

  it("can attach generic-attribute pricing and inventory without size or color fields", () => {
    const priced = variant({
      id: "baby-frock-0-3m-pink",
      attributes: [
        { name: "size", value: "0-3M" },
        { name: "color", value: "Pink" },
      ],
      pricing: {
        price: { amount: 799, currency: "INR" },
        compareAtPrice: null,
      },
      inventory: {
        stockOnHand: 4,
        availableToSell: 4,
        reserved: 0,
        status: "in_stock",
      },
    });

    expect(validateVariant(priced)).toEqual([]);
    expect(priced).not.toHaveProperty("size");
    expect(priced).not.toHaveProperty("color");
    expect(priced).not.toHaveProperty("rate");
    expect(priced).not.toHaveProperty("stock_on_hand");
  });

  it("accepts products whose current fixtures have no variants", () => {
    expect(validateProduct(product({ variants: [] }))).toEqual([]);
  });

  it("does not introduce Zoho or provider-specific variant fields", () => {
    const modeled = variant({
      attributes: [{ name: "size", value: "0-3M" }],
    });

    expect(modeled).not.toHaveProperty("item_id");
    expect(modeled).not.toHaveProperty("item_group_id");
    expect(modeled).not.toHaveProperty("attribute_id1");
    expect(JSON.stringify(modeled)).not.toContain("stock_on_hand");
  });
});
