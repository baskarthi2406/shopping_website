import { describe, expect, it } from "vitest";
import { isCatalogSlug } from "@/domain/catalog";
import { StaticCategoryRepository } from "./static-category-repository";

describe("StaticCategoryRepository", () => {
  const categories = new StaticCategoryRepository();

  it("lists the Option 1 nav categories", async () => {
    const listed = await categories.list();
    expect(listed.map((item) => item.slug)).toEqual([
      "baby-essentials",
      "infants",
      "kids",
      "teens",
      "women",
    ]);
    expect(listed.every((item) => isCatalogSlug(item.slug))).toBe(true);
  });

  it("gets a category by slug and id", async () => {
    const bySlug = await categories.getBySlug("baby-essentials");
    const byId = await categories.getById("baby-essentials");

    expect(bySlug?.name).toBe("Baby Essentials");
    expect(byId).toEqual(bySlug);
  });

  it("returns null for an unknown slug or id", async () => {
    await expect(categories.getBySlug("missing")).resolves.toBeNull();
    await expect(categories.getById("missing")).resolves.toBeNull();
  });

  it("uses documented stand-in images, not invented category art", async () => {
    const kids = await categories.getBySlug("kids");
    expect(kids?.image?.src).toBe("/kids-striped-shirts-burgundy-and-sage.jpg");
    expect(kids?.description).toBeNull();
  });
});
