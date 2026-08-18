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
    expect(productPage).not.toContain("buildOrganizationStructuredData");
    expect(categoryPage).not.toContain("buildOrganizationStructuredData");
  });
});
