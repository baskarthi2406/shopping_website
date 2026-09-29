import { describe, expect, it, vi } from "vitest";
import {
  CATALOG_UNAVAILABLE_MESSAGE,
  createCatalogApiClient,
} from "./catalog-api-client";

function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

describe("catalog API client", () => {
  it("reads the category collection envelope", async () => {
    const dispatch = vi.fn(async (url: URL) => {
      expect(url.pathname).toBe("/api/categories");
      return jsonResponse({
        data: [
          {
            id: "baby-essentials",
            slug: "baby-essentials",
            name: "Baby Essentials",
            parentId: null,
            children: [],
            visibility: "visible",
            showInMenu: true,
            description: null,
            image: null,
          },
        ],
      });
    });
    const client = createCatalogApiClient(dispatch);

    await expect(client.getCategoryTree()).resolves.toEqual([
      expect.objectContaining({ slug: "baby-essentials" }),
    ]);
  });

  it("reads paginated product summaries without inventing variants", async () => {
    const dispatch = vi.fn(async (url: URL) => {
      expect(url.pathname).toBe("/api/products");
      expect(url.searchParams.get("page")).toBe("1");
      expect(url.searchParams.get("pageSize")).toBe("12");
      return jsonResponse({
        data: [
          {
            id: "pink-white-pleated-baby-dress",
            slug: "pink-white-pleated-baby-dress",
            name: "Pink and white pleated baby dress",
            description: "Pink and white pleated baby dress",
            images: [],
            categoryIds: ["baby-essentials"],
            sku: null,
            uom: null,
            pricing: null,
            inventory: null,
            status: "active",
          },
        ],
        pagination: { page: 1, pageSize: 12, total: 1, hasNext: false },
      });
    });
    const client = createCatalogApiClient(dispatch);
    const result = await client.getProductCollection();

    expect(result.data[0]?.pricing).toBeNull();
    expect(result.data[0]).not.toHaveProperty("variants");
    expect(JSON.stringify(result)).not.toMatch(/zoho|item_id|stock_on_hand/i);
  });

  it("returns null for a missing product without leaking internals", async () => {
    const client = createCatalogApiClient(async () =>
      jsonResponse(
        {
          error: {
            code: "not_found",
            message: "Product was not found",
          },
        },
        404,
      ),
    );

    await expect(client.getProductBySlug("missing-product")).resolves.toBeNull();
  });

  it("does not expose internal API failure details", async () => {
    const client = createCatalogApiClient(async () =>
      jsonResponse(
        {
          error: {
            code: "temporarily_unavailable",
            message: "TypeError: fixture unavailable at StaticProductRepository",
          },
        },
        500,
      ),
    );

    await expect(client.getCategoryTree()).rejects.toThrow(
      CATALOG_UNAVAILABLE_MESSAGE,
    );

    try {
      await client.getCategoryTree();
      throw new Error("expected catalog failure");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe(CATALOG_UNAVAILABLE_MESSAGE);
      expect((error as Error).message).not.toMatch(
        /StaticProductRepository|TypeError|fixture/,
      );
      expect((error as Error).stack ?? "").not.toContain("fixture unavailable");
    }
  });
});
