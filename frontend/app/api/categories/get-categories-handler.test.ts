import { describe, expect, it } from "vitest";
import {
  createErrorResponse,
  type CategoryListResult,
} from "@/application/catalog";
import { createGetCategoriesHandler } from "./get-categories-handler";
import { GET } from "./route";

async function body(response: Response): Promise<CategoryListResult> {
  return (await response.json()) as CategoryListResult;
}

describe("GET /api/categories", () => {
  it("returns the stable category envelope and recursive hierarchy", async () => {
    const response = await GET();
    const result = await body(response);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect("data" in result).toBe(true);

    if (!("data" in result)) {
      throw new Error("Expected a category collection");
    }

    expect(result.data.map((category) => category.slug)).toEqual([
      "baby-essentials",
      "infants",
      "kids",
      "teens",
      "women",
      "kids-wear",
      "boys-wear",
      "girls-wear",
      "boutique",
    ]);
    expect(
      result.data
        .find((category) => category.slug === "infants")
        ?.children.find((category) => category.slug === "infants-baby-girl")
        ?.children.some(
          (category) => category.slug === "infants-baby-girl-frock",
        ),
    ).toBe(true);
  });

  it("does not leak fixture, repository, or Zoho representation details", async () => {
    const serialized = JSON.stringify(await body(await GET()));

    expect(serialized).not.toContain("categoryRecords");
    expect(serialized).not.toContain("StaticCategoryRepository");
    expect(serialized).not.toContain("item_id");
    expect(serialized).not.toContain("stock_on_hand");
  });

  it.each([
    ["invalid_request", 400],
    ["not_found", 404],
    ["temporarily_unavailable", 500],
  ] as const)("maps %s application errors to HTTP %i", async (code, status) => {
    const handler = createGetCategoriesHandler(async () =>
      createErrorResponse(code, "Safe public message"),
    );
    const response = await handler();

    expect(response.status).toBe(status);
    await expect(body(response)).resolves.toEqual({
      error: { code, message: "Safe public message" },
    });
  });

  it("maps unexpected repository failures without leaking internals", async () => {
    const handler = createGetCategoriesHandler(async () => {
      throw new Error("sensitive fixture path");
    });
    const response = await handler();

    expect(response.status).toBe(500);
    await expect(body(response)).resolves.toEqual({
      error: {
        code: "temporarily_unavailable",
        message: "Category data is temporarily unavailable",
      },
    });
  });
});
