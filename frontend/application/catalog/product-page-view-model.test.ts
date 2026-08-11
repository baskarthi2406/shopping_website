import { describe, expect, it } from "vitest";
import type { Category, Product } from "@/domain/catalog";
import { toProductPageViewModel } from "./product-page-view-model";

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

const babyEssentials: Category = {
  id: "baby-essentials",
  slug: "baby-essentials",
  name: "Baby Essentials",
  description: null,
  image: null,
};

describe("toProductPageViewModel", () => {
  it("maps presentation fields, canonical path, and category links", () => {
    const view = toProductPageViewModel(product, [babyEssentials]);

    expect(view).toMatchObject({
      slug: "sage-striped-baby-top-and-shorts",
      name: "Sage striped baby top and shorts",
      description: "Sage striped baby top and matching shorts",
      canonicalPath: "/p/sage-striped-baby-top-and-shorts",
    });
    expect(view.images[0]).toEqual({
      src: "/sage-striped-baby-top-and-shorts.jpg",
      alt: "Sage striped baby top and matching shorts",
    });
    expect(view.categories).toEqual([
      { name: "Baby Essentials", href: "/c/baby-essentials" },
    ]);
    expect(view.breadcrumb).toEqual([
      { label: "Home", href: "/" },
      { label: "Baby Essentials", href: "/c/baby-essentials" },
      { label: "Sage striped baby top and shorts", href: null },
    ]);
  });

  it("omits category crumbs when the product has no resolved categories", () => {
    const view = toProductPageViewModel(product, []);

    expect(view.categories).toEqual([]);
    expect(view.breadcrumb).toEqual([
      { label: "Home", href: "/" },
      { label: "Sage striped baby top and shorts", href: null },
    ]);
  });

  it("does not invent price, inventory, or variant display fields", () => {
    const view = toProductPageViewModel(product, [babyEssentials]);

    expect(view).not.toHaveProperty("price");
    expect(view).not.toHaveProperty("inventoryStatus");
    expect(view).not.toHaveProperty("variants");
  });
});
