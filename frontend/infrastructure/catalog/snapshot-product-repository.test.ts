import { describe, expect, it, vi } from "vitest";
import type { Product } from "@/domain/catalog";
import { SnapshotProductRepository } from "./snapshot-product-repository";

function product(id: string, categoryIds: string[]): Product {
  return {
    id,
    slug: `product-${id}`,
    name: `Product ${id}`,
    description: "",
    images: [],
    categoryIds,
    sku: null,
    uom: null,
    pricing: null,
    inventory: null,
    status: "active",
    variants: [],
  };
}

const products = [product("1", ["women-tops"]), product("2", ["women-sarees"])];

describe("SnapshotProductRepository", () => {
  it("reads products from the snapshot", async () => {
    const source = vi.fn(async () => products);
    const repository = new SnapshotProductRepository(source);

    expect(await repository.list()).toEqual(products);
    expect(await repository.getById("2")).toEqual(products[1]);
    expect(await repository.getBySlug("product-1")).toEqual(products[0]);
    expect(await repository.getById("missing")).toBeNull();
    expect(await repository.getBySlug("missing")).toBeNull();
    expect(source).toHaveBeenCalled();
  });

  it("lists by storefront category slug and returns nothing for unknown or empty categories", async () => {
    const repository = new SnapshotProductRepository(async () => products);

    expect(await repository.listByCategorySlug("women-tops")).toEqual([products[0]]);
    expect(await repository.listByCategorySlug("women")).toEqual([]);
    expect(await repository.listByCategorySlug("missing-category")).toEqual([]);
  });

  it("has no featured selection", async () => {
    const repository = new SnapshotProductRepository(async () => products);

    expect(await repository.listFeatured()).toEqual([]);
  });

  it("propagates snapshot unavailability", async () => {
    const repository = new SnapshotProductRepository(async () => {
      throw new Error("unavailable");
    });

    await expect(repository.list()).rejects.toThrow("unavailable");
  });
});
