import { describe, expect, it } from "vitest";
import type { Inventory, Pricing, Product, ProductVariant } from "@/domain/catalog";
import {
  AVAILABILITY_NOT_CONFIRMED_MESSAGE,
  NOT_CURRENTLY_AVAILABLE_MESSAGE,
  OUT_OF_STOCK_MESSAGE,
  PRICE_NOT_AVAILABLE_MESSAGE,
  VARIANT_COMBINATION_UNAVAILABLE_MESSAGE,
} from "./catalog-messages";
import type { PriceDisplayConfig } from "./product-commerce-view-model";
import {
  toProductPurchaseOptionsViewModel,
  toVariantSelectorViewModel,
} from "./product-variant-selector";
import { resolveVariantSelection } from "./variant-selection";

// Synthetic test data and display config only; not approved business values.
const TEST_DISPLAY: PriceDisplayConfig = { locale: "en-IN", currencies: ["INR"] };
const format = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

const pricing = (amount: number): Pricing => ({
  price: { amount, currency: "INR" },
  compareAtPrice: null,
});
const stock = (
  availableToSell: number | null,
  status: Inventory["status"] = "in_stock",
): Inventory => ({ stockOnHand: availableToSell, availableToSell, reserved: 0, status });

function variant(
  id: string,
  attributes: Record<string, string>,
  overrides: Partial<ProductVariant> = {},
): ProductVariant {
  return {
    id,
    sku: null,
    attributes: Object.entries(attributes).map(([name, value]) => ({ name, value })),
    pricing: pricing(500),
    inventory: stock(3),
    status: "active",
    ...overrides,
  };
}

function product(variants: ProductVariant[], overrides: Partial<Product> = {}): Product {
  return {
    id: "test-product",
    slug: "test-product",
    name: "Test product",
    description: "Synthetic",
    images: [],
    categoryIds: [],
    sku: null,
    uom: null,
    pricing: pricing(999),
    inventory: stock(10),
    status: "active",
    variants,
    ...overrides,
  };
}

const twoByTwo = product([
  variant("a-1", { Option: "A", Finish: "One" }, { pricing: pricing(500) }),
  variant("a-2", { Option: "A", Finish: "Two" }, { pricing: pricing(600) }),
  variant("b-1", { Option: "B", Finish: "One" }, { pricing: null }),
]);

describe("toVariantSelectorViewModel", () => {
  it("returns null for products without variants, including today's catalog shape", () => {
    expect(toVariantSelectorViewModel(product([]))).toBeNull();
    expect(
      toVariantSelectorViewModel(product([], { pricing: null, inventory: null })),
    ).toBeNull();
  });

  it("builds groups and values from real attributes in data order", () => {
    expect(toVariantSelectorViewModel(twoByTwo)).toEqual({
      groups: [
        { key: "option", label: "Option", values: ["A", "B"] },
        { key: "finish", label: "Finish", values: ["One", "Two"] },
      ],
      variants: [
        { id: "a-1", values: { option: "A", finish: "One" } },
        { id: "a-2", values: { option: "A", finish: "Two" } },
        { id: "b-1", values: { option: "B", finish: "One" } },
      ],
    });
  });

  it.each([
    ["no attributes", [variant("x", {})]],
    ["blank value", [variant("x", { Option: " " })]],
    ["blank name", [{ ...variant("x", {}), attributes: [{ name: " ", value: "A" }] }]],
    [
      "duplicate attribute name",
      [{ ...variant("x", {}), attributes: [{ name: "Option", value: "A" }, { name: "option", value: "B" }] }],
    ],
    ["inconsistent attribute names", [variant("x", { Option: "A" }), variant("y", { Finish: "B" })]],
    ["duplicate combination", [variant("x", { Option: "A" }), variant("y", { Option: " A " })]],
    ["duplicate variant id", [variant("x", { Option: "A" }), variant("x", { Option: "B" })]],
    ["blank variant id", [variant(" ", { Option: "A" })]],
  ])("does not build a selector for %s", (_label, variants) => {
    expect(toVariantSelectorViewModel(product(variants as ProductVariant[]))).toBeNull();
  });
});

