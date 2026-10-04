import { describe, expect, it } from "vitest";
import type { Category, Product } from "@/domain/catalog";
import { toCatalogNavItems } from "./catalog-nav-view-model";
import type { CategoryRepository } from "./category-repository";
import { getCategoryPage } from "./get-category-page";
import { getProductPage } from "./get-product-page";
import { toCategoryPageViewModel } from "./category-page-view-model";
import type { ProductRepository } from "./product-repository";
import { imageForVariant } from "./variant-selection";

function category(overrides: Partial<Category> & Pick<Category, "id" | "slug" | "name">): Category {
  return {
    parentId: null,
    children: [],
    visibility: "visible",
    showInMenu: true,
    description: null,
    image: null,
    ...overrides,
  };
}

function product(overrides: Partial<Product> & Pick<Product, "id" | "slug">): Product {
  return {
    name: overrides.slug,
    description: "",
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

const coOrd = category({
  id: "women-co-ord-set",
  slug: "women-co-ord-set",
  name: "Co-Ord Set",
  parentId: "women",
});
const women = category({
  id: "women",
  slug: "women",
  name: "Women",
  children: [coOrd],
});
const kids = category({ id: "kids", slug: "kids", name: "Kids" });
const categories = [women, coOrd, kids];

const mappedFirst = product({
  id: "group-1",
  slug: "group-one-000001",
  name: "Group One",
  categoryIds: ["women-co-ord-set"],
});
const mappedSecond = product({
  id: "group-2",
  slug: "group-two-000002",
  name: "Group Two",
  categoryIds: ["women-co-ord-set"],
});
const unmapped = product({
  id: "group-9",
  slug: "unmapped-group-000009",
  name: "Unmapped Group",
  categoryIds: [],
});
const products = [mappedFirst, mappedSecond, unmapped];

class Products implements ProductRepository {
  async getById(id: string) {
    return products.find((item) => item.id === id) ?? null;
  }
  async getBySlug(slug: string) {
    return products.find((item) => item.slug === slug) ?? null;
  }
  async list() {
    return products;
  }
  async listByCategorySlug(slug: string) {
    const match = categories.find((item) => item.slug === slug);
    if (match === undefined) {
      return [];
    }
    return products.filter((item) => item.categoryIds.includes(match.id));
  }
  async listFeatured() {
    return [];
  }
}

class Categories implements CategoryRepository {
  async getById(id: string) {
    return categories.find((item) => item.id === id) ?? null;
  }
  async getBySlug(slug: string) {
    return categories.find((item) => item.slug === slug) ?? null;
  }
  async list() {
    return categories;
  }
}

const productRepository = new Products();
const categoryRepository = new Categories();

describe("category → subcategory navigation", () => {
  it("exposes root categories and their subcategories in the menu", () => {
    expect(toCatalogNavItems(categories)).toEqual([
      {
        label: "Women",
        href: "/c/women",
        children: [{ label: "Co-Ord Set", href: "/c/women-co-ord-set", children: [] }],
      },
      { label: "Kids", href: "/c/kids", children: [] },
    ]);
  });

  it("keeps a parent category to its own products and links its subcategories", async () => {
    const page = await getCategoryPage(categoryRepository, productRepository, "women");
    const view = toCategoryPageViewModel(page!.category, page!.products, page!.ancestors);

    expect(page?.products).toEqual([]);
    expect(view.subcategories).toEqual([{ name: "Co-Ord Set", href: "/c/women-co-ord-set" }]);
    expect(view.breadcrumb).toEqual([
      { label: "Home", href: "/" },
      { label: "Women", href: null },
    ]);
  });

  it("lists only products assigned to the subcategory, in catalog order", async () => {
    const page = await getCategoryPage(categoryRepository, productRepository, "women-co-ord-set");
    const view = toCategoryPageViewModel(page!.category, page!.products, page!.ancestors);

    expect(page?.products.map((item) => item.id)).toEqual(["group-1", "group-2"]);
    expect(view.products.map((item) => item.href)).toEqual([
      "/p/group-one-000001",
      "/p/group-two-000002",
    ]);
    expect(view.breadcrumb.map((item) => item.label)).toEqual(["Home", "Women", "Co-Ord Set"]);
  });

  it("leaves an empty category empty", async () => {
    const page = await getCategoryPage(categoryRepository, productRepository, "kids");
    expect(page?.category.slug).toBe("kids");
    expect(page?.products).toEqual([]);
  });

  it("keeps an unmapped product out of every category listing", async () => {
    const listed = await Promise.all(
      categories.map((item) =>
        getCategoryPage(categoryRepository, productRepository, item.slug),
      ),
    );
    expect(listed.flatMap((page) => page?.products ?? []).some((item) => item.id === "group-9")).toBe(
      false,
    );
  });
});

describe("product routes", () => {
  it("resolves a mapped product at its stable slug under its subcategory", async () => {
    const page = await getProductPage(productRepository, categoryRepository, "group-one-000001");
    expect(page?.product.id).toBe("group-1");
    expect(page?.categories.map((item) => item.slug)).toEqual(["women-co-ord-set"]);
    expect(page?.primaryCategoryAncestors.map((item) => item.slug)).toEqual(["women"]);
  });

  it("resolves an unmapped product without assigning a storefront category", async () => {
    const page = await getProductPage(productRepository, categoryRepository, "unmapped-group-000009");
    expect(page?.product.categoryIds).toEqual([]);
    expect(page?.categories).toEqual([]);
    expect(page?.primaryCategoryAncestors).toEqual([]);
  });

  it("uses a variant's own image and no other variant's image", () => {
    const images = [
      { src: "/api/catalog-images/11/9001", alt: "One" },
      { src: "/api/catalog-images/13/9002", alt: "Two" },
    ];
    expect(imageForVariant(images, "13")?.src).toBe("/api/catalog-images/13/9002");
    expect(imageForVariant(images, "12")).toBeUndefined();
    expect(imageForVariant(images, "11/9001")).toBeUndefined();
  });
});
