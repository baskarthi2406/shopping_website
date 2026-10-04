import { describe, expect, it, vi } from "vitest";
import type { Product } from "@/domain/catalog";
import {
  createZohoCatalogLoader,
  selectPublishableProducts,
  ZOHO_CATALOG_PAGE_SIZE,
} from "./zoho-catalog-snapshot";

const ORG = "100001";
const TOKEN = "access-token-value";
/** Observed Zoho category ID mapped to `women-co-ord-set` in the committed mapping. */
const WOMEN_CO_ORD_SET = "4273340000000034557";
/** Synthetic ID absent from the mapping. */
const UNMAPPED_CATEGORY = "900000000000009";

type Route = (url: URL, init: RequestInit) => { status: number; body: unknown };

function fakeFetch(route: Route) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const { status, body } = route(new URL(String(input)), init ?? {});
    return new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    });
  });
}

const organizations = {
  code: 0,
  organizations: [{ organization_id: ORG, currency_code: "XTS" }],
};

function item(id: string, groupId: string, categoryId: string | null, status = "active") {
  return {
    item_id: id,
    group_id: groupId,
    group_name: `Group ${groupId}`,
    category_id: categoryId,
    category_name: "Co-Ord Set",
    sku: `SKU-${id}`,
    status,
    rate: 464,
    track_inventory: true,
    stock_on_hand: 2,
    actual_available_stock: 2,
    attribute_name1: "size",
    attribute_option_name1: `S${id}`,
  };
}

function itemsRoute(pages: unknown[][]): Route {
  return (url) => {
    if (url.pathname === "/v1/organizations") {
      return { status: 200, body: organizations };
    }
    const page = Number(url.searchParams.get("page"));
    return {
      status: 200,
      body: {
        code: 0,
        items: pages[page - 1] ?? [],
        page_context: { page, has_more_page: page < pages.length },
      },
    };
  };
}

function loader(route: Route, extra: { maxPages?: number } = {}) {
  const fetchImpl = fakeFetch(route);
  const log = vi.fn();
  const load = createZohoCatalogLoader({
    config: { apiBaseUrl: "https://api.example.test/inventory/v1", timeoutMs: 1000 },
    organizationId: ORG,
    tokens: { getAccessToken: async () => TOKEN },
    fetchImpl,
    log,
    ...extra,
  });
  return { load, fetchImpl, log };
}

describe("createZohoCatalogLoader", () => {
  it("reads every item page with GET only and publishes placed active products", async () => {
    const { load, fetchImpl } = loader(
      itemsRoute([
        [item("1", "500", WOMEN_CO_ORD_SET), item("2", "500", WOMEN_CO_ORD_SET)],
        [item("3", "600", UNMAPPED_CATEGORY), item("4", "700", WOMEN_CO_ORD_SET, "inactive")],
      ]),
    );

    const products = await load();

    expect(products.map((product) => product.id)).toEqual(["500"]);
    expect(products[0].categoryIds).toEqual(["women-co-ord-set"]);
    expect(products[0].variants).toHaveLength(2);
    expect(products[0].variants[0].pricing?.price).toEqual({ amount: 464, currency: "XTS" });

    const calls = fetchImpl.mock.calls.map(([url, init]) => ({
      url: new URL(String(url)),
      method: init?.method,
    }));
    expect(calls.every((call) => call.method === "GET")).toBe(true);
    const itemPages = calls.filter((call) => call.url.pathname === "/inventory/v1/items");
    expect(itemPages.map((call) => call.url.searchParams.get("page"))).toEqual(["1", "2"]);
    expect(
      itemPages.every(
        (call) =>
          call.url.searchParams.get("organization_id") === ORG &&
          call.url.searchParams.get("per_page") === String(ZOHO_CATALOG_PAGE_SIZE),
      ),
    ).toBe(true);
  });

  it("logs a sanitized summary with request count and unmapped Zoho category IDs", async () => {
    const { load, log } = loader(
      itemsRoute([[item("1", "500", WOMEN_CO_ORD_SET), item("3", "600", UNMAPPED_CATEGORY), item("5", "800", null)]]),
    );

    await load();

    expect(log).toHaveBeenCalledTimes(1);
    const line = String(log.mock.calls[0][0]);
    expect(line).toContain("requests=2");
    expect(line).toContain("items=3");
    expect(line).toContain("published=1");
    expect(line).toContain("unplaced=2");
    expect(line).toContain(`unmappedZohoCategories=${UNMAPPED_CATEGORY}x1,nonex1`);
    expect(line).not.toContain(TOKEN);
    expect(line).not.toContain(ORG);
  });

  it("fails instead of publishing part of a catalog larger than the page cap", async () => {
    const { load } = loader(
      itemsRoute([[item("1", "500", WOMEN_CO_ORD_SET)], [item("2", "600", WOMEN_CO_ORD_SET)]]),
      { maxPages: 1 },
    );

    await expect(load()).rejects.toThrow("exceeds 1 pages");
  });

  it("fails on an empty catalog so the previous snapshot is kept", async () => {
    const { load } = loader(itemsRoute([[]]));

    await expect(load()).rejects.toThrow("Zoho catalog is empty");
  });

  it("fails on an unexpected items response shape", async () => {
    const { load } = loader((url) =>
      url.pathname === "/v1/organizations"
        ? { status: 200, body: organizations }
        : { status: 200, body: { code: 0 } },
    );

    await expect(load()).rejects.toThrow("no items list");
  });

  it("fails when the organization currency is unavailable", async () => {
    const { load, fetchImpl } = loader((url) =>
      url.pathname === "/v1/organizations"
        ? { status: 200, body: { code: 0, organizations: [] } }
        : { status: 200, body: { code: 0, items: [] } },
    );

    await expect(load()).rejects.toThrow("currency unavailable");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("propagates sanitized provider errors without the access token", async () => {
    const { load } = loader((url) =>
      url.pathname === "/v1/organizations"
        ? { status: 200, body: organizations }
        : { status: 429, body: { code: 57, message: `Rate limited ${TOKEN}` } },
    );

    const error = await load().catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(Error);
    expect(String((error as Error).message)).not.toContain(TOKEN);
  });
});

function product(overrides: Partial<Product>): Product {
  return {
    id: "1",
    slug: "product-1",
    name: "Product",
    description: "",
    images: [],
    categoryIds: ["women-tops"],
    sku: null,
    uom: null,
    pricing: null,
    inventory: null,
    status: "active",
    variants: [],
    ...overrides,
  };
}

describe("selectPublishableProducts", () => {
  it("publishes only active, singly placed, contract-valid products with unique IDs and slugs", () => {
    const selection = selectPublishableProducts([
      product({ id: "1", slug: "a-1" }),
      product({ id: "2", slug: "b-2", categoryIds: [] }),
      product({ id: "3", slug: "c-3", categoryIds: ["women-tops", "women-sarees"] }),
      product({ id: "4", slug: "d-4", status: "inactive" }),
      product({ id: "5", slug: "Not A Slug" }),
      product({ id: "1", slug: "e-1" }),
      product({ id: "6", slug: "a-1" }),
    ]);

    expect(selection.published.map((entry) => entry.id)).toEqual(["1"]);
    expect(selection.unplaced).toBe(2);
    expect(selection.inactive).toBe(1);
    expect(selection.invalid).toBe(3);
  });
});
