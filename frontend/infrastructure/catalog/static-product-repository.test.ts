import { describe, expect, it } from "vitest";
import { isCatalogSlug } from "@/domain/catalog";
import { StaticProductRepository } from "./static-product-repository";

describe("StaticProductRepository", () => {
  const products = new StaticProductRepository();

  it("lists the Phase 1 fixture products", async () => {
    const listed = await products.list();
    expect(listed).toHaveLength(6);
    expect(listed.every((item) => isCatalogSlug(item.slug))).toBe(true);
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

  it("lists products in baby-essentials and none for unknown or unassigned categories", async () => {
    const babyEssentials = await products.listByCategorySlug("baby-essentials");
    expect(babyEssentials.map((item) => item.slug).sort()).toEqual([
      "cream-grey-rose-tiered-baby-dress",
      "pink-white-pleated-baby-dress",
      "sage-striped-baby-top-and-shorts",
    ]);

    await expect(products.listByCategorySlug("missing")).resolves.toEqual([]);
    await expect(products.listByCategorySlug("teens")).resolves.toEqual([]);
  });

  it("leaves navy/tan dresses uncategorized", async () => {
    const navyTan = await products.getBySlug("navy-star-tan-bow-dress");
    expect(navyTan?.categoryIds).toEqual([]);
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
