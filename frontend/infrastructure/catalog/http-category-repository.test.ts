import { describe, expect, it } from "vitest";
import type { Category } from "@/domain/catalog";
import type { CatalogApiClient } from "./catalog-api-client";
import {
  flattenCategoryTree,
  HttpCategoryRepository,
} from "./http-category-repository";

function category(
  id: string,
  children: readonly Category[] = [],
): Category {
  return {
    id,
    slug: id,
    name: id,
    parentId: children.length > 0 || id === "root" ? null : "root",
    children,
    visibility: "visible",
    showInMenu: true,
    description: null,
    image: null,
  };
}

describe("HttpCategoryRepository", () => {
  const grandchild = category("grandchild");
  const child = { ...category("child"), parentId: "root", children: [grandchild] };
  const root = { ...category("root"), parentId: null, children: [child] };

  const api: CatalogApiClient = {
    getCategoryTree: async () => [root],
    getProductCollection: async () => {
      throw new Error("not used");
    },
    getProductBySlug: async () => null,
  };

  it("flattens nested API trees for repository lookups", async () => {
    const categories = new HttpCategoryRepository(api);

    expect(flattenCategoryTree([root]).map((item) => item.id)).toEqual([
      "root",
      "child",
      "grandchild",
    ]);
    expect(await categories.getBySlug("grandchild")).toMatchObject({
      id: "grandchild",
    });
    expect(await categories.getById("missing")).toBeNull();
  });
});
