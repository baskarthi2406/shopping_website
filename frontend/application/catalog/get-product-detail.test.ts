import { describe, expect, it, vi } from "vitest";
import type { Product } from "@/domain/catalog";
import type { ProductRepository } from "./product-repository";
import { getProductDetail } from "./get-product-detail";

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

function repository(
  getBySlug: ProductRepository["getBySlug"],
): ProductRepository {
  return {
    getById: async () => null,
    getBySlug,
    list: async () => [],
    listByCategorySlug: async () => [],
    listFeatured: async () => [],
  };
}

describe("getProductDetail", () => {
  it("returns the full product in the detail envelope", async () => {
    const babyDress = product("pink-white-pleated-baby-dress", [
      "baby-essentials",
    ]);
    const result = await getProductDetail(
      repository(async (slug) => (slug === babyDress.slug ? babyDress : null)),
      babyDress.slug,
    );

    expect(result).toEqual({ data: babyDress });
    expect("pagination" in result).toBe(false);
    expect("data" in result && Array.isArray(result.data)).toBe(false);
  });

  it("returns not_found for an unknown well-formed slug", async () => {
    await expect(
      getProductDetail(repository(async () => null), "missing-product"),
    ).resolves.toEqual({
      error: {
        code: "not_found",
        message: "Product was not found",
      },
    });
  });

  it("rejects invalid slug syntax without reading the repository", async () => {
    const getBySlug = vi.fn(async () => product("any"));
    const products = repository(getBySlug);

    await expect(getProductDetail(products, "Not A Slug")).resolves.toEqual({
      error: {
        code: "invalid_request",
        message: "Product slug must be a valid catalog slug",
      },
    });
    expect(getBySlug).not.toHaveBeenCalled();
  });

  it("propagates repository failures for the transport boundary to map", async () => {
    const failure = new Error("fixture unavailable");
    const products = repository(async () => {
      throw failure;
    });

    await expect(
      getProductDetail(products, "olive-green-patterned-dress"),
    ).rejects.toBe(failure);
  });
});
