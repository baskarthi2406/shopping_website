import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("layout Organization JSON-LD wiring", () => {
  it("emits Organization JSON-LD once from the root layout", () => {
    const layout = readFileSync(new URL("./layout.tsx", import.meta.url), "utf8");
    const productPage = readFileSync(
      new URL("./p/[slug]/page.tsx", import.meta.url),
      "utf8",
    );
    const categoryPage = readFileSync(
      new URL("./c/[slug]/page.tsx", import.meta.url),
      "utf8",
    );

    expect(layout).not.toMatch(/["']use client["']/);
    expect(layout).toContain("buildOrganizationStructuredData");
    expect(layout).toContain("JsonLd");
    expect(layout).toContain("toCanonicalUrl");
    expect(layout).toContain("@/config/organization");
    expect(layout).toContain("@/config/catalog");
    expect(layout).toContain("catalog.listCategories");
    expect(layout).toContain("unstable_rethrow");
    expect(layout).toContain("toCatalogNavItems");
    expect(layout).toContain("toFooterNavViewModel");
    expect(layout).not.toContain("catalog-source");
    expect(layout).not.toMatch(/\bfetch\s*\(/);
    expect(layout).toContain("@/app/fonts");
    expect(layout).toContain("sourceSans.variable");
    expect(layout).toContain("cormorant.variable");
    expect(layout).not.toMatch(/product-records|category-records/);
    expect(productPage).not.toContain("buildOrganizationStructuredData");
    expect(categoryPage).not.toContain("buildOrganizationStructuredData");
  });
});
