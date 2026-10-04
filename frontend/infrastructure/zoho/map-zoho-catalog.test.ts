import { describe, expect, it } from "vitest";
import {
  mapZohoInventory,
  mapZohoItemsToProducts,
  readZohoSalesOrderNumber,
  toZohoSalesOrderBody,
} from "./map-zoho-catalog";

/** Synthetic records shaped like the observed Zoho POS item list response. */
const item = (id: string, overrides: Record<string, unknown> = {}) => ({
  item_id: id,
  group_id: "900000000000100",
  group_name: "Test Coord set",
  name: `-M-${id}`,
  sku: `TST-M-${id}`,
  unit: "pcs",
  status: "active",
  rate: 464,
  label_rate: 490,
  purchase_rate: 200,
  vendor_name: "Vendor",
  track_inventory: true,
  stock_on_hand: 3,
  actual_available_stock: 2,
  attribute_name1: "size",
  attribute_option_name1: "M",
  attribute_name2: "color",
  attribute_option_name2: id,
  attribute_name3: "",
  attribute_option_name3: "",
  ...overrides,
});

describe("mapZohoItemsToProducts", () => {
  it("maps an item group to a product and its items to variants", () => {
    const [product, ...rest] = mapZohoItemsToProducts(
      [item("Pink"), item("Green"), "junk", { name: "no id" }],
      "XTS",
    );
    expect(rest).toHaveLength(0);
    expect(product).toMatchObject({
      id: "900000000000100",
      slug: "test-coord-set-000100",
      name: "Test Coord set",
      sku: null,
      pricing: null,
      uom: { code: "pcs", label: "pcs" },
      status: "active",
    });
    expect(product.variants.map((variant) => [variant.id, variant.sku])).toEqual([
      ["Pink", "TST-M-Pink"],
      ["Green", "TST-M-Green"],
    ]);
    expect(product.variants[0].attributes).toEqual([
      { name: "size", value: "M" },
      { name: "color", value: "Pink" },
    ]);
  });

  it("uses the selling rate as price and never maps label_rate or cost data", () => {
    const [product] = mapZohoItemsToProducts([item("Pink")], "XTS");
    expect(product.variants[0].pricing).toEqual({
      price: { amount: 464, currency: "XTS" },
      compareAtPrice: null,
    });
    expect(JSON.stringify(product)).not.toMatch(/490|200|Vendor/);
  });

  it("drops a missing or non-positive price", () => {
    const [product] = mapZohoItemsToProducts([item("a", { rate: 0 }), item("b", { rate: "464" })], "XTS");
    expect(product.variants.map((variant) => variant.pricing)).toEqual([null, null]);
  });

  it("treats an item without a group as its own product", () => {
    const [product] = mapZohoItemsToProducts([item("solo", { group_id: "", group_name: "" })], "XTS");
    expect(product.id).toBe("solo");
    expect(product.name).toBe("-M-solo");
  });

  it("gives a product no category without a resolver", () => {
    const [product] = mapZohoItemsToProducts([item("Pink", { category_id: "700001" })], "XTS");
    expect(product.categoryIds).toEqual([]);
  });

  it("gives a product exactly one category from its group and Zoho category IDs", () => {
    const seen: unknown[] = [];
    const products = mapZohoItemsToProducts(
      [
        item("Pink", { category_id: "700001" }),
        item("Green", { category_id: "700001" }),
        item("solo", { group_id: "900000000000200", group_name: "Other", category_id: "700002" }),
      ],
      "XTS",
      (source) => {
        seen.push(source);
        return source.categoryId === "700001" ? "women-co-ord-set" : null;
      },
    );
    expect(products.map((product) => product.categoryIds)).toEqual([["women-co-ord-set"], []]);
    expect(seen).toEqual([
      { groupId: "900000000000100", categoryId: "700001" },
      { groupId: "900000000000200", categoryId: "700002" },
    ]);
  });

  it("never uses names to place a product", () => {
    const [product] = mapZohoItemsToProducts(
      [item("Pink", { category_name: "Co-Ord Set", group_name: "Women Co-Ord Set" })],
      "XTS",
      ({ categoryId }) => (categoryId === null ? null : "women-co-ord-set"),
    );
    expect(product.categoryIds).toEqual([]);
  });

  it("marks a product inactive when all variants are inactive", () => {
    const [product] = mapZohoItemsToProducts([item("a", { status: "inactive" })], "XTS");
    expect(product.status).toBe("inactive");
  });
});

describe("mapZohoInventory", () => {
  it("prefers detail available-for-sale stock over list available stock", () => {
    expect(
      mapZohoInventory(item("a", { actual_available_for_sale_stock: 1, actual_committed_stock: 1 })),
    ).toEqual({ stockOnHand: 3, availableToSell: 1, reserved: 1, status: "in_stock" });
    expect(mapZohoInventory(item("a"))).toEqual({
      stockOnHand: 3,
      availableToSell: 2,
      reserved: null,
      status: "in_stock",
    });
  });

  it("maps zero or negative availability to out of stock", () => {
    expect(mapZohoInventory(item("a", { actual_available_stock: -2 }))).toMatchObject({
      availableToSell: 0,
      status: "out_of_stock",
    });
  });

  it.each([
    ["untracked", { track_inventory: false }],
    ["missing", { actual_available_stock: undefined }],
    ["fractional", { actual_available_stock: 1.5 }],
  ])("treats %s stock as unknown, never available", (_label, overrides) => {
    expect(mapZohoInventory(item("a", overrides))).toEqual({
      stockOnHand: null,
      availableToSell: null,
      reserved: null,
      status: "unknown",
    });
  });
});

describe("toZohoSalesOrderBody", () => {
  it("builds a demo-labelled order with item, quantity and rate only", () => {
    const body = toZohoSalesOrderBody(
      {
        reference: "MMDEMO-ABCDEFGH23",
        customer: { name: "Test Shopper", mobile: "9876543210", address: "1 Test Street" },
        lines: [{ variantId: "900001", quantity: 2, unitPrice: { amount: 464, currency: "XTS" } }],
      },
      "800001",
    );
    expect(body).toEqual({
      customer_id: "800001",
      reference_number: "MMDEMO-ABCDEFGH23",
      line_items: [{ item_id: "900001", quantity: 2, rate: 464 }],
      notes: [
        "MINI MYSTIQ DEMO - DO NOT FULFILL",
        "Mini Mystiq demo reference: MMDEMO-ABCDEFGH23",
        "Payment: Demo / COD (no payment collected)",
        "Customer: Test Shopper",
        "Mobile: 9876543210",
        "Address: 1 Test Street",
      ].join("\n"),
    });
    expect(body).not.toHaveProperty("is_inclusive_tax");
  });
});

describe("readZohoSalesOrderNumber", () => {
  it("reads the number from a success response", () => {
    expect(
      readZohoSalesOrderNumber({ code: 0, salesorder: { salesorder_number: "SO-00001" } }),
    ).toBe("SO-00001");
  });

  it("returns null for error or malformed responses", () => {
    expect(readZohoSalesOrderNumber({ code: 1001, message: "x" })).toBeNull();
    expect(readZohoSalesOrderNumber({ code: 0, salesorder: {} })).toBeNull();
    expect(readZohoSalesOrderNumber(null)).toBeNull();
  });
});
