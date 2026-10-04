import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  toCatalogNavItems,
  toCategoryPageViewModel,
  toFooterNavViewModel,
} from "@/application/catalog";
import { catalog } from "./catalog";
import { catalogSource } from "./catalog-source";

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

  it("maps an unknown category slug to a missing page result", async () => {
    await expect(catalog.getCategoryPage("missing-category")).resolves.toBeNull();
  });

  it("returns an empty product list for a valid category without products", async () => {
    const page = await catalog.getCategoryPage("infants");

    expect(page?.category.slug).toBe("infants");
    expect(page?.products).toEqual([]);
  });

  it("resolves category → subcategory → listing through the dummy API", async () => {
    const women = await catalog.getCategoryPage("women");
    const coOrdSet = await catalog.getCategoryPage("women-co-ord-set");
    const infantsCoOrdSet = await catalog.getCategoryPage("infants-baby-girl-co-ord-set");

    expect(women?.ancestors).toEqual([]);
    expect(women?.category.children.map((child) => child.slug)).toContain("women-co-ord-set");
    expect(coOrdSet?.ancestors.map((category) => category.slug)).toEqual(["women"]);
    expect(infantsCoOrdSet?.ancestors.map((category) => category.slug)).toEqual([
      "infants",
      "infants-baby-girl",
    ]);
  });

  it("links every visible subcategory to an existing category page", async () => {
    const categories = await catalog.listCategories();
    const slugs = new Set(categories.map((category) => category.slug));
    const parents = categories.filter((category) => category.children.length > 0);

    expect(parents.length).toBeGreaterThan(0);
    for (const parent of parents) {
      const view = toCategoryPageViewModel(parent, []);
      for (const link of view.subcategories) {
        expect(slugs.has(link.href.replace(/^\/c\//, "")), link.href).toBe(true);
      }
      expect(view.subcategories.length).toBe(
        parent.children.filter((child) => child.visibility === "visible").length,
      );
    }
  });

  it("does not bind static product or category repositories in the storefront catalog", () => {
    const source = readFileSync(new URL("./catalog.ts", import.meta.url), "utf8");

    expect(source).toContain("HttpProductRepository");
    expect(source).toContain("HttpCategoryRepository");
    expect(source).toContain("createCatalogApiClient");
    expect(source).toContain("dispatchCatalogApi");
    expect(source).toContain("getCategoryTree: cache(");
    expect(source).toContain("getProductBySlug: cache(");
    expect(source).not.toContain("StaticProductRepository");
    expect(source).not.toContain("StaticCategoryRepository");
    expect(source).not.toMatch(/product-records|category-records/);
    expect(source).not.toMatch(/zoho/i);
  });

  it("builds header and footer navigation from the dummy category API", async () => {
    const [apiCategories, sourceCategories, collection] = await Promise.all([
      catalog.listCategories(),
      catalogSource.listCategories(),
      catalog.getCategoryCollection(),
    ]);
    const navigation = toCatalogNavItems(apiCategories);
    const footerNav = toFooterNavViewModel(apiCategories);

    expect(navigation).toEqual(toCatalogNavItems(sourceCategories));
    expect(footerNav).toEqual(toFooterNavViewModel(sourceCategories));
    expect(navigation.map((item) => item.href)).toEqual(
      collection.data
        .filter(
          (category) =>
            category.visibility === "visible" && category.showInMenu,
        )
        .map((category) => `/c/${category.slug}`),
    );
    expect(navigation.some((item) => item.children.length > 0)).toBe(true);
    expect(navigation.some((item) => item.children.length === 0)).toBe(true);
    expect(
      navigation.some((item) =>
        item.children.some((child) => child.children.length > 0),
      ),
    ).toBe(true);
    expect(
      navigation.every((item) =>
        item.href.startsWith("/c/") &&
        item.children.every((child) => child.href.startsWith("/c/")),
      ),
    ).toBe(true);
    expect(footerNav.shop.length).toBeGreaterThan(0);
    expect(footerNav.collections.length).toBeGreaterThan(0);

    const again = toCatalogNavItems(await catalog.listCategories());
    expect(again).toEqual(navigation);
  });
});
