import { describe, expect, it, vi } from "vitest";
import type { Product } from "@/domain/catalog";
import type { PlaceDemoOrderRequest } from "./demo-order";
import {
  placeDemoOrder,
  type DemoOrderGateway,
  type DemoOrderLedger,
  type DemoSalesOrder,
} from "./place-demo-order";

function product(available: number, amount = 100, status: "active" | "inactive" = "active"): Product {
  return {
    id: "g1",
    slug: "test-g1",
    name: "Test",
    description: "",
    images: [],
    categoryIds: [],
    sku: null,
    uom: null,
    pricing: null,
    inventory: null,
    status: "active",
    variants: [
      {
        id: "v1",
        sku: "SKU-1",
        attributes: [{ name: "size", value: "M" }],
        pricing: { price: { amount, currency: "XTS" }, compareAtPrice: null },
        inventory: {
          stockOnHand: available,
          availableToSell: available,
          reserved: 0,
          status: available > 0 ? "in_stock" : "out_of_stock",
        },
        status,
      },
    ],
  };
}

const request: PlaceDemoOrderRequest = {
  reference: "MMDEMO-ABCDEFGH23",
  customer: { name: "Test Shopper", mobile: "9876543210", address: "1 Test Street, Test City" },
  paymentMethod: "demo_cod",
  lines: [{ variantId: "v1", quantity: 2, unitPrice: { amount: 100, currency: "XTS" } }],
};

function gateway(found: Product | null, create?: DemoOrderGateway["createSalesOrder"]) {
  return {
    findVariantProduct: vi.fn(async () => found),
    createSalesOrder: vi.fn(create ?? (async () => ({ orderNumber: "SO-TEST-1" }))),
  } satisfies DemoOrderGateway;
}

describe("placeDemoOrder", () => {
  it("creates one sales order with re-validated prices and returns safe data", async () => {
    const fake = gateway(product(5));
    const result = await placeDemoOrder(request, fake, new Map());
    expect(result).toEqual({
      kind: "placed",
      reference: request.reference,
      orderNumber: "SO-TEST-1",
      customerName: "Test Shopper",
    });
    expect(fake.createSalesOrder).toHaveBeenCalledTimes(1);
    expect(fake.createSalesOrder.mock.calls[0][0]).toEqual<DemoSalesOrder>({
      reference: request.reference,
      customer: request.customer,
      lines: [{ variantId: "v1", quantity: 2, unitPrice: { amount: 100, currency: "XTS" } }],
    });
  });

  it.each([
    ["price changed", product(5, 120), "price_changed"],
    ["insufficient stock", product(1), "insufficient_inventory"],
    ["out of stock", product(0), "out_of_stock"],
    ["inactive", product(5, 100, "inactive"), "variant_inactive"],
    ["missing", null, "product_not_found"],
  ])("rejects without ordering when %s", async (_label, found, reason) => {
    const fake = gateway(found);
    const result = await placeDemoOrder(request, fake, new Map());
    expect(result).toEqual({ kind: "rejected", rejections: [{ variantId: "v1", reason }] });
    expect(fake.createSalesOrder).not.toHaveBeenCalled();
  });

  it("creates only one order for concurrent duplicate submissions", async () => {
    const fake = gateway(product(5));
    const ledger: DemoOrderLedger = new Map();
    const [first, second] = await Promise.all([
      placeDemoOrder(request, fake, ledger),
      placeDemoOrder(request, fake, ledger),
    ]);
    expect(first).toEqual(second);
    expect(fake.createSalesOrder).toHaveBeenCalledTimes(1);
  });

  it("returns the first result for a later repeat of a placed order", async () => {
    const fake = gateway(product(5));
    const ledger: DemoOrderLedger = new Map();
    await placeDemoOrder(request, fake, ledger);
    const repeat = await placeDemoOrder(request, fake, ledger);
    expect(repeat.kind).toBe("placed");
    expect(fake.createSalesOrder).toHaveBeenCalledTimes(1);
  });

  it("keeps a failed creation cached so a retry cannot create a duplicate", async () => {
    const fake = gateway(product(5), async () => {
      throw new Error("timeout");
    });
    const ledger: DemoOrderLedger = new Map();
    expect((await placeDemoOrder(request, fake, ledger)).kind).toBe("failed");
    expect((await placeDemoOrder(request, fake, ledger)).kind).toBe("failed");
    expect(fake.createSalesOrder).toHaveBeenCalledTimes(1);
  });

  it("forgets rejections and lookup errors so the shopper can retry", async () => {
    const ledger: DemoOrderLedger = new Map();
    await placeDemoOrder(request, gateway(product(0)), ledger);
    const failing = gateway(null);
    failing.findVariantProduct.mockRejectedValueOnce(new Error("network"));
    await expect(placeDemoOrder(request, failing, ledger)).rejects.toThrow("network");
    expect(ledger.size).toBe(0);
    expect((await placeDemoOrder(request, gateway(product(5)), ledger)).kind).toBe("placed");
  });
});
