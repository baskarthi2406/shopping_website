import { describe, expect, it } from "vitest";
import type { Category, Product } from "@/domain/catalog";
import { buildCategoryMetadata } from "./category-metadata";
import { buildHomeMetadata } from "./home-metadata";
import { buildProductMetadata } from "./product-metadata";

function category(
  overrides: Partial<Category> & Pick<Category, "id" | "slug" | "name">,
): Category {
  return {
    description: null,
    image: null,
    ...overrides,
  };
}

function product(
  overrides: Partial<Product> & Pick<Product, "id" | "slug" | "name">,
): Product {
  return {
    description: "In-memory test product",
    images: [],
    categoryIds: [],
    variants: [{ id: `${overrides.id}-default` }],
    uomCode: null,
    inventoryStatus: "unknown",
    ...overrides,
  };
}

describe("indexable metadata uniqueness", () => {
  it("keeps home, category, and product titles distinct", () => {
    const home = buildHomeMetadata();
    const kids = buildCategoryMetadata(
      category({ id: "kids", slug: "kids", name: "Kids" }),
    );
    const dress = buildProductMetadata(
      product({
        id: "pink-white-pleated-baby-dress",
        slug: "pink-white-pleated-baby-dress",
        name: "Pink and white pleated baby dress",
        description: "Pink and white pleated baby dress",
      }),
    );

    const titles = [home.title, kids.title, dress.title];
    expect(new Set(titles).size).toBe(3);

    expect(home.canonicalPath).toBe("/");
    expect(kids.canonicalPath).toBe("/c/kids");
    expect(dress.canonicalPath).toBe("/p/pink-white-pleated-baby-dress");
  });
});
