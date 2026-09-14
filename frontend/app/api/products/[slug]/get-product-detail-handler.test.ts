import { describe, expect, it } from "vitest";
import type { ProductDetailResult } from "@/application/catalog";
import { createGetProductDetailHandler } from "./get-product-detail-handler";
import { GET } from "./route";

async function body(response: Response): Promise<ProductDetailResult> {
  return (await response.json()) as ProductDetailResult;
}

function request(slug: string, query = ""): Request {
  return new Request(`http://localhost/api/products/${slug}${query}`);
}

function routeContext(slug: string): { params: Promise<{ slug: string }> } {
  return { params: Promise.resolve({ slug }) };
}

describe("GET /api/products/[slug]", () => {
  it("returns the approved product detail envelope for an existing slug", async () => {
    const response = await GET(
      request("pink-white-pleated-baby-dress"),
      routeContext("pink-white-pleated-baby-dress"),
    );
    const result = await body(response);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(result).toEqual({
      data: {
        id: "pink-white-pleated-baby-dress",
        slug: "pink-white-pleated-baby-dress",
        name: "Pink and white pleated baby dress",
        description: "Pink and white pleated baby dress",
        images: [
          {
            src: "/pink-white-pleated-baby-dress.jpg",
            alt: "Pink and white pleated baby dress",
          },
        ],
        categoryIds: ["baby-essentials"],
        sku: null,
        uom: null,
        pricing: null,
        inventory: null,
        status: "active",
        variants: [],
      },
    });
    expect("pagination" in result).toBe(false);
  });

  it("preserves nullable commerce fields and empty variants", async () => {
    const result = await body(
      await GET(
        request("olive-green-patterned-dress"),
        routeContext("olive-green-patterned-dress"),
      ),
    );

    expect("data" in result && result.data).toMatchObject({
      slug: "olive-green-patterned-dress",
      categoryIds: [],
      sku: null,
      uom: null,
      pricing: null,
      inventory: null,
      status: "active",
      variants: [],
    });
  });

  it("is deterministic for the same slug", async () => {
    const first = await body(
      await GET(
        request("olive-green-patterned-dress"),
        routeContext("olive-green-patterned-dress"),
      ),
    );
    const second = await body(
      await GET(
        request("olive-green-patterned-dress"),
        routeContext("olive-green-patterned-dress"),
      ),
    );

    expect(second).toEqual(first);
  });

  it("returns 404 for an unknown well-formed slug", async () => {
    const response = await GET(
      request("missing-product"),
      routeContext("missing-product"),
    );

    expect(response.status).toBe(404);
    await expect(body(response)).resolves.toEqual({
      error: {
        code: "not_found",
        message: "Product was not found",
      },
    });
  });

  it.each(["Not-A-Slug", "OLIVE-GREEN", "olive_green"])(
    "returns 400 for invalid slug %s",
    async (slug) => {
      const response = await GET(request(slug), routeContext(slug));

      expect(response.status).toBe(400);
      await expect(body(response)).resolves.toEqual({
        error: {
          code: "invalid_request",
          message: "Product slug must be a valid catalog slug",
        },
      });
    },
  );

  it("returns 400 for unsupported query parameters", async () => {
    const response = await GET(
      request("olive-green-patterned-dress", "?page=1"),
      routeContext("olive-green-patterned-dress"),
    );

    expect(response.status).toBe(400);
    await expect(body(response)).resolves.toEqual({
      error: {
        code: "invalid_request",
        message: "Unsupported query parameter: page",
      },
    });
  });

  it("does not leak fixture, repository, or Zoho representation details", async () => {
    const serialized = JSON.stringify(
      await body(
        await GET(
          request("olive-green-patterned-dress"),
          routeContext("olive-green-patterned-dress"),
        ),
      ),
    );

    expect(serialized).not.toContain("productRecords");
    expect(serialized).not.toContain("StaticProductRepository");
    expect(serialized).not.toContain("item_id");
    expect(serialized).not.toContain("stock_on_hand");
  });

  it("sanitizes unexpected repository failures as HTTP 500", async () => {
    const handler = createGetProductDetailHandler(async () => {
      throw new Error("sensitive fixture path");
    });
    const response = await handler(
      request("olive-green-patterned-dress"),
      "olive-green-patterned-dress",
    );

    expect(response.status).toBe(500);
    await expect(body(response)).resolves.toEqual({
      error: {
        code: "temporarily_unavailable",
        message: "Product data is temporarily unavailable",
      },
    });
  });
});
