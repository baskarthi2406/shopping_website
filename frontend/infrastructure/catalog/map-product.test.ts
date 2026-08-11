import { describe, expect, it } from "vitest";
import { mapProduct } from "./map-product";

describe("mapProduct", () => {
  it("throws when the record slug is not a catalog slug", () => {
    expect(() =>
      mapProduct({
        id: "bad",
        slug: "Not A Slug",
        name: "Bad",
        description: "Bad",
        images: [],
        categoryIds: [],
      }),
    ).toThrow("Invalid product slug: Not A Slug");
  });
});
