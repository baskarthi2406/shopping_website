import { describe, expect, it, vi } from "vitest";
import { createGetProductsHandler } from "@/app/api/products/get-products-handler";
import { toCatalogDemoViewModel } from "@/application/catalog";
import { createCatalogApiClient } from "@/infrastructure/catalog/catalog-api-client";
import { describeCatalogApiContract } from "@/infrastructure/catalog/catalog-api-contract";
import { createCatalogSnapshotStore } from "@/infrastructure/catalog/catalog-snapshot";
import { HttpCategoryRepository } from "@/infrastructure/catalog/http-category-repository";
import { HttpProductRepository } from "@/infrastructure/catalog/http-product-repository";
import { SnapshotProductRepository } from "@/infrastructure/catalog/snapshot-product-repository";
import { StaticCategoryRepository } from "@/infrastructure/catalog/static-category-repository";
import { StaticUomRepository } from "@/infrastructure/catalog/static-uom-repository";
import {
  createZohoCatalogLoader,
  type ZohoCatalogPublication,
} from "@/infrastructure/zoho/zoho-catalog-snapshot";
import { catalogImagePath } from "@/app/api/catalog-images/catalog-image-path";
import { createCatalogApiDispatch } from "./catalog-api-dispatch";
import { createCatalog } from "./create-catalog";

const ORG = "100001";
const ACCESS_TOKEN = "access-token-value";
/** Observed Zoho category ID mapped to `women-co-ord-set`; the second is synthetic and unmapped. */
const WOMEN_CO_ORD_SET = "4273340000000034557";
const UNMAPPED_CATEGORY = "900000000000009";

function item(id: string, groupId: string, categoryId: string) {
  return {
    item_id: id,
    group_id: groupId,
    group_name: `Group ${groupId}`,
    category_id: categoryId,
    category_name: categoryId === UNMAPPED_CATEGORY ? "Night Wear" : "Co-Ord Set",
    sku: `SKU-${id}`,
    status: "active",
    rate: 464,
    track_inventory: true,
    actual_available_stock: 2,
    attribute_name1: "size",
    attribute_option_name1: `S${id}`,
    image_document_id: `90${id}`,
  };
}

function snapshotCatalog(
  options: { failing?: boolean; publication?: ZohoCatalogPublication } = {},
) {
  const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    if (options.failing) {
      return new Response("{}", { status: 503 });
    }
    const body =
      url.pathname === "/v1/organizations"
        ? { code: 0, organizations: [{ organization_id: ORG, currency_code: "INR" }] }
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
      tokens: { getAccessToken: async () => ACCESS_TOKEN },
      fetchImpl,
      publication: options.publication,
      imageSrc: (ref) => catalogImagePath(ref.itemId, ref.documentId),
    }),
    refreshIntervalMs: 60 * 60 * 1000,
    maxAgeMs: 24 * 60 * 60 * 1000,
    failureBackoffMs: 5 * 60 * 1000,
  });
  const catalog = createCatalog(
    new SnapshotProductRepository(async () => (await store.get()).products),
    new StaticCategoryRepository(),
    new StaticUomRepository(),
  );
  return { catalog, fetchImpl, store };
}

/** The storefront path: HTTP repositories over the in-process API dispatch. */
function storefrontOver(source: ReturnType<typeof snapshotCatalog>["catalog"]) {
  const api = createCatalogApiClient(createCatalogApiDispatch(source));
  return createCatalog(
    new HttpProductRepository(api),
    new HttpCategoryRepository(api),
    new StaticUomRepository(),
  );
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
      expect(product?.primaryCategoryAncestors.map((entry) => entry.slug)).toEqual(["women"]);
      expect(category?.ancestors.map((entry) => entry.slug)).toEqual(["women"]);
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
    const { catalog } = snapshotCatalog({ failing: true });
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

describe("storefront catalog over the full-catalog demo snapshot", () => {
  it("lists every product on home and in the sitemap, and only placed ones in categories", async () => {
    const storefront = storefrontOver(snapshotCatalog({ publication: "demo" }).catalog);

    const home = await storefront.getHomePage();
    const category = await storefront.getCategoryPage("women-co-ord-set");
    const urls = await storefront.listIndexableUrls();

    expect(home.products.map((entry) => entry.id)).toEqual(["500", "600"]);
    expect(category?.products.map((entry) => entry.id)).toEqual(["500"]);
    expect(urls.filter((url) => url.path.startsWith("/p/")).map((url) => url.path)).toEqual([
      "/p/group-500-500",
      "/p/group-600-600",
    ]);
  });

  it("serves unplaced product detail with variants, price, stock, and proxied images only", async () => {
    const storefront = storefrontOver(snapshotCatalog({ publication: "demo" }).catalog);

    const page = await storefront.getProductPage("group-600-600");

    expect(page?.product.categoryIds).toEqual([]);
    expect(page?.primaryCategoryAncestors).toEqual([]);
    expect(page?.product.images).toEqual([
      { src: "/api/catalog-images/2/902", alt: "Group 600" },
    ]);
    expect(page?.product.variants).toEqual([
      {
        id: "2",
        sku: "SKU-2",
        attributes: [{ name: "size", value: "S2" }],
        pricing: { price: { amount: 464, currency: "INR" }, compareAtPrice: null },
        inventory: { stockOnHand: null, availableToSell: 2, reserved: null, status: "in_stock" },
        status: "active",
      },
    ]);
  });

  it("never returns provider credentials, URLs, or raw Zoho fields from the API", async () => {
    const { catalog } = snapshotCatalog({ publication: "demo" });
    const dispatch = createCatalogApiDispatch(catalog);

    const bodies = await Promise.all(
      ["/api/products", "/api/products/group-600-600", "/api/categories"].map(async (path) =>
        (await dispatch(new URL(path, "http://catalog.local"))).text(),
      ),
    );

    for (const body of bodies) {
      for (const forbidden of [ACCESS_TOKEN, ORG, "api.example.test", "item_id", "category_name", "Night Wear"]) {
        expect(body).not.toContain(forbidden);
      }
    }
  });

  it("groups the demo view by source category without assigning storefront categories", async () => {
    const { catalog, store } = snapshotCatalog({ publication: "demo" });

    const { products } = await catalog.getHomePage();
    const view = toCatalogDemoViewModel(products, (await store.get()).sourceCategories);

    expect(view.groups.map((group) => [group.label, group.products.map((p) => [p.href, p.placed])])).toEqual([
      ["Co-Ord Set", [["/p/group-500-500", true]]],
      ["Night Wear", [["/p/group-600-600", false]]],
    ]);
    expect(products.find((product) => product.id === "600")?.categoryIds).toEqual([]);
  });
});

describeCatalogApiContract("Zoho full-catalog demo snapshot dispatch", () =>
  createCatalogApiDispatch(snapshotCatalog({ publication: "demo" }).catalog),
);
describeCatalogApiContract("Zoho production snapshot dispatch", () =>
  createCatalogApiDispatch(snapshotCatalog().catalog),
);
