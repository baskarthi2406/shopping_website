import { describe, expect, it } from "vitest";
import type { Category } from "@/domain/catalog";
import { buildCategoryMetadata } from "./category-metadata";

function category(
  overrides: Partial<Category> & Pick<Category, "id" | "slug" | "name">,
): Category {
  return {
    description: null,
    image: null,
    ...overrides,
  };
}

describe("buildCategoryMetadata", () => {
  it("builds a unique title and canonical path from the category", () => {
    const babyEssentials = buildCategoryMetadata(
      category({
        id: "baby-essentials",
        slug: "baby-essentials",
        name: "Baby Essentials",
      }),
    );
    const women = buildCategoryMetadata(
      category({
        id: "women",
        slug: "women",
        name: "Women",
      }),
    );

    expect(babyEssentials.title).toBe("Baby Essentials | Mini Mystiq");
    expect(women.title).toBe("Women | Mini Mystiq");
    expect(babyEssentials.title).not.toBe(women.title);
    expect(babyEssentials.canonicalPath).toBe("/c/baby-essentials");
    expect(women.canonicalPath).toBe("/c/women");
  });

  it("uses the category description when present", () => {
    const meta = buildCategoryMetadata(
      category({
        id: "kids",
        slug: "kids",
        name: "Kids",
        description: "Kids clothing from the catalog.",
      }),
    );

    expect(meta.description).toBe("Kids clothing from the catalog.");
  });

  it("uses a factual fallback when description is missing", () => {
    const meta = buildCategoryMetadata(
      category({
        id: "infants",
        slug: "infants",
        name: "Infants",
      }),
    );

    expect(meta.description).toBe(
      "Infants at Mini Mystiq. Baby Clothes & Toys.",
    );
  });

  it("does not add query parameters to the canonical path", () => {
    const meta = buildCategoryMetadata(
      category({
        id: "teens",
        slug: "teens",
        name: "Teens",
      }),
    );

    expect(meta.canonicalPath).toBe("/c/teens");
    expect(meta.canonicalPath).not.toContain("?");
  });
});