describe("resolveVariantSelection", () => {
  const selector = toVariantSelectorViewModel(twoByTwo)!;

  it("requires every option and never auto-selects", () => {
    expect(resolveVariantSelection(selector, {})).toEqual({
      status: "incomplete",
      variantId: null,
      message: "Select Option, Finish",
    });
    expect(resolveVariantSelection(selector, { option: "A" }).message).toBe("Select Finish");
    expect(resolveVariantSelection(selector, { option: "Z", finish: "One" }).status).toBe(
      "incomplete",
    );

    const single = toVariantSelectorViewModel(product([variant("only", { Option: "A" })]))!;
    expect(resolveVariantSelection(single, {}).status).toBe("incomplete");
  });

  it("resolves a complete selection to the real variant id", () => {
    expect(resolveVariantSelection(selector, { option: "A", finish: "Two" })).toEqual({
      status: "matched",
      variantId: "a-2",
      message: null,
    });
  });

  it("reports combinations that no variant offers", () => {
    expect(resolveVariantSelection(selector, { option: "B", finish: "Two" })).toEqual({
      status: "unmatched",
      variantId: null,
      message: VARIANT_COMBINATION_UNAVAILABLE_MESSAGE,
    });
  });
});

describe("toProductPurchaseOptionsViewModel", () => {
  const options = { priceDisplay: TEST_DISPLAY };

  it("keeps products without variants on the product-level commerce state", () => {
    const result = toProductPurchaseOptionsViewModel(product([]), options);
    expect(result.selector).toBeNull();
    expect(result.commerceByVariant).toEqual({});
    expect(result.commerce.price).toBe(format(999));
  });

  it("blocks purchase and hides the parent price while no variant is selected", () => {
    const { commerce } = toProductPurchaseOptionsViewModel(twoByTwo, options);
    expect(commerce.purchasable).toBe(false);
    expect(commerce.price).toBeNull();
    expect(commerce.priceMessage).toBe(PRICE_NOT_AVAILABLE_MESSAGE);
    expect(commerce.availabilityMessage).toBe(AVAILABILITY_NOT_CONFIRMED_MESSAGE);
  });

  it("gives each variant its own commerce state, so switching changes the display", () => {
    const { commerceByVariant } = toProductPurchaseOptionsViewModel(twoByTwo, options);
    expect(commerceByVariant["a-1"]).toMatchObject({ price: format(500), purchasable: true });
    expect(commerceByVariant["a-2"]).toMatchObject({ price: format(600), purchasable: true });
  });

  it("never falls back to the parent price for a variant without one", () => {
    const { commerceByVariant } = toProductPurchaseOptionsViewModel(twoByTwo, options);
    expect(commerceByVariant["b-1"]).toMatchObject({
      price: null,
      priceMessage: PRICE_NOT_AVAILABLE_MESSAGE,
      purchasable: false,
    });
  });

  it("never falls back to parent inventory", () => {
    const item = product([
      variant("unknown", { Option: "A" }, { inventory: null }),
      variant("short", { Option: "B" }, { inventory: stock(0, "unknown") }),
    ]);
    const { commerceByVariant } = toProductPurchaseOptionsViewModel(item, options);
    for (const id of ["unknown", "short"]) {
      expect(commerceByVariant[id]).toMatchObject({
        availabilityMessage: AVAILABILITY_NOT_CONFIRMED_MESSAGE,
        purchasable: false,
      });
    }
  });

  it("keeps inactive and out-of-stock variants unavailable", () => {
    const item = product([
      variant("inactive", { Option: "A" }, { status: "inactive" }),
      variant("sold-out", { Option: "B" }, { inventory: stock(0, "out_of_stock") }),
    ]);
    const { commerceByVariant } = toProductPurchaseOptionsViewModel(item, options);
    expect(commerceByVariant.inactive).toMatchObject({
      availabilityMessage: NOT_CURRENTLY_AVAILABLE_MESSAGE,
      purchasable: false,
    });
    expect(commerceByVariant["sold-out"]).toMatchObject({
      availabilityMessage: OUT_OF_STOCK_MESSAGE,
      purchasable: false,
    });
  });

  it("does not offer a selector for unusable variants and stays blocked", () => {
    const result = toProductPurchaseOptionsViewModel(product([variant("x", {})]), options);
    expect(result.selector).toBeNull();
    expect(result.commerce).toMatchObject({ price: null, purchasable: false });
  });
});
