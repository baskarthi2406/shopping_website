import { describe, expect, it } from "vitest";
import type { CategoryRecord } from "./data/category-records";
import { mapCategories } from "./map-category";

function record(
  id: string,
  parentId: string | null = null,
): CategoryRecord {
  return {
    id,
    slug: id,
    name: id,
    parentId,
    visibility: "visible",
    showInMenu: true,
    description: null,
    image: null,
  };
}

describe("mapCategories", () => {
  it("derives recursive children while retaining flat record order", () => {
    const mapped = mapCategories([
      record("root"),
      record("child", "root"),
      record("grandchild", "child"),
      record("empty-root"),
    ]);

    expect(mapped.map((category) => category.id)).toEqual([
      "root",
      "child",
      "grandchild",
      "empty-root",
    ]);
    expect(mapped[0]?.children[0]?.children[0]?.id).toBe("grandchild");
    expect(mapped[3]?.children).toEqual([]);
  });

  it("rejects duplicate ids, missing parents, and cycles", () => {
    expect(() => mapCategories([record("same"), record("same")])).toThrow(
      "Duplicate category id",
    );
    expect(() => mapCategories([record("orphan", "missing")])).toThrow(
      "Unknown parent category",
    );
    expect(() =>
      mapCategories([record("first", "second"), record("second", "first")]),
    ).toThrow("Category hierarchy cycle");
  });

  it("rejects empty identity fields and duplicate routing slugs", () => {
    expect(() => mapCategories([record("")])).toThrow(
      "Category id must be non-empty",
    );
    expect(() =>
      mapCategories([{ ...record("unnamed"), name: " " }]),
    ).toThrow("Category name must be non-empty");
    expect(() =>
      mapCategories([
        record("first"),
        { ...record("second"), slug: "first" },
      ]),
    ).toThrow("Duplicate category slug first");
  });
});
