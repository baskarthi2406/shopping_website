import { readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type {
  CategoryListResult,
  ProductDetailResult,
  ProductListResult,
} from "@/application/catalog";
import type { Category, Product } from "@/domain/catalog";
import { describeCatalogApiContract } from "@/infrastructure/catalog/catalog-api-contract";
import { dispatchCatalogApi } from "./catalog-api-dispatch";
import { catalogSource } from "./catalog-source";

const GOLDEN_URL = new URL("./catalog-api-dispatch.golden.json", import.meta.url);

describeCatalogApiContract("in-process dummy dispatch", () => dispatchCatalogApi);

async function read<T>(path: string): Promise<{ status: number; body: T }> {
  const response = await dispatchCatalogApi(new URL(path, "http://catalog.local"));
  return { status: response.status, body: (await response.json()) as T };
}

async function categoryTree(): Promise<readonly Category[]> {
  const { body } = await read<CategoryListResult>("/api/categories");
  if (!("data" in body)) {
    throw new Error("Expected the category collection");
  }
  return body.data;
}

function flatten(roots: readonly Category[]): Category[] {
  return roots.flatMap((category) => [category, ...flatten(category.children)]);
}

async function productDetails(): Promise<Product[]> {
  const summaries = [];
  for (let page = 1; ; page += 1) {
    const { body } = await read<ProductListResult>(`/api/products?page=${page}`);
    if (!("data" in body)) {
      throw new Error("Expected the product collection");
    }
    summaries.push(...body.data);
    if (!body.pagination.hasNext) {
      break;
    }
  }
  return Promise.all(
    summaries.map(async (summary) => {
      const detail = await read<ProductDetailResult>(`/api/products/${summary.slug}`);
      if (!("data" in detail.body)) {
        throw new Error(`Expected product detail for ${summary.slug}`);
      }
      return detail.body.data;
    }),
  );
}

function slugPaths(roots: readonly Category[], prefix = ""): string[] {
  return roots.flatMap((category) => {
    const path = `${prefix}${category.slug}`;
    return [path, ...slugPaths(category.children, `${path}/`)];
  });
}

/**
 * Normalized identity and structure of the dummy catalog. Names, descriptions,
 * and images are omitted (copy edits are not contract drift); category order
 * is kept because it is presentation-significant.
 */
async function goldenSnapshot() {
  const [roots, products] = await Promise.all([categoryTree(), productDetails()]);
  return {
    categoryTree: slugPaths(roots),
    categoriesHiddenOrNotInMenu: flatten(roots)
      .filter((category) => category.visibility !== "visible" || !category.showInMenu)
      .map((category) => category.slug),
    products: products.map((product) => ({
      id: product.id,
      slug: product.slug,
      categoryIds: product.categoryIds,
    })),
  };
}

describe("dummy catalog API (current data and consumers)", () => {
  it("matches the committed golden catalog identity and order", async () => {
    const actual = await goldenSnapshot();
    if (process.env.UPDATE_CATALOG_GOLDEN === "1") {
      writeFileSync(GOLDEN_URL, `${JSON.stringify(actual, null, 2)}\n`);
    }

    expect(actual).toEqual(JSON.parse(readFileSync(GOLDEN_URL, "utf8")));
  });

  it("keeps SKU, UOM, pricing, and inventory unknown (null) with no variants", async () => {
    for (const product of await productDetails()) {
      expect(
        {
          sku: product.sku,
          uom: product.uom,
          pricing: product.pricing,
          inventory: product.inventory,
          variants: product.variants,
        },
        product.slug,
      ).toEqual({ sku: null, uom: null, pricing: null, inventory: null, variants: [] });
    }
  });

  it("links product categoryIds only to categories in the API tree", async () => {
    const [roots, products] = await Promise.all([categoryTree(), productDetails()]);
    const categoryIds = new Set(flatten(roots).map((category) => category.id));

    for (const product of products) {
      for (const categoryId of product.categoryIds) {
        expect(categoryIds.has(categoryId), `${product.slug} -> ${categoryId}`).toBe(true);
      }
    }
  });

  it("lists the same category and product paths in the sitemap as the API", async () => {
    const [roots, products, indexable] = await Promise.all([
      categoryTree(),
      productDetails(),
      catalogSource.listIndexableUrls(),
    ]);
    const paths = indexable.map((entry) => entry.path);

    expect(paths[0]).toBe("/");
    expect(paths.filter((path) => path.startsWith("/c/")).sort()).toEqual(
      flatten(roots)
        .map((category) => `/c/${category.slug}`)
        .sort(),
    );
    expect(paths.filter((path) => path.startsWith("/p/"))).toEqual(
      products.map((product) => `/p/${product.slug}`),
    );
  });

  it("answers unknown catalog paths with 404 not_found (in-process dispatch only)", async () => {
    const { status, body } = await read<{ error: { code: string } }>("/api/unknown");

    expect(status).toBe(404);
    expect(body.error.code).toBe("not_found");
  });
});
