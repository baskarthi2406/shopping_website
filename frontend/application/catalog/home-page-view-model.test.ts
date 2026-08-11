import { describe, expect, it } from "vitest";
import type { Category, Product } from "@/domain/catalog";
import { toHomePageViewModel } from "./home-page-view-model";

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

describe("toHomePageViewModel", () => {
  const kids = category({
    id: "kids",
    slug: "kids",
    name: "Kids",
    image: {
      src: "/kids-striped-shirts-burgundy-and-sage.jpg",
      alt: "Burgundy and sage striped kids shirts",
    },
  });
  const empty = category({
    id: "infants",
    slug: "infants",
    name: "Infants",
  });
  const shirt = product({
    id: "shirt",
    slug: "kids-striped-shirts-burgundy-and-sage",
    name: "Burgundy and sage striped kids shirts",
    description: "Burgundy and sage striped kids shirts",
    images: [
      {
        src: "/kids-striped-shirts-burgundy-and-sage.jpg",
        alt: "Burgundy and sage striped kids shirts",
      },
    ],
    categoryIds: ["kids"],
  });

  it("maps catalog categories and products without hard-coded names", () => {
    const view = toHomePageViewModel({
      categories: [kids, empty],
      products: [shirt],
    });

    expect(view.categories).toEqual([
      {
        name: "Kids",
        href: "/c/kids",
        image: {
          src: "/kids-striped-shirts-burgundy-and-sage.jpg",
          alt: "Burgundy and sage striped kids shirts",
        },
      },
      { name: "Infants", href: "/c/infants", image: null },
    ]);
    expect(view.products).toEqual([
      {
        href: "/p/kids-striped-shirts-burgundy-and-sage",
        name: "Burgundy and sage striped kids shirts",
        description: "Burgundy and sage striped kids shirts",
        image: {
          src: "/kids-striped-shirts-burgundy-and-sage.jpg",
          alt: "Burgundy and sage striped kids shirts",
        },
      },
    ]);
  });

  it("points Shop Now at the first category that has products", () => {
    const view = toHomePageViewModel({
      categories: [empty, kids],
      products: [shirt],
    });

    expect(view.hero.ctaHref).toBe("/c/kids");
    expect(view.hero.ctaLabel).toBe("Shop Now");
    expect(view.promo.href).toBe("/c/kids");
  });

  it("omits the CTA when there are no categories", () => {
    const view = toHomePageViewModel({ categories: [], products: [] });

    expect(view.hero.ctaHref).toBeNull();
    expect(view.hero.ctaLabel).toBeNull();
    expect(view.promo.href).toBeNull();
    expect(view.products).toEqual([]);
  });

  it("uses approved hero and promo assets", () => {
    const view = toHomePageViewModel({ categories: [kids], products: [shirt] });

    expect(view.hero.image.src).toBe(
      "/baby-sleeveless-sets-new-collection-banner.jpg",
    );
    expect(view.promo.image.src).toBe(
      "/baby-dress-bloomer-sets-new-collection-banner.jpg",
    );
    expect(view.hero.image.alt).not.toContain(".jpg");
  });

  it("does not invent price or featured flags", () => {
    const view = toHomePageViewModel({ categories: [kids], products: [shirt] });

    expect(view).not.toHaveProperty("featured");
    expect(view.products[0]).not.toHaveProperty("price");
  });
});
