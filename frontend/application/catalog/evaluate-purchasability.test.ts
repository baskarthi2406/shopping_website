import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type {
  Inventory,
  Pricing,
  Product,
  ProductVariant,
} from "@/domain/catalog";
import {
  evaluatePurchasability,
  PURCHASABILITY_REASONS,
} from "./evaluate-purchasability";

// Synthetic test data only. Real catalog products carry no commerce values.
const price = (amount: number, currency = "TST"): Pricing => ({
  price: { amount, currency },
  compareAtPrice: null,
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
    description: "Synthetic product",
    images: [],
    categoryIds: [],
    sku: "TEST-SKU",
    uom: { code: "test", label: "Test unit" },
    pricing: price(10),
    inventory: stock(5),
    status: "active",
    variants: [],
    ...overrides,
  };
}

function variant(overrides: Partial<ProductVariant> = {}): ProductVariant {
  return {
    id: "test-variant",
    sku: null,
    attributes: [{ name: "option", value: "a" }],
    pricing: price(12),
    inventory: stock(3),
    status: "active",
    ...overrides,
  };
}

/** Mirrors the current catalog mapping: every commerce field unknown. */
const nullCommerceProduct = product({
  sku: null,
  uom: null,
  pricing: null,
  inventory: null,
  variants: [],
});

const withVariants = (...variants: ProductVariant[]) =>
  product({ pricing: price(10), inventory: stock(5), variants });

