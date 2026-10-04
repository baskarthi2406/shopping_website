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
  parentId: null,
  children: [],
  visibility: "visible",
  showInMenu: true,
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
  sku: null,
  uom: null,
  pricing: null,
  inventory: null,
  status: "active",
  variants: [],
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
      "inventory",
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

  it("prefixes the breadcrumb with linked ancestors, root first", () => {
    const infants: Category = { ...category, id: "infants", slug: "infants", name: "Infants" };
    const babyGirl: Category = {
      ...category,
      id: "infants-baby-girl",
      slug: "infants-baby-girl",
      name: "Baby Girl",
      parentId: "infants",
    };
    const coOrdSet: Category = {
      ...category,
      id: "infants-baby-girl-co-ord-set",
      slug: "infants-baby-girl-co-ord-set",
      name: "Co-Ord Set",
      parentId: "infants-baby-girl",
    };

    const view = toCategoryPageViewModel(coOrdSet, [], [infants, babyGirl]);

    expect(view.breadcrumb).toEqual([
      { label: "Home", href: "/" },
      { label: "Infants", href: "/c/infants" },
      { label: "Baby Girl", href: "/c/infants-baby-girl" },
      { label: "Co-Ord Set", href: null },
    ]);
  });

  it("links visible direct subcategories in category order", () => {
    const child = (id: string, name: string, visibility: Category["visibility"] = "visible") => ({
      ...category,
      id,
      slug: id,
      name,
      parentId: "baby-essentials",
      visibility,
    });
    const parent: Category = {
      ...category,
      children: [
        child("baby-essentials-feeding", "Feeding"),
        child("baby-essentials-hidden", "Hidden", "hidden"),
        child("baby-essentials-grooming", "Grooming"),
      ],
    };

    expect(toCategoryPageViewModel(parent, []).subcategories).toEqual([
      { name: "Feeding", href: "/c/baby-essentials-feeding" },
      { name: "Grooming", href: "/c/baby-essentials-grooming" },
    ]);
    expect(toCategoryPageViewModel(category, []).subcategories).toEqual([]);
  });

  it("keeps a valid category with zero products as an empty collection", () => {
    const view = toCategoryPageViewModel(category, []);

    expect(view.productCount).toBe(0);
    expect(view.products).toEqual([]);
    expect(view.name).toBe("Baby Essentials");
  });
});
