import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { catalog } from "./catalog";

describe("storefront catalog composition", () => {
  it("loads homepage catalog data through the dummy API client", async () => {
    const data = await catalog.getHomePage();

    expect(data.products).toHaveLength(12);
    expect(data.products.every((product) => product.pricing === null)).toBe(
      true,
    );
    expect(data.products.every((product) => product.inventory === null)).toBe(
      true,
    );
    expect(data.products.every((product) => product.sku === null)).toBe(true);
    expect(data.categories.some((category) => category.parentId === null)).toBe(
      true,
    );
  });

  it("loads category and product pages through the dummy API envelopes", async () => {
    const categoryPage = await catalog.getCategoryPage("baby-essentials");
    const productPage = await catalog.getProductPage(
      "pink-white-pleated-baby-dress",
    );

    expect(categoryPage?.category.slug).toBe("baby-essentials");
    expect(categoryPage?.products.length).toBeGreaterThan(0);
    expect(productPage?.product.slug).toBe("pink-white-pleated-baby-dress");
    expect(productPage?.product.pricing).toBeNull();
    expect(productPage?.product.inventory).toBeNull();
    expect(productPage?.product.variants).toEqual([]);
  });

  it("maps an unknown product slug to a missing page result", async () => {
    await expect(catalog.getProductPage("missing-product")).resolves.toBeNull();
  });

  it("does not bind static product or category repositories in the storefront catalog", () => {
    const source = readFileSync(new URL("./catalog.ts", import.meta.url), "utf8");

    expect(source).toContain("HttpProductRepository");
    expect(source).toContain("HttpCategoryRepository");
    expect(source).toContain("createCatalogApiClient");
    expect(source).not.toContain("StaticProductRepository");
    expect(source).not.toContain("StaticCategoryRepository");
    expect(source).not.toMatch(/product-records|category-records/);
    expect(source).not.toMatch(/zoho/i);
  });
});
