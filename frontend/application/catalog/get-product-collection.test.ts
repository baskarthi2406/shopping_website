import { describe, expect, it, vi } from "vitest";
import type { Product } from "@/domain/catalog";
import type { ProductRepository } from "./product-repository";
import { getProductCollection } from "./get-product-collection";

function product(id: string, categoryIds: readonly string[] = []): Product {
  return {
    id,
    slug: id,
    name: id,
    description: `${id} description`,
    images: [{ src: `/${id}.jpg`, alt: id }],
    categoryIds,
    sku: null,
    uom: null,
    pricing: null,
    inventory: null,
    status: "active",
    variants: [],
  };
}

function repository(list: ProductRepository["list"]): ProductRepository {
  return {
    getById: async () => null,
    getBySlug: async () => null,
    list,
    listByCategorySlug: async () => [],
    listFeatured: async () => [],
  };
}

describe("getProductCollection", () => {
  const products = [
    product("first", ["nested-category"]),
    product("second"),
    product("third"),
    product("fourth"),
    product("fifth"),
  ];

  it("returns stable product summaries with category relationships", async () => {
    const result = await getProductCollection(
      repository(async () => products),
      { page: 1, pageSize: 2 },
    );

    expect(result.data.map((item) => item.slug)).toEqual(["first", "second"]);
    expect(result.data[0]?.categoryIds).toEqual(["nested-category"]);
    expect(result.data[0]).not.toHaveProperty("variants");
    expect(result.data[0]).toMatchObject({
      sku: null,
      uom: null,
      pricing: null,
      inventory: null,
    });
    expect(result.pagination).toEqual({
      page: 1,
      pageSize: 2,
      total: 5,
      hasNext: true,
    });
  });

  it("returns later and beyond-range pages deterministically", async () => {
    const productsRepository = repository(async () => products);

    await expect(
      getProductCollection(productsRepository, { page: 2, pageSize: 2 }),
    ).resolves.toMatchObject({
      data: [{ id: "third" }, { id: "fourth" }],
      pagination: { page: 2, pageSize: 2, total: 5, hasNext: true },
    });
    await expect(
      getProductCollection(productsRepository, { page: 4, pageSize: 2 }),
    ).resolves.toEqual({
      data: [],
      pagination: { page: 4, pageSize: 2, total: 5, hasNext: false },
    });
  });

  it("rejects invalid pagination before reading the repository", async () => {
    const list = vi.fn(async () => products);
    const productsRepository = repository(list);

    await expect(
      getProductCollection(productsRepository, { page: 0, pageSize: 2 }),
    ).rejects.toThrow("page must be a positive integer");
    await expect(
      getProductCollection(productsRepository, { page: 1, pageSize: 0 }),
    ).rejects.toThrow("pageSize must be a positive integer");
    expect(list).not.toHaveBeenCalled();
  });

  it("propagates repository failures for the transport boundary to map", async () => {
    const failure = new Error("fixture unavailable");
    const productsRepository = repository(async () => {
      throw failure;
    });

    await expect(
      getProductCollection(productsRepository, { page: 1, pageSize: 12 }),
    ).rejects.toBe(failure);
  });
});
