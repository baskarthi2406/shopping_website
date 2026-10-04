import { describe, expect, it, vi } from "vitest";
import { createZohoDemoGateway } from "./zoho-demo-gateway";

const ORG = "100001";

type Route = (url: URL, init: RequestInit) => { status: number; body: unknown };

function fakeFetch(route: Route) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const { status, body } = route(url, init ?? {});
    return new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    });
  });
}

const organizations = {
  code: 0,
  organizations: [{ organization_id: ORG, currency_code: "XTS" }],
};

const zohoItem = {
  item_id: "900001",
  group_id: "900100",
  group_name: "Test Coord set",
  sku: "TST-1",
  status: "active",
  rate: 464,
  track_inventory: true,
  stock_on_hand: 2,
  actual_available_for_sale_stock: 2,
  attribute_name1: "size",
  attribute_option_name1: "M",
};

function gateway(route: Route) {
  const fetchImpl = fakeFetch(route);
  const instance = createZohoDemoGateway({
    config: { apiBaseUrl: "https://api.example.test/inventory/v1", timeoutMs: 1000 },
    organizationId: ORG,
    demoCustomerId: "800001",
    tokens: { getAccessToken: async () => "access-token-value" },
    fetchImpl,
  });
  return { instance, fetchImpl };
}

describe("createZohoDemoGateway", () => {
  it("lists items with organization currency and the organization ID", async () => {
    const { instance, fetchImpl } = gateway((url) =>
      url.pathname === "/v1/organizations"
        ? { status: 200, body: organizations }
        : { status: 200, body: { code: 0, items: [zohoItem] } },
    );
    const [product] = await instance.listProducts(5);
    expect(product.name).toBe("Test Coord set");
    expect(product.variants[0].pricing?.price).toEqual({ amount: 464, currency: "XTS" });
    const itemsUrl = new URL(String(fetchImpl.mock.calls.find(([u]) => String(u).includes("/items"))![0]));
    expect(itemsUrl.pathname).toBe("/inventory/v1/items");
    expect(itemsUrl.searchParams.get("organization_id")).toBe(ORG);
    expect(itemsUrl.searchParams.get("per_page")).toBe("5");
  });

  it("re-reads one item for order validation and returns null for 404", async () => {
    const { instance } = gateway((url) => {
      if (url.pathname === "/v1/organizations") return { status: 200, body: organizations };
      return url.pathname.endsWith("/900001")
        ? { status: 200, body: { code: 0, item: zohoItem } }
        : { status: 404, body: { code: 2006, message: "Item does not exist" } };
    });
    expect((await instance.findVariantProduct("900001"))?.variants[0].id).toBe("900001");
    expect(await instance.findVariantProduct("999999")).toBeNull();
  });

  it("creates a sales order and returns only the order number", async () => {
    let posted: unknown = null;
    const { instance, fetchImpl } = gateway((url, init) => {
      posted = JSON.parse(String(init.body));
      expect(url.pathname).toBe("/inventory/v1/salesorders");
      expect(url.searchParams.get("organization_id")).toBe(ORG);
      return {
        status: 201,
        body: { code: 0, salesorder: { salesorder_id: "700001", salesorder_number: "SO-00001", total: 487.2 } },
      };
    });
    const created = await instance.createSalesOrder({
      reference: "MMDEMO-ABCDEFGH23",
      customer: { name: "Test Shopper", mobile: "9876543210", address: "1 Test Street" },
      lines: [{ variantId: "900001", quantity: 1, unitPrice: { amount: 464, currency: "XTS" } }],
    });
    expect(created).toEqual({ orderNumber: "SO-00001" });
    expect(posted).toMatchObject({
      customer_id: "800001",
      reference_number: "MMDEMO-ABCDEFGH23",
      line_items: [{ item_id: "900001", quantity: 1, rate: 464 }],
    });
    const init = fetchImpl.mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).get("authorization")).toBe("Zoho-oauthtoken access-token-value");
  });

  it("surfaces a Zoho error response as a thrown error", async () => {
    const { instance } = gateway(() => ({ status: 400, body: { code: 36012, message: "Invalid value" } }));
    await expect(
      instance.createSalesOrder({
        reference: "MMDEMO-ABCDEFGH23",
        customer: { name: "Test Shopper", mobile: "9876543210", address: "1 Test Street" },
        lines: [{ variantId: "900001", quantity: 1, unitPrice: { amount: 464, currency: "XTS" } }],
      }),
    ).rejects.toMatchObject({ name: "ZohoRequestError", kind: "http", status: 400 });
  });
});
