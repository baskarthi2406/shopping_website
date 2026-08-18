import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("homepage metadata wiring", () => {
  it("maps homepage metadata through the existing OpenGraph adapter", () => {
    const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

    expect(source).not.toMatch(/["']use client["']/);
    expect(source).toContain("buildHomeMetadata");
    expect(source).toContain("toNextMetadata");
    expect(source).not.toContain("process.env");
    expect(source).not.toContain("buildOrganizationStructuredData");
  });
});
