import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("product page JSON-LD wiring", () => {
  it("renders Product JSON-LD from the Server Component page", () => {
    const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

    expect(source).not.toMatch(/["']use client["']/);
    expect(source).toContain("buildProductStructuredData");
    expect(source).toContain("JsonLd");
    expect(source).toContain("notFound()");
    expect(source).toContain("toCanonicalUrl");
  });
});
