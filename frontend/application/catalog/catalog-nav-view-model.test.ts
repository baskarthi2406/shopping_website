import { describe, expect, it } from "vitest";
import type { Category } from "@/domain/catalog";
import { toCatalogNavItems } from "./catalog-nav-view-model";

describe("toCatalogNavItems", () => {
  it("maps categories to crawlable /c/{slug} links in repository order", () => {
    const categories: readonly Category[] = [
      {
        id: "baby-essentials",
        slug: "baby-essentials",
        name: "Baby Essentials",
        description: null,
        image: null,
      },
      {
        id: "women",
        slug: "women",
        name: "Women",
        description: null,
        image: null,
      },
    ];

    expect(toCatalogNavItems(categories)).toEqual([
      { label: "Baby Essentials", href: "/c/baby-essentials" },
      { label: "Women", href: "/c/women" },
    ]);
  });

  it("does not invent extra destinations", () => {
    expect(toCatalogNavItems([])).toEqual([]);
  });
});
