import { describe, expect, it } from "vitest";
import {
  toCategoryPageViewModel,
  toProductPageViewModel,
} from "@/application/catalog";
import type { Category, Product } from "@/domain/catalog";
import { serializeJsonLd } from "./serialize-json-ld";
import { buildBreadcrumbStructuredData } from "./breadcrumb-structured-data";

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

const babyEssentials: Category = {
  id: "baby-essentials",
  slug: "baby-essentials",
  name: "Baby Essentials",
  description: null,
  image: null,
};

function toAbsoluteUrl(path: string): string {
  if (path === "/") {
    return "https://store.example";
  }

  return `https://store.example${path}`;
}

describe("buildBreadcrumbStructuredData", () => {
  it("builds Home → Category for a category page", () => {
    const view = toCategoryPageViewModel(babyEssentials, []);
    const data = buildBreadcrumbStructuredData(view, toAbsoluteUrl);

    expect(data).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://store.example",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Baby Essentials",
          item: "https://store.example/c/baby-essentials",
        },
      ],
    });
    expect(data?.itemListElement).toHaveLength(view.breadcrumb.length);
    expect(data?.itemListElement[1]?.item).toBe(toAbsoluteUrl(view.canonicalPath));
  });

  it("builds Home → Category → Product when a category is known", () => {
    const view = toProductPageViewModel(
      product({
        id: "pink-white-pleated-baby-dress",
        slug: "pink-white-pleated-baby-dress",
        name: "Pink and white pleated baby dress",
        categoryIds: ["baby-essentials"],
      }),
      [babyEssentials],
    );
    const data = buildBreadcrumbStructuredData(view, toAbsoluteUrl);

    expect(data?.itemListElement.map((item) => item.name)).toEqual([
      "Home",
      "Baby Essentials",
      "Pink and white pleated baby dress",
    ]);
    expect(data?.itemListElement.map((item) => item.position)).toEqual([1, 2, 3]);
    expect(data?.itemListElement.map((item) => item.item)).toEqual([
      "https://store.example",
      "https://store.example/c/baby-essentials",
      "https://store.example/p/pink-white-pleated-baby-dress",
    ]);
    expect(data?.itemListElement).toHaveLength(view.breadcrumb.length);
  });

  it("builds Home → Product when the product has no category", () => {
    const view = toProductPageViewModel(
      product({
        id: "olive-green-patterned-dress",
        slug: "olive-green-patterned-dress",
        name: "Olive green patterned dress",
      }),
      [],
    );
    const data = buildBreadcrumbStructuredData(view, toAbsoluteUrl);

    expect(data?.itemListElement.map((item) => item.name)).toEqual([
      "Home",
      "Olive green patterned dress",
    ]);
    expect(data?.itemListElement.map((item) => item.item)).toEqual([
      "https://store.example",
      "https://store.example/p/olive-green-patterned-dress",
    ]);
    expect(data?.itemListElement).toHaveLength(2);
  });

  it("does not invent extra breadcrumb levels or query URLs", () => {
    const view = toCategoryPageViewModel(babyEssentials, []);
    const data = buildBreadcrumbStructuredData(view, toAbsoluteUrl);
    const names = data?.itemListElement.map((item) => item.name) ?? [];
    const urls = data?.itemListElement.map((item) => item.item) ?? [];

    expect(names).not.toContain("Kids");
    expect(names).not.toContain("Cart");
    expect(urls.every((url) => !url.includes("?"))).toBe(true);
  });

  it("returns null for unknown pages", () => {
    expect(buildBreadcrumbStructuredData(null, toAbsoluteUrl)).toBeNull();
    expect(
      buildBreadcrumbStructuredData(
        { breadcrumb: [], canonicalPath: "/c/missing" },
        toAbsoluteUrl,
      ),
    ).toBeNull();
  });

  it("serializes safely with the existing JSON-LD serializer", () => {
    const data = buildBreadcrumbStructuredData(
      toCategoryPageViewModel(
        {
          ...babyEssentials,
          name: `Baby</script><script>alert(1)</script>`,
        },
        [],
      ),
      toAbsoluteUrl,
    );

    expect(data).not.toBeNull();
    const json = serializeJsonLd(data!);
    expect(json).not.toContain("</script>");
    expect(JSON.parse(json)["@type"]).toBe("BreadcrumbList");
  });
});
