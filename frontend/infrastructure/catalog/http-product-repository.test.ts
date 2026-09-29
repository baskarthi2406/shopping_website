import { describe, expect, it } from "vitest";
import type { PaginatedResponse } from "@/application/catalog";
import type { Product, ProductSummary } from "@/domain/catalog";
import type { CatalogApiClient } from "./catalog-api-client";
import { HttpProductRepository } from "./http-product-repository";

function summary(slug: string, categoryIds: readonly string[] = []): ProductSummary {
  return {
    id: slug,
    slug,
    name: slug,
    description: slug,
    images: [],
    categoryIds,
    sku: null,
    uom: null,
    pricing: null,
    inventory: null,
    status: "active",
  };
}

function product(slug: string): Product {
  return { ...summary(slug), variants: [] };
}

describe("HttpProductRepository", () => {
  it("pages product summaries and loads detail by slug", async () => {
    const pages: PaginatedResponse<ProductSummary>[] = [
      {
        data: [summary("one")],
        pagination: { page: 1, pageSize: 1, total: 2, hasNext: true },
      },
      {
        data: [summary("two")],
        pagination: { page: 2, pageSize: 1, total: 2, hasNext: false },
      },
    ];
    const api: CatalogApiClient = {
      getCategoryTree: async () => [],
      getProductCollection: async ({ page = 1 } = {}) => pages[page - 1]!,
      getProductBySlug: async (slug) => (slug === "one" ? product("one") : null),
    };
    const products = new HttpProductRepository(api);

    expect((await products.list()).map((item) => item.slug)).toEqual([
      "one",
      "two",
    ]);
    expect(await products.getBySlug("one")).toEqual(product("one"));
    expect(await products.getBySlug("missing")).toBeNull();
    expect(await products.listFeatured()).toEqual([]);
  });

  it("filters listed products by category id resolved from the category API", async () => {
    const api: CatalogApiClient = {
      getCategoryTree: async () => [
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
      getProductCollection: async () => ({
        data: [
          summary("in-category", ["baby-essentials"]),
          summary("other", ["kids"]),
        ],
        pagination: { page: 1, pageSize: 12, total: 2, hasNext: false },
      }),
      getProductBySlug: async () => null,
    };
    const products = new HttpProductRepository(api);

    await expect(
      products.listByCategorySlug("baby-essentials"),
    ).resolves.toEqual([expect.objectContaining({ slug: "in-category" })]);
    await expect(products.listByCategorySlug("missing")).resolves.toEqual([]);
  });
});
