import { describe, expect, it } from "vitest";
import type { Category, Product } from "@/domain/catalog";
import {
  toCategoryPageViewModel,
  toProductCardViewModel,
} from "./category-page-view-model";

const category: Category = {
  id: "baby-essentials",
  slug: "baby-essentials",
  name: "Baby Essentials",
  description: null,
  image: null,
};

const product: Product = {
  id: "sage-striped-baby-top-and-shorts",
  slug: "sage-striped-baby-top-and-shorts",
  name: "Sage striped baby top and shorts",
  description: "Sage striped baby top and matching shorts",
  images: [
    {
      src: "/sage-striped-baby-top-and-shorts.jpg",
      alt: "Sage striped baby top and matching shorts",
    },
  ],
  categoryIds: ["baby-essentials"],
  variants: [{ id: "sage-striped-baby-top-and-shorts-default" }],
  uomCode: null,
  inventoryStatus: "unknown",
};

describe("toProductCardViewModel", () => {
  it("maps presentation fields and a product detail href", () => {
    expect(toProductCardViewModel(product)).toEqual({
      href: "/p/sage-striped-baby-top-and-shorts",
      name: "Sage striped baby top and shorts",
      description: "Sage striped baby top and matching shorts",
      image: {
        src: "/sage-striped-baby-top-and-shorts.jpg",
        alt: "Sage striped baby top and matching shorts",
      },
    });
  });

  it("omits image when the product has none", () => {
    const withoutImage: Product = { ...product, images: [] };
    expect(toProductCardViewModel(withoutImage).image).toBeNull();
  });

  it("does not invent price or inventory display fields", () => {
    expect(toProductCardViewModel(product)).not.toHaveProperty("price");
    expect(toProductCardViewModel(product)).not.toHaveProperty(
      "inventoryStatus",
    );
  });
});

describe("toCategoryPageViewModel", () => {
  it("builds a category view with canonical path and product count", () => {
    const view = toCategoryPageViewModel(category, [product]);

    expect(view).toMatchObject({
      slug: "baby-essentials",
      name: "Baby Essentials",
      description: null,
      canonicalPath: "/c/baby-essentials",
      productCount: 1,
    });
    expect(view.products).toHaveLength(1);
    expect(view.products[0]?.href).toBe("/p/sage-striped-baby-top-and-shorts");
    expect(view.breadcrumb).toEqual([
      { label: "Home", href: "/" },
      { label: "Baby Essentials", href: null },
    ]);
  });
});
