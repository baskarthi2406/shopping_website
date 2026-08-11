import { describe, expect, it } from "vitest";
import { isCatalogSlug } from "./slug";

describe("isCatalogSlug", () => {
  it("accepts lowercase hyphen-separated slugs", () => {
    expect(isCatalogSlug("olive-green-patterned-dress")).toBe(true);
    expect(isCatalogSlug("baby-essentials")).toBe(true);
    expect(isCatalogSlug("a")).toBe(true);
  });

  it("rejects empty, uppercase, spaces, underscores, and edge hyphens", () => {
    expect(isCatalogSlug("")).toBe(false);
    expect(isCatalogSlug("Olive-Green")).toBe(false);
    expect(isCatalogSlug("olive green")).toBe(false);
    expect(isCatalogSlug("olive_green")).toBe(false);
    expect(isCatalogSlug("-olive")).toBe(false);
    expect(isCatalogSlug("olive-")).toBe(false);
    expect(isCatalogSlug("olive--green")).toBe(false);
  });
});
