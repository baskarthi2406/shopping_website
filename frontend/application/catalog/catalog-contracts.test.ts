import { describe, expect, it } from "vitest";
import type { Category, Product } from "@/domain/catalog";
import {
  createCollectionResponse,
  createDetailResponse,
  createErrorResponse,
  createPaginatedResponse,
  createPagination,
  toProductSummary,
} from "./catalog-contracts";

function category(
  id: string,
  parentId: string | null,
  children: readonly Category[] = [],
): Category {
  return {
    id,
    slug: id,
    name: id,
    parentId,
    children,
    visibility: "visible",
    showInMenu: true,
    description: null,
    image: null,
  };
}

function product(): Product {
  return {
    id: "product-1",
    slug: "pink-baby-frock",
    name: "Pink Baby Frock",
    description: "Product description",
    images: [],
    categoryIds: ["baby-girl"],
    sku: null,
    uom: null,
    pricing: null,
    inventory: null,
    status: "active",
    variants: [
      {
        id: "product-1-pink",
        sku: null,
        attributes: [{ name: "Color", value: "Pink" }],
        pricing: null,
        inventory: null,
        status: "active",
      },
    ],
  };
}

describe("catalog application contracts", () => {
  it("represents ordered recursive categories without fixed hierarchy depth", () => {
    const grandchild = category("grandchild", "child");
    const child = category("child", "root", [grandchild]);
    const response = createCollectionResponse([
      category("root", null, [child]),
    ]);

    expect(response.data[0]?.children[0]?.children[0]?.id).toBe("grandchild");
  });

  it("represents an empty collection as a successful response", () => {
    expect(createCollectionResponse([])).toEqual({ data: [] });
  });

  it("paginates product summaries without variant detail", () => {
    const summary = toProductSummary(product());
    const response = createPaginatedResponse(
      [summary],
      createPagination(2, 12, 30),
    );

    expect(summary).not.toHaveProperty("variants");
    expect(response).toEqual({
      data: [summary],
      pagination: {
        page: 2,
        pageSize: 12,
        total: 30,
        hasNext: true,
      },
    });
  });

  it("returns full product detail, including variants", () => {
    const response = createDetailResponse(product());

    expect(response.data.variants[0]?.attributes).toEqual([
      { name: "Color", value: "Pink" },
    ]);
  });

  it("keeps pricing and inventory nullable in list and detail envelopes", () => {
    const summary = toProductSummary(product());
    const detail = createDetailResponse(product()).data;

    expect(summary.pricing).toBeNull();
    expect(summary.inventory).toBeNull();
    expect(detail.pricing).toBeNull();
    expect(detail.inventory).toBeNull();
    expect(detail.variants[0]?.pricing).toBeNull();
    expect(detail.variants[0]?.inventory).toBeNull();
  });

  it("does not leak Zoho or provider DTO fields into application contracts", () => {
    const serialized = JSON.stringify({
      summary: toProductSummary(product()),
      detail: createDetailResponse(product()),
    });

    expect(serialized).not.toMatch(
      /item_id|item_group_id|stock_on_hand|purchase_rate|attribute_id1|zoho/i,
    );
  });

  it("uses a consistent transport-neutral not-found error", () => {
    expect(
      createErrorResponse("not_found", "Product was not found"),
    ).toEqual({
      error: {
        code: "not_found",
        message: "Product was not found",
      },
    });
  });

  it("derives terminal and empty pagination states", () => {
    expect(createPagination(3, 10, 30).hasNext).toBe(false);
    expect(createPagination(1, 12, 0)).toEqual({
      page: 1,
      pageSize: 12,
      total: 0,
      hasNext: false,
    });
  });

  it("rejects invalid pagination values", () => {
    expect(() => createPagination(0, 12, 1)).toThrow(
      "page must be a positive integer",
    );
    expect(() => createPagination(1, 0, 1)).toThrow(
      "pageSize must be a positive integer",
    );
    expect(() => createPagination(1, 12, -1)).toThrow(
      "total must be a non-negative integer",
    );
  });
});
