import { describe, expect, it } from "vitest";
import type { Category } from "@/domain/catalog";
import type { CategoryRepository } from "./category-repository";
import { getCategoryCollection } from "./get-category-collection";

function category(
  id: string,
  parentId: string | null,
  children: readonly Category[] = [],
): Category {
  return {
    id,
    slug: id,
    name: id,
    parentId,
    children,
    visibility: "visible",
    showInMenu: true,
    description: null,
    image: null,
  };
}

function repository(
  list: CategoryRepository["list"],
): CategoryRepository {
  return {
    getById: async () => null,
    getBySlug: async () => null,
    list,
  };
}

describe("getCategoryCollection", () => {
  it("returns ordered roots with arbitrary-depth descendants", async () => {
    const grandchild = category("grandchild", "child");
    const child = category("child", "root", [grandchild]);
    const root = category("root", null, [child]);
    const anotherRoot = category("another-root", null);
    const categories = repository(async () => [
      root,
      child,
      grandchild,
      anotherRoot,
    ]);

    await expect(getCategoryCollection(categories)).resolves.toEqual({
      data: [root, anotherRoot],
    });
  });

  it("returns a successful empty collection", async () => {
    await expect(
      getCategoryCollection(repository(async () => [])),
    ).resolves.toEqual({ data: [] });
  });

  it("propagates repository failures for the transport boundary to map", async () => {
    const failure = new Error("fixture unavailable");
    const categories = repository(async () => {
      throw failure;
    });

    await expect(getCategoryCollection(categories)).rejects.toBe(failure);
  });
});
