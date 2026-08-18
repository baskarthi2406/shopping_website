import { describe, expect, it } from "vitest";
import type { Category, Product } from "@/domain/catalog";
import type { CategoryRepository } from "../catalog/category-repository";
import type { ProductRepository } from "../catalog/product-repository";
import { listIndexableUrls } from "./list-indexable-urls";

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
    return [product({ id: "featured-only", slug: "featured-only" })];
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

describe("listIndexableUrls", () => {
  const infants = category({
    id: "infants",
    slug: "infants",
    name: "Infants",
  });
  const kids = category({ id: "kids", slug: "kids", name: "Kids" });
  const shirt = product({
    id: "kids-striped-shirts-burgundy-and-sage",
    slug: "kids-striped-shirts-burgundy-and-sage",
    name: "Burgundy and sage striped kids shirts",
    categoryIds: ["kids"],
  });
  const uncategorized = product({
    id: "olive-green-patterned-dress",
    slug: "olive-green-patterned-dress",
    name: "Olive green patterned dress",
  });

  it("lists homepage, repository-order categories, then products", async () => {
    const urls = await listIndexableUrls(
      new InMemoryCategoryRepository([infants, kids]),
      new InMemoryProductRepository([shirt, uncategorized]),
    );

    expect(urls.map((entry) => entry.path)).toEqual([
      "/",
      "/c/infants",
      "/c/kids",
      "/p/kids-striped-shirts-burgundy-and-sage",
      "/p/olive-green-patterned-dress",
    ]);
  });

  it("includes empty categories and uncategorized products", async () => {
    const urls = await listIndexableUrls(
      new InMemoryCategoryRepository([infants, kids]),
      new InMemoryProductRepository([uncategorized]),
    );
    const paths = urls.map((entry) => entry.path);

    expect(paths).toContain("/c/infants");
    expect(paths).toContain("/p/olive-green-patterned-dress");
  });

  it("does not invent invalid, cart, or query-parameter URLs", async () => {
    const urls = await listIndexableUrls(
      new InMemoryCategoryRepository([kids]),
      new InMemoryProductRepository([shirt]),
    );
    const paths = urls.map((entry) => entry.path);

    expect(paths).not.toContain("/c/does-not-exist");
    expect(paths).not.toContain("/p/does-not-exist");
    expect(paths).not.toContain("/cart");
    expect(paths).not.toContain("/checkout");
    expect(paths).not.toContain("/admin");
    expect(paths.some((path) => path.includes("?"))).toBe(false);
    expect(paths).not.toContain("/p/featured-only");
  });

  it("returns unique paths without lastModified, priority, or changeFrequency", async () => {
    const urls = await listIndexableUrls(
      new InMemoryCategoryRepository([kids]),
      new InMemoryProductRepository([shirt, uncategorized]),
    );
    const paths = urls.map((entry) => entry.path);

    expect(new Set(paths).size).toBe(paths.length);
    expect(urls.every((entry) => Object.keys(entry).length === 1)).toBe(true);
    expect(urls[0]).not.toHaveProperty("lastModified");
    expect(urls[0]).not.toHaveProperty("priority");
    expect(urls[0]).not.toHaveProperty("changeFrequency");
  });

  it("still includes the homepage when the catalog is empty", async () => {
    const urls = await listIndexableUrls(
      new InMemoryCategoryRepository([]),
      new InMemoryProductRepository([]),
    );

    expect(urls).toEqual([{ path: "/" }]);
  });
});
