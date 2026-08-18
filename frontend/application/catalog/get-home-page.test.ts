import { describe, expect, it } from "vitest";
import type { Category, Product } from "@/domain/catalog";
import type { CategoryRepository } from "./category-repository";
import { getHomePage } from "./get-home-page";
import type { ProductRepository } from "./product-repository";

function product(
  overrides: Partial<Product> & Pick<Product, "id" | "slug">,
): Product {
  return {
    name: "Test product",
    description: "In-memory test product",
    images: [],
    categoryIds: [],
    variants: [{ id: `${overrides.id}-default` }],
    uomCode: null,
    inventoryStatus: "unknown",
    ...overrides,
  };
}

function category(
  overrides: Partial<Category> & Pick<Category, "id" | "slug">,
): Category {
  return {
    name: "Test category",
    description: null,
    image: null,
    ...overrides,
  };
}

class InMemoryProductRepository implements ProductRepository {
  constructor(private readonly items: readonly Product[]) {}

  async getById(id: string): Promise<Product | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async getBySlug(slug: string): Promise<Product | null> {
    return this.items.find((item) => item.slug === slug) ?? null;
  }

  async list(): Promise<readonly Product[]> {
    return this.items;
  }

  async listByCategorySlug(slug: string): Promise<readonly Product[]> {
    return this.items.filter((item) => item.categoryIds.includes(slug));
  }

  async listFeatured(): Promise<readonly Product[]> {
    return [
      product({ id: "should-not-appear", slug: "should-not-appear" }),
    ];
  }
}

class InMemoryCategoryRepository implements CategoryRepository {
  constructor(private readonly items: readonly Category[]) {}

  async getById(id: string): Promise<Category | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async getBySlug(slug: string): Promise<Category | null> {
    return this.items.find((item) => item.slug === slug) ?? null;
  }

  async list(): Promise<readonly Category[]> {
    return this.items;
  }
}

describe("getHomePage", () => {
  it("returns categories and all listed products, not featured merchandising", async () => {
    const kids = category({ id: "kids", slug: "kids", name: "Kids" });
    const shirt = product({
      id: "shirt",
      slug: "shirt",
      name: "Kids shirt",
      categoryIds: ["kids"],
    });
    const page = await getHomePage(
      new InMemoryCategoryRepository([kids]),
      new InMemoryProductRepository([shirt]),
    );

    expect(page.categories).toEqual([kids]);
    expect(page.products).toEqual([shirt]);
    expect(page.products.map((item) => item.slug)).not.toContain(
      "should-not-appear",
    );
  });

  it("returns empty lists when the catalog is empty", async () => {
    const page = await getHomePage(
      new InMemoryCategoryRepository([]),
      new InMemoryProductRepository([]),
    );

    expect(page.categories).toEqual([]);
    expect(page.products).toEqual([]);
  });
});
