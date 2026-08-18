import { describe, expect, it } from "vitest";
import { toProductPageViewModel } from "@/application/catalog";
import type { Product } from "@/domain/catalog";
import { buildProductStructuredData } from "./product-structured-data";

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

function toAbsoluteUrl(path: string): string {
  if (path === "/") {
    return "https://store.example";
  }

  return `https://store.example${path}`;
}

const forbiddenKeys = [
  "offers",
  "price",
  "priceCurrency",
  "availability",
  "sku",
  "mpn",
  "brand",
  "aggregateRating",
  "review",
  "seller",
  "shippingDetails",
  "hasMerchantReturnPolicy",
  "color",
  "size",
  "category",
] as const;

describe("buildProductStructuredData", () => {
  const dress = toProductPageViewModel(
    product({
      id: "pink-white-pleated-baby-dress",
      slug: "pink-white-pleated-baby-dress",
      name: "Pink and white pleated baby dress",
      description: "Pink and white pleated baby dress",
      images: [
        {
          src: "/pink-white-pleated-baby-dress.jpg",
          alt: "Pink and white pleated baby dress",
        },
      ],
      categoryIds: ["baby-essentials"],
    }),
    [],
  );

  const set = toProductPageViewModel(
    product({
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
    }),
    [],
  );

  it("builds Schema.org Product data from a valid product", () => {
    const data = buildProductStructuredData(dress, toAbsoluteUrl);

    expect(data).toEqual({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Pink and white pleated baby dress",
      description: "Pink and white pleated baby dress",
      image: "https://store.example/pink-white-pleated-baby-dress.jpg",
      url: "https://store.example/p/pink-white-pleated-baby-dress",
    });
    expect(data?.url).toBe(toAbsoluteUrl(dress.canonicalPath));
    expect(data?.image?.startsWith("https://")).toBe(true);
    expect(data?.url).not.toContain("?");
  });

  it("produces different structured data for different products", () => {
    const dressData = buildProductStructuredData(dress, toAbsoluteUrl);
    const setData = buildProductStructuredData(set, toAbsoluteUrl);

    expect(dressData?.name).not.toBe(setData?.name);
    expect(dressData?.url).not.toBe(setData?.url);
    expect(dressData?.image).not.toBe(setData?.image);
  });

  it("includes uncategorized products and omits category", () => {
    const view = toProductPageViewModel(
      product({
        id: "olive-green-patterned-dress",
        slug: "olive-green-patterned-dress",
        name: "Olive green patterned dress",
        description: "Olive green patterned dress on a wooden hanger",
        images: [
          {
            src: "/olive-green-patterned-dress.jpg",
            alt: "Olive green patterned dress on a wooden hanger",
          },
        ],
      }),
      [],
    );
    const data = buildProductStructuredData(view, toAbsoluteUrl);

    expect(data?.name).toBe("Olive green patterned dress");
    expect(data?.url).toBe(
      "https://store.example/p/olive-green-patterned-dress",
    );
    expect(data).not.toHaveProperty("category");
  });

  it("omits description and image when those fields are blank", () => {
    const view = toProductPageViewModel(
      product({
        id: "blank",
        slug: "blank",
        name: "Blank product",
        description: "   ",
      }),
      [],
    );
    const data = buildProductStructuredData(view, toAbsoluteUrl);

    expect(data).toEqual({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Blank product",
      url: "https://store.example/p/blank",
    });
    expect(data).not.toHaveProperty("description");
    expect(data).not.toHaveProperty("image");
  });

  it("does not invent commerce, brand, or review fields", () => {
    const data = buildProductStructuredData(dress, toAbsoluteUrl);
    const json = JSON.stringify(data);

    expect(data).not.toBeNull();
    for (const key of forbiddenKeys) {
      expect(data).not.toHaveProperty(key);
    }

    expect(json).not.toMatch(
      /"offers"|"price"|"priceCurrency"|"availability"|"sku"|"brand"|"aggregateRating"|"review"/,
    );
    expect(json).not.toMatch(/InStock|MM-001|"0"|"999"|"TBD"/);
  });

  it("returns null for an unknown product", () => {
    expect(buildProductStructuredData(null, toAbsoluteUrl)).toBeNull();
  });
});
