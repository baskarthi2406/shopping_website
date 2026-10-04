import { describe, expect, it } from "vitest";
import type { Category } from "@/domain/catalog";
import type { CategoryRepository } from "./category-repository";
import { listCategoryAncestors } from "./list-category-ancestors";

function category(id: string, parentId: string | null): Category {
  return {
    id,
    slug: id,
    name: id,
    parentId,
    children: [],
    visibility: "visible",
    showInMenu: true,
    description: null,
    image: null,
  };
}

function repository(items: readonly Category[]): CategoryRepository {
  return {
    getById: async (id) => items.find((item) => item.id === id) ?? null,
    getBySlug: async (slug) => items.find((item) => item.slug === slug) ?? null,
    list: async () => items,
  };
}

describe("listCategoryAncestors", () => {
  const infants = category("infants", null);
  const babyGirl = category("infants-baby-girl", "infants");
  const coOrdSet = category("infants-baby-girl-co-ord-set", "infants-baby-girl");
  const categories = repository([infants, babyGirl, coOrdSet]);

  it("returns the parent chain root first", async () => {
    expect(await listCategoryAncestors(categories, coOrdSet)).toEqual([infants, babyGirl]);
    expect(await listCategoryAncestors(categories, babyGirl)).toEqual([infants]);
  });

  it("returns nothing for a top-level category", async () => {
    expect(await listCategoryAncestors(categories, infants)).toEqual([]);
  });

  it("stops at a missing parent without inventing levels", async () => {
    const orphan = category("orphan", "missing-parent");

    expect(await listCategoryAncestors(categories, orphan)).toEqual([]);
  });

  it("stops on a parent cycle", async () => {
    const a = category("a", "b");
    const b = category("b", "a");

    expect(await listCategoryAncestors(repository([a, b]), a)).toEqual([b]);
  });
});
