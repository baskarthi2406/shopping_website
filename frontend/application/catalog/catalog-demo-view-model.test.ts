import { describe, expect, it } from "vitest";
import type { Product } from "@/domain/catalog";
import { NO_SOURCE_CATEGORY_LABEL, toCatalogDemoViewModel } from "./catalog-demo-view-model";

function product(id: string, categoryIds: string[]): Product {
  return {
    id,
    slug: `product-${id}`,
    name: `Product ${id}`,
    description: "",
    images: [],
    categoryIds,
    sku: null,
    uom: null,
    pricing: null,
    inventory: null,
    status: "active",
    variants: [],
  };
}

describe("toCatalogDemoViewModel", () => {
  it("groups every product by source category label, flagging unplaced products", () => {
    const view = toCatalogDemoViewModel(
      [product("1", ["women-tops"]), product("2", []), product("3", []), product("4", ["kids"])],
      new Map([
        ["1", { name: "Tops" }],
        ["2", { name: "Night Wear" }],
        ["3", { name: null }],
        ["4", { name: "Night Wear" }],
      ]),
    );

    expect(view.productCount).toBe(4);
    expect(view.placedCount).toBe(2);
    expect(view.unplacedCount).toBe(2);
    expect(view.groups.map((group) => group.label)).toEqual([
      "Night Wear",
      "Tops",
      NO_SOURCE_CATEGORY_LABEL,
    ]);
    expect(view.groups[0].products.map((entry) => [entry.href, entry.placed])).toEqual([
      ["/p/product-2", false],
      ["/p/product-4", true],
    ]);
  });

  it("puts products without metadata under the fallback label", () => {
    const view = toCatalogDemoViewModel([product("1", [])], new Map());

    expect(view.groups).toEqual([
      {
        label: NO_SOURCE_CATEGORY_LABEL,
        products: [
          { href: "/p/product-1", name: "Product 1", description: "", image: null, placed: false },
        ],
      },
    ]);
  });
});
