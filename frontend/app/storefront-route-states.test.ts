import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CATALOG_UNAVAILABLE_MESSAGE } from "@/application/catalog";

describe("storefront route state boundaries", () => {
  const rootError = readFileSync(new URL("./error.tsx", import.meta.url), "utf8");
  const rootLoading = readFileSync(
    new URL("./loading.tsx", import.meta.url),
    "utf8",
  );
  const notFound = readFileSync(
    new URL("./not-found.tsx", import.meta.url),
    "utf8",
  );
  const home = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
  const category = readFileSync(
    new URL("./c/[slug]/page.tsx", import.meta.url),
    "utf8",
  );
  const product = readFileSync(
    new URL("./p/[slug]/page.tsx", import.meta.url),
    "utf8",
  );
  const categoryError = readFileSync(
    new URL("./c/[slug]/error.tsx", import.meta.url),
    "utf8",
  );
  const productError = readFileSync(
    new URL("./p/[slug]/error.tsx", import.meta.url),
    "utf8",
  );
  const categoryLoading = readFileSync(
    new URL("./c/[slug]/loading.tsx", import.meta.url),
    "utf8",
  );
  const productLoading = readFileSync(
    new URL("./p/[slug]/loading.tsx", import.meta.url),
    "utf8",
  );

  it("keeps generic catalog failures on error boundaries", () => {
    expect(rootError).toContain('"use client"');
    expect(rootError).toContain("CatalogUnavailable");
    expect(rootError).toContain("onRetry={reset}");
    expect(rootError).not.toContain("error.message");
    expect(rootError).not.toContain("error.stack");
    expect(rootError).toContain("isNextNavigationError");
    expect(categoryError).toContain("@/app/error");
    expect(productError).toContain("@/app/error");
  });

  it("adds loading placeholders for homepage, category, and PDP", () => {
    expect(rootLoading).toContain("HomeCatalogLoading");
    expect(categoryLoading).toContain("CategoryCatalogLoading");
    expect(productLoading).toContain("ProductCatalogLoading");
    expect(rootLoading).not.toMatch(/StaticProductRepository|zoho/i);
  });

  it("keeps unknown category and product slugs on not-found, not catalog errors", () => {
    expect(notFound).toContain("Page not found");
    expect(notFound).not.toContain(CATALOG_UNAVAILABLE_MESSAGE);
    expect(category).toContain("notFound()");
    expect(product).toContain("notFound()");
    expect(category).toContain("CatalogEmptyState");
    expect(home).not.toMatch(/["']use client["']/);
  });

  it("keeps homepage hero when catalog loading fails", () => {
    expect(home).toContain("try {");
    expect(home).toContain("CatalogUnavailable");
    expect(home).toContain("HomeHero");
    expect(home).toContain("HomePromo");
    expect(home).toContain("TrustBar");
    expect(home).toContain("unstable_rethrow");
    expect(home).not.toContain("error.message");
  });
});
