import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";
import { catalog } from "@/config/catalog";
import { resolveSiteOrigin, toCanonicalUrl } from "@/config/site";

describe("sitemap", () => {
  it("uses catalog composition and site origin config, not fixtures", () => {
    const source = readFileSync(new URL("./sitemap.ts", import.meta.url), "utf8");

    expect(source).toContain("@/config/catalog");
    expect(source).toContain("@/config/site");
    expect(source).not.toMatch(/product-records|category-records/);
    expect(source).not.toMatch(/baby-essentials|infants|teens|women/);
    expect(source).not.toMatch(/pink-white-pleated-baby-dress/);
  });

  it("emits unique canonical URLs for homepage, categories, and products", async () => {
    const origin = resolveSiteOrigin();
    const [entries, categories, products] = await Promise.all([
      sitemap(),
      catalog.listCategories(),
      catalog.listProducts(),
    ]);
    const urls = entries.map((entry) => entry.url);

    expect(urls[0]).toBe(toCanonicalUrl(origin, "/"));
    expect(urls).toHaveLength(1 + categories.length + products.length);
    expect(new Set(urls).size).toBe(urls.length);

    for (const category of categories) {
      expect(urls).toContain(toCanonicalUrl(origin, `/c/${category.slug}`));
    }

    for (const product of products) {
      expect(urls).toContain(toCanonicalUrl(origin, `/p/${product.slug}`));
    }

    expect(urls).not.toContain(toCanonicalUrl(origin, "/c/does-not-exist"));
    expect(urls).not.toContain(toCanonicalUrl(origin, "/p/does-not-exist"));
    expect(urls.some((url) => url.includes("?"))).toBe(false);
    expect(urls.some((url) => /\/(cart|checkout|admin)(\/|$)/.test(url))).toBe(
      false,
    );
    expect(entries.every((entry) => Object.keys(entry).length === 1)).toBe(true);
    expect(entries[0]).not.toHaveProperty("lastModified");
    expect(entries[0]).not.toHaveProperty("priority");
    expect(entries[0]).not.toHaveProperty("changeFrequency");
  });
});
