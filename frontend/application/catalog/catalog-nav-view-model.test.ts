import { describe, expect, it } from "vitest";
import type { Category } from "@/domain/catalog";
import { toCatalogNavItems } from "./catalog-nav-view-model";

function category(
  overrides: Partial<Category> & Pick<Category, "id" | "slug" | "name">,
): Category {
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

describe("toCatalogNavItems", () => {
  it("maps arbitrary category depth to crawlable /c/{slug} links", () => {
    const frock = category({
      id: "infants-baby-girl-frock",
      slug: "infants-baby-girl-frock",
      name: "Frock",
      parentId: "infants-baby-girl",
    });
    const babyGirl = category({
      id: "infants-baby-girl",
      slug: "infants-baby-girl",
      name: "Baby Girl",
      parentId: "infants",
      children: [frock],
    });
    const infants = category({
      id: "infants",
      slug: "infants",
      name: "Infants",
      children: [babyGirl],
    });
    const women = category({
      id: "women",
      slug: "women",
      name: "Women",
    });

    expect(toCatalogNavItems([infants, babyGirl, frock, women])).toEqual([
      {
        label: "Infants",
        href: "/c/infants",
        children: [
          {
            label: "Baby Girl",
            href: "/c/infants-baby-girl",
            children: [
              {
                label: "Frock",
                href: "/c/infants-baby-girl-frock",
                children: [],
              },
            ],
          },
        ],
      },
      { label: "Women", href: "/c/women", children: [] },
    ]);
  });

  it("omits hidden and non-menu categories at every level", () => {
    const hidden = category({
      id: "hidden",
      slug: "hidden",
      name: "Hidden",
      parentId: "root",
      visibility: "hidden",
    });
    const notInMenu = category({
      id: "not-in-menu",
      slug: "not-in-menu",
      name: "Not in menu",
      parentId: "root",
      showInMenu: false,
    });
    const root = category({
      id: "root",
      slug: "root",
      name: "Root",
      children: [hidden, notInMenu],
    });

    expect(toCatalogNavItems([root, hidden, notInMenu])).toEqual([
      { label: "Root", href: "/c/root", children: [] },
    ]);
  });

  it("does not invent extra destinations", () => {
    expect(toCatalogNavItems([])).toEqual([]);
  });
});
