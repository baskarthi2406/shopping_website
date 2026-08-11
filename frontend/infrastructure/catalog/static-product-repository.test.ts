import { describe, expect, it } from "vitest";
import { isCatalogSlug } from "@/domain/catalog";
import { StaticCategoryRepository } from "./static-category-repository";
import { StaticProductRepository } from "./static-product-repository";

describe("StaticProductRepository", () => {
  const products = new StaticProductRepository();

  it("lists the Phase 1 fixture products", async () => {
    const listed = await products.list();
    expect(listed).toHaveLength(12);
    expect(listed.every((item) => isCatalogSlug(item.slug))).toBe(true);
  });

  it("has unique product ids and slugs", async () => {
    const listed = await products.list();
    const ids = listed.map((item) => item.id);
    const slugs = listed.map((item) => item.slug);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("only assigns category ids that exist", async () => {
    const categoryIds = new Set(
      (await new StaticCategoryRepository().list()).map((item) => item.id),
    );
    const listed = await products.list();

    for (const product of listed) {
      for (const categoryId of product.categoryIds) {
        expect(categoryIds.has(categoryId)).toBe(true);
      }
    }
  });

  it("gets a product by slug and id", async () => {
    const bySlug = await products.getBySlug("olive-green-patterned-dress");
    const byId = await products.getById("olive-green-patterned-dress");

    expect(bySlug?.name).toBe("Olive green patterned dress");
    expect(byId).toEqual(bySlug);
  });

  it("returns null for an unknown slug or id", async () => {
    await expect(products.getBySlug("missing-product")).resolves.toBeNull();
    await expect(products.getById("missing-product")).resolves.toBeNull();
  });

  it("lists products in baby-essentials and kids, and none for unknown or empty categories", async () => {
    const babyEssentials = await products.listByCategorySlug("baby-essentials");
    expect(babyEssentials.map((item) => item.slug).sort()).toEqual([
      "cream-grey-rose-tiered-baby-dress",
      "grey-pinafore-baby-set",
      "pink-white-pleated-baby-dress",
      "sage-striped-baby-top-and-shorts",
    ]);

    const kids = await products.listByCategorySlug("kids");
    expect(kids.map((item) => item.slug).sort()).toEqual([
      "kids-button-down-shirts-rose-and-burgundy",
      "kids-linen-shirts-brown-and-sage",
      "kids-striped-shirts-burgundy-and-sage",
    ]);

    await expect(products.listByCategorySlug("missing")).resolves.toEqual([]);
    await expect(products.listByCategorySlug("infants")).resolves.toEqual([]);
    await expect(products.listByCategorySlug("teens")).resolves.toEqual([]);
    await expect(products.listByCategorySlug("women")).resolves.toEqual([]);
  });

  it("leaves age-unconfirmed dresses uncategorized", async () => {
    const uncategorized = [
      "navy-star-tan-bow-dress",
      "olive-green-patterned-dress",
      "beige-motif-pleated-dress",
      "dusty-blue-floral-dress",
      "cream-tiered-shirt-dress",
    ];

    for (const slug of uncategorized) {
      const product = await products.getBySlug(slug);
      expect(product?.categoryIds).toEqual([]);
    }
  });

  it("maps fixtures to domain defaults without invented commerce fields", async () => {
    const dress = await products.getBySlug("olive-green-patterned-dress");

    expect(dress?.uomCode).toBeNull();
    expect(dress?.inventoryStatus).toBe("unknown");
    expect(dress?.variants).toEqual([
      { id: "olive-green-patterned-dress-default" },
    ]);
    expect(dress?.images[0]?.src).toBe("/olive-green-patterned-dress.jpg");
    expect(dress?.images[0]?.alt).not.toBe("olive-green-patterned-dress.jpg");
  });

  it("returns no featured products until merchandising exists", async () => {
    await expect(products.listFeatured()).resolves.toEqual([]);
  });
});
