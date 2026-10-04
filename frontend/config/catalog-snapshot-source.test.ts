import { describe, expect, it, vi } from "vitest";
import { createGetProductsHandler } from "@/app/api/products/get-products-handler";
import { createCatalogSnapshotStore } from "@/infrastructure/catalog/catalog-snapshot";
import { SnapshotProductRepository } from "@/infrastructure/catalog/snapshot-product-repository";
import { StaticCategoryRepository } from "@/infrastructure/catalog/static-category-repository";
import { StaticUomRepository } from "@/infrastructure/catalog/static-uom-repository";
import { createZohoCatalogLoader } from "@/infrastructure/zoho/zoho-catalog-snapshot";
import { createCatalog } from "./create-catalog";

const ORG = "100001";
/** Observed Zoho category ID mapped to `women-co-ord-set`; the second is synthetic and unmapped. */
const WOMEN_CO_ORD_SET = "4273340000000034557";
const UNMAPPED_CATEGORY = "900000000000009";

function item(id: string, groupId: string, categoryId: string) {
  return {
    item_id: id,
    group_id: groupId,
    group_name: `Group ${groupId}`,
    category_id: categoryId,
    status: "active",
    rate: 464,
    track_inventory: true,
    actual_available_stock: 2,
    attribute_name1: "size",
    attribute_option_name1: `S${id}`,
  };
}

function snapshotCatalog(failing = false) {
  const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    if (failing) {
      return new Response("{}", { status: 503 });
    }
    const body =
      url.pathname === "/v1/organizations"
        ? { code: 0, organizations: [{ organization_id: ORG, currency_code: "XTS" }] }
        : {
            code: 0,
            items: [item("1", "500", WOMEN_CO_ORD_SET), item("2", "600", UNMAPPED_CATEGORY)],
            page_context: { page: 1, has_more_page: false },
          };
    return Response.json(body);
  });
  const store = createCatalogSnapshotStore({
    load: createZohoCatalogLoader({
      config: { apiBaseUrl: "https://api.example.test/inventory/v1", timeoutMs: 1000 },
      organizationId: ORG,
      tokens: { getAccessToken: async () => "access-token-value" },
      fetchImpl,
    }),
    refreshIntervalMs: 60 * 60 * 1000,
    maxAgeMs: 24 * 60 * 60 * 1000,
    failureBackoffMs: 5 * 60 * 1000,
  });
  const catalog = createCatalog(
    new SnapshotProductRepository(() => store.getProducts()),
    new StaticCategoryRepository(),
    new StaticUomRepository(),
  );
  return { catalog, fetchImpl };
}

describe("storefront catalog over the Zoho snapshot", () => {
  it("serves home, category, product, and sitemap reads from one snapshot refresh", async () => {
    const { catalog, fetchImpl } = snapshotCatalog();

    for (let render = 0; render < 3; render += 1) {
      const home = await catalog.getHomePage();
      const category = await catalog.getCategoryPage("women-co-ord-set");
      const product = await catalog.getProductPage("group-500-500");
      const urls = await catalog.listIndexableUrls();

      expect(home.products.map((entry) => entry.id)).toEqual(["500"]);
      expect(category?.products.map((entry) => entry.id)).toEqual(["500"]);
      expect(product?.product.categoryIds).toEqual(["women-co-ord-set"]);
      expect(urls.filter((url) => url.path.startsWith("/p/"))).toEqual([
        { path: "/p/group-500-500" },
      ]);
    }

    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("keeps unmapped Zoho products off listings, product pages, and the sitemap", async () => {
    const { catalog } = snapshotCatalog();

    expect(await catalog.getProductPage("group-600-600")).toBeNull();
    const urls = await catalog.listIndexableUrls();
    expect(urls.some((url) => url.path.includes("group-600"))).toBe(false);
  });

  it("keeps storefront categories and URLs when the snapshot is empty of a category", async () => {
    const { catalog } = snapshotCatalog();

    const page = await catalog.getCategoryPage("women-sarees");
    expect(page?.category.slug).toBe("women-sarees");
    expect(page?.products).toEqual([]);
  });

  it("returns the existing temporarily_unavailable envelope when no snapshot can be loaded", async () => {
    const { catalog } = snapshotCatalog(true);
    const handler = createGetProductsHandler((query) => catalog.getProductCollection(query));

    const response = await handler(new Request("http://localhost/api/products"));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: {
        code: "temporarily_unavailable",
        message: "Product data is temporarily unavailable",
      },
    });
  });
});
