import { describe, expect, it } from "vitest";
import type { Product } from "@/domain/catalog";
import { buildProductMetadata } from "./product-metadata";

function product(
  overrides: Partial<Product> & Pick<Product, "id" | "slug" | "name">,
): Product {
  return {
    description: "In-memory test product",
    images: [],
    categoryIds: [],
    variants: [{ id: `${overrides.id}-default` }],
    uomCode: null,
    inventoryStatus: "unknown",
    ...overrides,
  };
}

describe("buildProductMetadata", () => {
  it("builds a unique title and canonical path from the product", () => {
    const dress = buildProductMetadata(
      product({
        id: "pink-white-pleated-baby-dress",
        slug: "pink-white-pleated-baby-dress",
        name: "Pink and white pleated baby dress",
        description: "Pink and white pleated baby dress",
      }),
    );
    const set = buildProductMetadata(
      product({
        id: "sage-striped-baby-top-and-shorts",
        slug: "sage-striped-baby-top-and-shorts",
        name: "Sage striped baby top and shorts",
        description: "Sage striped baby top and matching shorts",
      }),
    );

    expect(dress.title).toBe("Pink and white pleated baby dress | Mini Mystiq");
    expect(set.title).toBe("Sage striped baby top and shorts | Mini Mystiq");
    expect(dress.title).not.toBe(set.title);
    expect(dress.canonicalPath).toBe("/p/pink-white-pleated-baby-dress");
    expect(set.canonicalPath).toBe("/p/sage-striped-baby-top-and-shorts");
  });

  it("uses the product description when present", () => {
    const meta = buildProductMetadata(
      product({
        id: "olive-green-patterned-dress",
        slug: "olive-green-patterned-dress",
        name: "Olive green patterned dress",
        description: "Olive green patterned dress on a wooden hanger",
      }),
    );

    expect(meta.description).toBe(
      "Olive green patterned dress on a wooden hanger",
    );
  });

  it("uses a factual fallback when description is blank", () => {
    const meta = buildProductMetadata(
      product({
        id: "blank",
        slug: "blank",
        name: "Blank product",
        description: "   ",
      }),
    );

    expect(meta.description).toBe(
      "Blank product at Mini Mystiq. Baby Clothes & Toys.",
    );
  });

  it("includes the first product image when present", () => {
    const meta = buildProductMetadata(
      product({
        id: "pink-white-pleated-baby-dress",
        slug: "pink-white-pleated-baby-dress",
        name: "Pink and white pleated baby dress",
        images: [
          {
            src: "/pink-white-pleated-baby-dress.jpg",
            alt: "Pink and white pleated baby dress",
          },
        ],
      }),
    );

    expect(meta.image).toEqual({
      src: "/pink-white-pleated-baby-dress.jpg",
      alt: "Pink and white pleated baby dress",
    });
  });

  it("does not add query parameters to the canonical path", () => {
    const meta = buildProductMetadata(
      product({
        id: "teens-item",
        slug: "teens-item",
        name: "Teens item",
      }),
    );

    expect(meta.canonicalPath).toBe("/p/teens-item");
    expect(meta.canonicalPath).not.toContain("?");
  });

  it("does not invent price, stock, or material claims", () => {
    const meta = buildProductMetadata(
      product({
        id: "olive-green-patterned-dress",
        slug: "olive-green-patterned-dress",
        name: "Olive green patterned dress",
        description: "Olive green patterned dress on a wooden hanger",
      }),
    );
    const combined = `${meta.title} ${meta.description}`;

    expect(combined).not.toMatch(
      /\b(best|cheap|premium|organic|handmade|linen|in stock|sku)\b/i,
    );
    expect(meta).not.toHaveProperty("price");
    expect(meta).not.toHaveProperty("availability");
  });
});
