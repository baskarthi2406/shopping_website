import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const appDir = path.resolve(import.meta.dirname);
const componentsDir = path.resolve(import.meta.dirname, "../components");

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = path.join(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      if (entry === "api") {
        return [];
      }
      return listSourceFiles(fullPath);
    }
    return /\.(ts|tsx)$/.test(entry) && !entry.endsWith(".test.ts")
      ? [fullPath]
      : [];
  });
}

describe("storefront data boundary", () => {
  const presentationFiles = [
    ...listSourceFiles(appDir),
    ...listSourceFiles(componentsDir),
  ];

  it("keeps pages and components off fixtures, repositories, and Zoho types", () => {
    expect(presentationFiles.length).toBeGreaterThan(0);

    for (const file of presentationFiles) {
      const source = readFileSync(file, "utf8");
      const relative = path.relative(path.resolve(import.meta.dirname, ".."), file);

      expect(source, relative).not.toMatch(
        /product-records|category-records/,
      );
      expect(source, relative).not.toMatch(
        /StaticProductRepository|StaticCategoryRepository/,
      );
      expect(source, relative).not.toMatch(/zoho|item_id|stock_on_hand/i);
    }
  });

  it("keeps storefront pages on the catalog application boundary", () => {
    const home = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
    const category = readFileSync(
      new URL("./c/[slug]/page.tsx", import.meta.url),
      "utf8",
    );
    const product = readFileSync(
      new URL("./p/[slug]/page.tsx", import.meta.url),
      "utf8",
    );

    expect(home).toContain('from "@/config/catalog"');
    expect(home).not.toMatch(/["']use client["']/);
    expect(category).toContain('from "@/config/catalog"');
    expect(product).toContain('from "@/config/catalog"');
    expect(product).toContain("catalog.getProductPage");
  });

  it("keeps dummy API routes on the backing catalog source", () => {
    const categories = readFileSync(
      new URL("./api/categories/route.ts", import.meta.url),
      "utf8",
    );
    const products = readFileSync(
      new URL("./api/products/route.ts", import.meta.url),
      "utf8",
    );
    const productDetail = readFileSync(
      new URL("./api/products/[slug]/route.ts", import.meta.url),
      "utf8",
    );

    for (const source of [categories, products, productDetail]) {
      expect(source).toContain("@/config/catalog-source");
      expect(source).not.toMatch(/from ["']@\/config\/catalog["']/);
    }
  });
});
