import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("category page JSON-LD wiring", () => {
  it("renders BreadcrumbList JSON-LD from the Server Component page", () => {
    const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

    expect(source).not.toMatch(/["']use client["']/);
    expect(source).toContain("buildBreadcrumbStructuredData");
    expect(source).toContain("JsonLd");
    expect(source).toContain("notFound()");
    expect(source).toContain("toCanonicalUrl");
  });
});
