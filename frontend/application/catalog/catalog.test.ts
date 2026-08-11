import { describe, expect, it } from "vitest";
import type { Category, Product } from "@/domain/catalog";
import type { CategoryRepository } from "./category-repository";
import type { ProductRepository } from "./product-repository";
import { getCategoryBySlug } from "./get-category-by-slug";
import { getProductById } from "./get-product-by-id";
import { getProductBySlug } from "./get-product-by-slug";
import { listCategories } from "./list-categories";
import { listFeaturedProducts } from "./list-featured-products";
import { listProducts } from "./list-products";
import { listProductsByCategory } from "./list-products-by-category";

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
    const match = this.items.filter((item) =>
      item.categoryIds.includes(slug),
    );
    return match;
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

describe("catalog use cases", () => {
  const dress = product({
    id: "olive-green-patterned-dress",
    slug: "olive-green-patterned-dress",
    name: "Olive green patterned dress",
  });
  const babySet = product({
    id: "sage-striped-baby-top-and-shorts",
    slug: "sage-striped-baby-top-and-shorts",
    name: "Sage striped baby top and shorts",
    categoryIds: ["baby-essentials"],
  });
  const products = new InMemoryProductRepository([dress, babySet]);

  const babyEssentials = category({
    id: "baby-essentials",
    slug: "baby-essentials",
    name: "Baby Essentials",
  });
  const categories = new InMemoryCategoryRepository([babyEssentials]);

  it("getProductBySlug returns a product from the repository contract", async () => {
    await expect(
      getProductBySlug(products, "olive-green-patterned-dress"),
    ).resolves.toMatchObject({ slug: "olive-green-patterned-dress" });
  });

  it("getProductBySlug returns null when missing", async () => {
    await expect(getProductBySlug(products, "missing")).resolves.toBeNull();
  });

  it("getProductById returns a product from the repository contract", async () => {
    await expect(
      getProductById(products, "olive-green-patterned-dress"),
    ).resolves.toMatchObject({ id: "olive-green-patterned-dress" });
  });

  it("listProducts returns all repository products", async () => {
    await expect(listProducts(products)).resolves.toHaveLength(2);
  });

  it("listProductsByCategory uses the repository category query", async () => {
    const result = await listProductsByCategory(products, "baby-essentials");
    expect(result.map((item) => item.slug)).toEqual([
      "sage-striped-baby-top-and-shorts",
    ]);
  });

  it("listFeaturedProducts returns the repository featured list", async () => {
    await expect(listFeaturedProducts(products)).resolves.toEqual([]);
  });

  it("getCategoryBySlug returns a category from the repository contract", async () => {
    await expect(
      getCategoryBySlug(categories, "baby-essentials"),
    ).resolves.toMatchObject({ name: "Baby Essentials" });
  });

  it("getCategoryBySlug returns null when missing", async () => {
    await expect(getCategoryBySlug(categories, "missing")).resolves.toBeNull();
  });

  it("listCategories returns all repository categories", async () => {
    await expect(listCategories(categories)).resolves.toEqual([babyEssentials]);
  });
});
