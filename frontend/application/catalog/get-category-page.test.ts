import { describe, expect, it } from "vitest";
import type { Category, Product } from "@/domain/catalog";
import type { CategoryRepository } from "./category-repository";
import { getCategoryPage } from "./get-category-page";
import type { ProductRepository } from "./product-repository";

function product(
  overrides: Partial<Product> & Pick<Product, "id" | "slug">,
): Product {
  return {
    name: "Test product",
    description: "In-memory test product",
    images: [],
    categoryIds: [],
    sku: null,
    uom: null,
    pricing: null,
    inventory: null,
    status: "active",
    variants: [],
    ...overrides,
  };
}

function category(
  overrides: Partial<Category> & Pick<Category, "id" | "slug">,
): Category {
  return {
    name: "Test category",
    parentId: null,
    children: [],
    visibility: "visible",
    showInMenu: true,
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

describe("getCategoryPage", () => {
  const babyEssentials = category({
    id: "baby-essentials",
    slug: "baby-essentials",
    name: "Baby Essentials",
  });
  const infants = category({
    id: "infants",
    slug: "infants",
    name: "Infants",
  });
  const categories = new InMemoryCategoryRepository([
    babyEssentials,
    infants,
  ]);

  const babySet = product({
    id: "sage-striped-baby-top-and-shorts",
    slug: "sage-striped-baby-top-and-shorts",
    name: "Sage striped baby top and shorts",
    categoryIds: ["baby-essentials"],
  });
  const uncategorized = product({
    id: "olive-green-patterned-dress",
    slug: "olive-green-patterned-dress",
  });
  const products = new InMemoryProductRepository([babySet, uncategorized]);

  it("returns null for an unknown category slug", async () => {
    await expect(
      getCategoryPage(categories, products, "does-not-exist"),
    ).resolves.toBeNull();
  });

  it("returns the category and its products", async () => {
    const page = await getCategoryPage(
      categories,
      products,
      "baby-essentials",
    );

    expect(page?.category).toEqual(babyEssentials);
    expect(page?.products.map((item) => item.slug)).toEqual([
      "sage-striped-baby-top-and-shorts",
    ]);
  });

  it("returns an empty product list for a valid category with no products", async () => {
    const page = await getCategoryPage(categories, products, "infants");

    expect(page?.category).toEqual(infants);
    expect(page?.products).toEqual([]);
  });

  it("returns no ancestors for a top-level category", async () => {
    const page = await getCategoryPage(categories, products, "baby-essentials");

    expect(page?.ancestors).toEqual([]);
  });

  it("returns the parent chain for a subcategory, root first", async () => {
    const women = category({ id: "women", slug: "women", name: "Women" });
    const coOrdSet = category({
      id: "women-co-ord-set",
      slug: "women-co-ord-set",
      name: "Co-Ord Set",
      parentId: "women",
    });
    const set = product({
      id: "set",
      slug: "set",
      categoryIds: ["women-co-ord-set"],
    });

    const page = await getCategoryPage(
      new InMemoryCategoryRepository([women, coOrdSet]),
      new InMemoryProductRepository([set]),
      "women-co-ord-set",
    );

    expect(page?.ancestors).toEqual([women]);
    expect(page?.products.map((item) => item.slug)).toEqual(["set"]);
  });

  it("treats an empty product list as success, not a missing category", async () => {
    const page = await getCategoryPage(categories, products, "infants");

    expect(page).not.toBeNull();
    expect(page?.products).toEqual([]);
  });
});
