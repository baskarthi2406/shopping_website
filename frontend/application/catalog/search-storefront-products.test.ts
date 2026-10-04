import { describe, expect, it } from "vitest";
import type { Category, Product, ProductVariant } from "@/domain/catalog";
import { searchStorefrontProducts } from "./search-storefront-products";

function category(id: string, name: string): Category {
  return {
    id,
    slug: id,
    name,
    parentId: null,
    children: [],
    visibility: "visible",
    showInMenu: true,
    description: null,
    image: null,
  };
}

function variant(sku: string): ProductVariant {
  return {
    id: sku,
    sku,
    attributes: [],
    pricing: null,
    inventory: null,
    status: "active",
  };
}

function product(name: string, overrides: Partial<Product> = {}): Product {
  return {
    id: name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
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

const categories = [category("in-skirt", "In skirt"), category("co-ord", "Co-Ord Set")];

describe("searchStorefrontProducts", () => {
  const catalog = [
    product("Inskirt", { categoryIds: ["in-skirt"], variants: [variant("INS-8PA")] }),
    product("Girl Coord set", { categoryIds: ["co-ord"], sku: "GIR-0-3-PIN" }),
    product("2pc kurti", { categoryIds: ["co-ord"] }),
  ];

  it("matches a product name and links stay on the matched product", () => {
    const matches = searchStorefrontProducts(catalog, categories, "inskirt");
    expect(matches.map((item) => item.name)).toEqual(["Inskirt"]);
    expect(matches[0]?.slug).toBe("inskirt");
  });

  it("matches a storefront category name and a SKU already on the product", () => {
    expect(searchStorefrontProducts(catalog, categories, "skirt").map((item) => item.name)).toEqual([
      "Inskirt",
    ]);
    expect(searchStorefrontProducts(catalog, categories, "ins-8pa").map((item) => item.name)).toEqual([
      "Inskirt",
    ]);
    expect(searchStorefrontProducts(catalog, categories, "gir-0-3-pin").map((item) => item.name)).toEqual([
      "Girl Coord set",
    ]);
  });

  it("requires every word and returns nothing for a blank or unknown query", () => {
    expect(searchStorefrontProducts(catalog, categories, "coord set").map((item) => item.name)).toEqual([
      "Girl Coord set",
    ]);
    expect(searchStorefrontProducts(catalog, categories, "   ")).toEqual([]);
    expect(searchStorefrontProducts(catalog, categories, "triangle toy")).toEqual([]);
  });
});