describe("evaluatePurchasability", () => {
  it("allows a priced, active product with enough verified stock", () => {
    expect(evaluatePurchasability({ product: product(), quantity: 5 })).toEqual({
      purchasable: true,
      reasons: [],
    });
  });

  it("blocks when the product does not exist", () => {
    expect(evaluatePurchasability({ product: null, quantity: 1 })).toEqual({
      purchasable: false,
      reasons: ["product_not_found"],
    });
  });

  it("blocks a missing price and never treats it as free", () => {
    const result = evaluatePurchasability({
      product: product({ pricing: null }),
      quantity: 1,
    });
    expect(result).toEqual({ purchasable: false, reasons: ["price_missing"] });
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "blocks price amount %s as invalid",
    (amount) => {
      expect(
        evaluatePurchasability({ product: product({ pricing: price(amount) }), quantity: 1 })
          .reasons,
      ).toEqual(["price_invalid"]);
    },
  );

  it.each(["", "tst", "TS", "TEST", undefined as unknown as string])(
    "blocks missing or invalid currency %j",
    (currency) => {
      expect(
        evaluatePurchasability({
          product: product({ pricing: { price: { amount: 10, currency }, compareAtPrice: null } }),
          quantity: 1,
        }).reasons,
      ).toEqual(["currency_invalid"]);
    },
  );

  it("blocks unknown inventory instead of inferring availability", () => {
    for (const inventory of [
      null,
      stock(5, "unknown"),
      stock(null, "in_stock"),
    ]) {
      expect(
        evaluatePurchasability({ product: product({ inventory }), quantity: 1 }).reasons,
      ).toEqual(["inventory_unknown"]);
    }
  });

  it("blocks an explicitly out-of-stock product", () => {
    expect(
      evaluatePurchasability({
        product: product({ inventory: stock(0, "out_of_stock") }),
        quantity: 1,
      }).reasons,
    ).toEqual(["out_of_stock"]);
  });

  it("blocks a quantity larger than verified available stock", () => {
    expect(
      evaluatePurchasability({ product: product({ inventory: stock(2) }), quantity: 3 })
        .reasons,
    ).toEqual(["insufficient_inventory"]);
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    "blocks invalid quantity %s",
    (quantity) => {
      expect(evaluatePurchasability({ product: product(), quantity }).reasons).toEqual([
        "quantity_invalid",
      ]);
    },
  );

  it("requires a variant selection when the product has variants", () => {
    for (const variantId of [undefined, null, "", "  "]) {
      expect(
        evaluatePurchasability({ product: withVariants(variant()), variantId, quantity: 1 })
          .reasons,
      ).toEqual(["variant_required"]);
    }
  });

  it("allows an active, priced, stocked selected variant", () => {
    expect(
      evaluatePurchasability({
        product: withVariants(variant()),
        variantId: "test-variant",
        quantity: 3,
      }),
    ).toEqual({ purchasable: true, reasons: [] });
  });

  it("blocks inactive, unknown-status, and non-matching variants", () => {
    const product = withVariants(
      variant({ id: "inactive", status: "inactive" }),
      variant({
        id: "no-status",
        status: undefined as unknown as ProductVariant["status"],
      }),
    );
    expect(
      evaluatePurchasability({ product, variantId: "inactive", quantity: 1 }).reasons,
    ).toEqual(["variant_inactive"]);
    expect(
      evaluatePurchasability({ product, variantId: "no-status", quantity: 1 }).reasons,
    ).toEqual(["variant_status_unknown"]);
    expect(
      evaluatePurchasability({ product, variantId: "missing", quantity: 1 }).reasons,
    ).toEqual(["variant_not_found"]);
  });

  it("blocks a variant id on a product without variants", () => {
    expect(
      evaluatePurchasability({ product: product(), variantId: "x", quantity: 1 }).reasons,
    ).toEqual(["variant_not_found"]);
  });

  it("never inherits the parent price for a variant without its own price", () => {
    const result = evaluatePurchasability({
      product: withVariants(variant({ pricing: null })),
      variantId: "test-variant",
      quantity: 1,
    });
    expect(result).toEqual({ purchasable: false, reasons: ["price_missing"] });
  });

  it("uses variant inventory, not the parent's, for unknown or short stock", () => {
    expect(
      evaluatePurchasability({
        product: withVariants(variant({ inventory: null })),
        variantId: "test-variant",
        quantity: 1,
      }).reasons,
    ).toEqual(["inventory_unknown"]);
    expect(
      evaluatePurchasability({
        product: withVariants(variant({ inventory: stock(1) })),
        variantId: "test-variant",
        quantity: 2,
      }).reasons,
    ).toEqual(["insufficient_inventory"]);
    expect(
      evaluatePurchasability({
        product: withVariants(variant({ inventory: stock(0, "out_of_stock") })),
        variantId: "test-variant",
        quantity: 1,
      }).reasons,
    ).toEqual(["out_of_stock"]);
  });

  it("does not block on missing SKU or unit of measure", () => {
    expect(
      evaluatePurchasability({ product: product({ sku: null, uom: null }), quantity: 1 }),
    ).toEqual({ purchasable: true, reasons: [] });
  });

  it("blocks missing, unrecognised, or inactive product status", () => {
    for (const status of [undefined, "", "draft"]) {
      expect(
        evaluatePurchasability({
          product: product({ status: status as unknown as Product["status"] }),
          quantity: 1,
        }).reasons,
      ).toEqual(["product_status_unknown"]);
    }
    expect(
      evaluatePurchasability({ product: product({ status: "inactive" }), quantity: 1 })
        .reasons,
    ).toEqual(["product_inactive"]);
  });

  it("blocks current catalog-shaped products with null commerce data", () => {
    expect(evaluatePurchasability({ product: nullCommerceProduct, quantity: 1 })).toEqual({
      purchasable: false,
      reasons: ["price_missing", "inventory_unknown"],
    });
  });

  it("reports multiple reasons in stable order and is deterministic", () => {
    const request = {
      product: product({
        status: "inactive",
        pricing: price(0, "bad"),
        inventory: stock(0, "out_of_stock"),
      }),
      quantity: 0,
    };
    const expected = [
      "product_inactive",
      "quantity_invalid",
      "price_invalid",
      "currency_invalid",
      "out_of_stock",
    ];
    expect(evaluatePurchasability(request).reasons).toEqual(expected);
    expect(evaluatePurchasability(request).reasons).toEqual(expected);

    const variantRequest = {
      product: withVariants(variant({ status: "inactive", pricing: null, inventory: null })),
      variantId: "test-variant",
      quantity: 1.5,
    };
    expect(evaluatePurchasability(variantRequest).reasons).toEqual([
      "variant_inactive",
      "quantity_invalid",
      "price_missing",
      "inventory_unknown",
    ]);
  });

  it("does not mutate its input", () => {
    const input = withVariants(variant());
    const snapshot = structuredClone(input);
    evaluatePurchasability({ product: input, variantId: "test-variant", quantity: 1 });
    expect(input).toEqual(snapshot);
  });

  it("exposes each reason code once", () => {
    expect(new Set(PURCHASABILITY_REASONS).size).toBe(PURCHASABILITY_REASONS.length);
  });

  it("stays free of framework, browser, fixture, and provider dependencies", () => {
    const source = readFileSync(
      new URL("./evaluate-purchasability.ts", import.meta.url),
      "utf8",
    );
    expect(source).not.toMatch(
      /from ["'](react|next)|@\/infrastructure|@\/config|localStorage|window\.|zoho/i,
    );
  });
});
