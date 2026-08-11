import { describe, expect, it } from "vitest";
import type { Category, Product } from "@/domain/catalog";
import type { CategoryRepository } from "./category-repository";
import { getProductPage } from "./get-product-page";
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
    return [];
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

describe("getProductPage", () => {
  const babyEssentials = category({
    id: "baby-essentials",
    slug: "baby-essentials",
    name: "Baby Essentials",
  });
  const categories = new InMemoryCategoryRepository([babyEssentials]);

  const babySet = product({
    id: "sage-striped-baby-top-and-shorts",
    slug: "sage-striped-baby-top-and-shorts",
    name: "Sage striped baby top and shorts",
    categoryIds: ["baby-essentials"],
  });
  const uncategorized = product({
    id: "olive-green-patterned-dress",
    slug: "olive-green-patterned-dress",
    name: "Olive green patterned dress",
  });
  const products = new InMemoryProductRepository([babySet, uncategorized]);

  it("returns null for an unknown product slug", async () => {
    await expect(
      getProductPage(products, categories, "does-not-exist"),
    ).resolves.toBeNull();
  });

  it("returns the product and its known categories", async () => {
    const page = await getProductPage(
      products,
      categories,
      "sage-striped-baby-top-and-shorts",
    );

    expect(page?.product).toEqual(babySet);
    expect(page?.categories).toEqual([babyEssentials]);
  });

  it("returns an empty category list when merchandising is unresolved", async () => {
    const page = await getProductPage(
      products,
      categories,
      "olive-green-patterned-dress",
    );

    expect(page?.product).toEqual(uncategorized);
    expect(page?.categories).toEqual([]);
  });

  it("omits category ids that do not resolve", async () => {
    const orphan = product({
      id: "orphan",
      slug: "orphan",
      categoryIds: ["missing-category"],
    });
    const page = await getProductPage(
      new InMemoryProductRepository([orphan]),
      categories,
      "orphan",
    );

    expect(page?.categories).toEqual([]);
  });
});
