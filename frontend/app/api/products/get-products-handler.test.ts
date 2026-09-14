import { describe, expect, it } from "vitest";
import type { ProductListResult } from "@/application/catalog";
import { createGetProductsHandler } from "./get-products-handler";
import { GET } from "./route";

async function body(response: Response): Promise<ProductListResult> {
  return (await response.json()) as ProductListResult;
}

function request(query = ""): Request {
  return new Request(`http://localhost/api/products${query}`);
}

describe("GET /api/products", () => {
  it("returns all 12 approved summaries with default pagination", async () => {
    const response = await GET(request());
    const result = await body(response);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect("data" in result).toBe(true);

    if (!("data" in result)) {
      throw new Error("Expected a product collection");
    }

    expect(result.data).toHaveLength(12);
    expect(result.data[0]?.slug).toBe("navy-star-tan-bow-dress");
    expect(result.data[11]?.slug).toBe(
      "kids-linen-shirts-brown-and-sage",
    );
    expect(result.data.every((product) => !("variants" in product))).toBe(true);
    expect(
      result.data.every(
        (product) =>
          product.sku === null &&
          product.uom === null &&
          product.pricing === null &&
          product.inventory === null,
      ),
    ).toBe(true);
    expect(result.pagination).toEqual({
      page: 1,
      pageSize: 12,
      total: 12,
      hasNext: false,
    });
  });

  it("returns stable later, terminal, and empty pages", async () => {
    const second = await body(await GET(request("?page=2&pageSize=5")));
    const third = await body(await GET(request("?page=3&pageSize=5")));
    const beyond = await body(await GET(request("?page=4&pageSize=5")));

    expect(second).toMatchObject({
      pagination: { page: 2, pageSize: 5, total: 12, hasNext: true },
    });
    expect("data" in second && second.data).toHaveLength(5);
    expect(third).toMatchObject({
      pagination: { page: 3, pageSize: 5, total: 12, hasNext: false },
    });
    expect("data" in third && third.data).toHaveLength(2);
    expect(beyond).toEqual({
      data: [],
      pagination: { page: 4, pageSize: 5, total: 12, hasNext: false },
    });
  });

  it("is deterministic for the same query", async () => {
    const first = await body(await GET(request("?page=2&pageSize=4")));
    const second = await body(await GET(request("?page=2&pageSize=4")));

    expect(second).toEqual(first);
  });

  it.each([
    "?page=0",
    "?page=1.5",
    "?pageSize=abc",
    "?page=1&page=2",
    "?category=kids",
  ])("returns 400 for invalid query %s", async (query) => {
    const response = await GET(request(query));
    const result = await body(response);

    expect(response.status).toBe(400);
    expect(result).toMatchObject({
      error: { code: "invalid_request" },
    });
  });

  it("preserves nullable contract fields without internal leakage", async () => {
    const serialized = JSON.stringify(await body(await GET(request())));

    expect(serialized).toContain('"sku":null');
    expect(serialized).toContain('"pricing":null');
    expect(serialized).not.toContain('"variants"');
    expect(serialized).not.toContain("productRecords");
    expect(serialized).not.toContain("StaticProductRepository");
    expect(serialized).not.toContain("item_id");
    expect(serialized).not.toContain("stock_on_hand");
  });

  it("sanitizes unexpected repository failures as HTTP 500", async () => {
    const handler = createGetProductsHandler(async () => {
      throw new Error("sensitive fixture path");
    });
    const response = await handler(request());

    expect(response.status).toBe(500);
    await expect(body(response)).resolves.toEqual({
      error: {
        code: "temporarily_unavailable",
        message: "Product data is temporarily unavailable",
      },
    });
  });
});
