import { describe, expect, it, vi } from "vitest";
import type { Product } from "@/domain/catalog";
import type { DemoOrderGateway } from "@/application/checkout/place-demo-order";
import { createPostDemoOrderHandler } from "./post-demo-order-handler";

const product: Product = {
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
      id: "900001",
      sku: "TST-1",
      attributes: [{ name: "size", value: "M" }],
      pricing: { price: { amount: 464, currency: "INR" }, compareAtPrice: null },
      inventory: { stockOnHand: 2, availableToSell: 2, reserved: 0, status: "in_stock" },
      status: "active",
    },
  ],
};

const body = {
  reference: "MMDEMO-ABCDEFGH23",
  customer: { name: "Test Shopper", mobile: "9876543210", address: "1 Test Street, Test City" },
  paymentMethod: "demo_cod",
  lines: [{ variantId: "900001", quantity: 1, unitPrice: { amount: 464, currency: "INR" } }],
};

function post(payload: unknown, contentType = "application/json") {
  return new Request("http://localhost/api/demo/orders", {
    method: "POST",
    headers: { "content-type": contentType },
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  });
}

function handler(gateway: Partial<DemoOrderGateway> = {}) {
  const full: DemoOrderGateway = {
    findVariantProduct: vi.fn(async () => product),
    createSalesOrder: vi.fn(async () => ({ orderNumber: "SO-00001" })),
    ...gateway,
  };
  return { POST: createPostDemoOrderHandler(() => ({ gateway: full, ledger: new Map() })), full };
}

describe("POST /api/demo/orders", () => {
  it("returns 404 when the demo is disabled", async () => {
    const response = await createPostDemoOrderHandler(() => null)(post(body));
    expect(response.status).toBe(404);
  });

  it("returns 503 without details when configuration is invalid", async () => {
    const response = await createPostDemoOrderHandler(() => {
      throw new Error("Missing server-only setting ZOHO_CLIENT_SECRET");
    })(post(body));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("ZOHO_CLIENT_SECRET");
  });

  it("creates the order and returns only safe confirmation fields", async () => {
    const { POST } = handler();
    const response = await POST(post(body));
    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      reference: "MMDEMO-ABCDEFGH23",
      orderNumber: "SO-00001",
      customerName: "Test Shopper",
    });
  });

  it("rejects non-JSON, malformed and invalid bodies", async () => {
    const { POST, full } = handler();
    expect((await POST(post(body, "text/plain"))).status).toBe(415);
    expect((await POST(post("{"))).status).toBe(400);
    const invalid = await POST(post({ ...body, customer: { ...body.customer, mobile: "1" } }));
    expect(invalid.status).toBe(400);
    expect(await invalid.json()).toMatchObject({ error: "invalid_request", fields: { mobile: expect.any(String) } });
    expect(full.createSalesOrder).not.toHaveBeenCalled();
  });

  it("returns 409 when price or stock changed", async () => {
    const { POST } = handler();
    const response = await POST(post({ ...body, lines: [{ ...body.lines[0], unitPrice: { amount: 400, currency: "INR" } }] }));
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: "cart_changed",
      rejections: [{ variantId: "900001", reason: "price_changed" }],
    });
  });

  it("returns 502 without provider details when Zoho rejects the order", async () => {
    const error = Object.assign(new Error("Zoho request failed"), {
      kind: "http",
      status: 400,
      providerMessage: "Invalid value",
    });
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { POST } = handler({ createSalesOrder: vi.fn().mockRejectedValue(error) });
    const response = await POST(post(body));
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "order_not_confirmed", reference: body.reference });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("http | 400 | Invalid value"));
    spy.mockRestore();
  });

  it("returns 502 when item re-validation cannot reach Zoho", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { POST } = handler({ findVariantProduct: vi.fn().mockRejectedValue(new Error("network")) });
    const response = await POST(post(body));
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "provider_unavailable" });
    spy.mockRestore();
  });

  it("never includes tokens, secrets or authorization data in responses", async () => {
    const { POST } = handler();
    const text = await (await POST(post(body))).text();
    expect(text).not.toMatch(/token|secret|authorization|client_id|organization/i);
  });
});
