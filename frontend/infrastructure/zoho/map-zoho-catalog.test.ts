import { describe, expect, it } from "vitest";
import { toProductCardViewModel } from "@/application/catalog/category-page-view-model";
import { PRICE_NOT_AVAILABLE_MESSAGE } from "@/application/catalog/catalog-messages";
import { toProductPurchaseOptionsViewModel } from "@/application/catalog/product-variant-selector";
import { toCartCandidates } from "@/application/storefront-cart/cart-candidate";
import { validateStorefrontCart } from "@/application/storefront-cart/validate-storefront-cart";
import { priceDisplayFor } from "@/config/commerce";
import {
  addStorefrontItem,
  EMPTY_STOREFRONT_CART,
  storefrontSubtotal,
} from "@/domain/storefront-cart/storefront-cart";
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
      pricing: { price: { amount: 464, currency: "XTS" }, compareAtPrice: null },
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

  it("does not use sales_rate, pricebook_rate, or label_rate when they differ from rate", () => {
    const [product] = mapZohoItemsToProducts(
      [item("Pink", { sales_rate: 943, pricebook_rate: 864, label_rate: 999 })],
      "XTS",
    );
    expect(product.variants[0].pricing).toEqual({
      price: { amount: 464, currency: "XTS" },
      compareAtPrice: null,
    });
    expect(JSON.stringify(product)).not.toMatch(/943|864|999/);
  });

  it("drops a missing or non-positive price", () => {
    const [product] = mapZohoItemsToProducts([item("a", { rate: 0 }), item("b", { rate: "464" })], "XTS");
    expect(product.variants.map((variant) => variant.pricing)).toEqual([null, null]);
  });

  it("keeps a fresh verified rate and hides a stale, missing, or invalid one", () => {
    const fresh = { priceObservedAt: "2026-10-04T10:00:00.000Z", priceEvaluatedAt: "2026-10-04T12:00:00.000Z" };
    const stale = { priceObservedAt: "2026-10-03T11:00:00.000Z", priceEvaluatedAt: "2026-10-04T12:00:00.000Z" };
    const [priced] = mapZohoItemsToProducts(
      [item("Sandal", { sku: "INS-8PA", rate: 359, label_rate: 410 })],
      "INR",
      () => null,
      fresh,
    );
    expect(priced.variants[0].pricing).toEqual({
      price: { amount: 359, currency: "INR" },
      compareAtPrice: null,
    });
    expect(JSON.stringify(priced)).not.toMatch(/410|authorization|refresh_token|client_secret/i);

    const [expired] = mapZohoItemsToProducts([item("Sandal", { rate: 359 })], "INR", () => null, stale);
    expect(expired.variants[0].pricing).toBeNull();

    const [invalid] = mapZohoItemsToProducts(
      [item("a", { rate: -1 }), item("b", { rate: Number.NaN }), item("c", { rate: undefined })],
      "INR",
      () => null,
      fresh,
    );
    expect(invalid.variants.map((variant) => variant.pricing)).toEqual([null, null, null]);
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

const FRESH = {
  priceObservedAt: "2026-10-04T10:00:00.000Z",
  priceEvaluatedAt: "2026-10-04T12:00:00.000Z",
};
const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });
const snapshotPrices = priceDisplayFor("zoho-snapshot");

describe("verified selling price on the normal storefront", () => {
  it("shows one listing price only when every variant shares it", () => {
    const [coord] = mapZohoItemsToProducts(
      [item("Pink", { rate: 464 }), item("Green", { rate: 464 })],
      "INR",
      () => "infants-baby-girl-co-ord-set",
      FRESH,
    );
    const [kurti] = mapZohoItemsToProducts(
      [item("Pink", { rate: 943, group_name: "2pc kurti" }), item("Violet", { rate: 864, group_name: "2pc kurti" })],
      "INR",
      () => "women-co-ord-set",
      FRESH,
    );
    expect(coord.pricing).toEqual({ price: { amount: 464, currency: "INR" }, compareAtPrice: null });
    expect(kurti.pricing).toBeNull();
    const listed = (product: (typeof coord)) =>
      toProductCardViewModel({ ...product, variants: [] }, snapshotPrices);
    expect(listed(coord).price).toBe(inr.format(464));
    const mixed = listed(kurti);
    expect(mixed.price).toBeNull();
    expect(mixed.priceMessage).toBe(PRICE_NOT_AVAILABLE_MESSAGE);
    expect(JSON.stringify(mixed)).not.toMatch(/943|864/);
  });

  it("shows the selected variant price and carts that exact amount", () => {
    const [inskirt] = mapZohoItemsToProducts(
      [
        item("sandal", {
          sku: "INS-8PA",
          rate: 359,
          label_rate: 410,
          group_name: "inskirt",
          attribute_option_name1: "8part",
          attribute_option_name2: "Sandal",
          actual_available_stock: 2,
          stock_on_hand: 2,
        }),
      ],
      "INR",
      () => "women-in-skirt",
      FRESH,
    );
    const purchase = toProductPurchaseOptionsViewModel(inskirt, { priceDisplay: snapshotPrices });
    const sandal = purchase.commerceByVariant.sandal;
    expect(sandal).toMatchObject({ sku: "INS-8PA", price: inr.format(359), purchasable: true });
    expect(JSON.stringify(sandal)).not.toMatch(/410|Save/);

    const [choice] = toCartCandidates(inskirt, snapshotPrices);
    expect(choice?.canAdd).toBe(true);
    expect(choice?.unitPrice).toEqual({ amount: 359, currency: "INR" });
    if (choice?.unitPrice === null || choice.priceLocale === null || !choice.canAdd) {
      throw new Error("expected a purchasable priced variant");
    }
    const added = addStorefrontItem(EMPTY_STOREFRONT_CART, {
      productId: choice.productId,
      productSlug: choice.productSlug,
      productName: choice.productName,
      variantId: choice.variantId,
      sku: choice.sku,
      attributes: choice.attributes,
      variantLabel: choice.variantLabel,
      unitPrice: choice.unitPrice,
      priceLocale: choice.priceLocale,
      availableToSell: choice.availableToSell,
      imageSrc: choice.imageSrc,
      imageAlt: choice.imageAlt,
    });
    expect(added.error).toBeNull();
    expect(storefrontSubtotal(added.cart)).toEqual({ amount: 359, currency: "INR" });

    const line = {
      productId: inskirt.id,
      productSlug: inskirt.slug,
      variantId: "sandal",
      quantity: 1,
      unitPrice: { amount: 400, currency: "INR" as const },
    };
    const before = structuredClone(line);
    const review = validateStorefrontCart([line], () => inskirt, snapshotPrices);
    expect(review.ok).toBe(false);
    expect(review.issues[0]?.message).toContain("changed");
    expect(line).toEqual(before);
  });
});
