import { afterEach, describe, expect, it, vi } from "vitest";
import { CatalogSnapshotUnavailableError } from "@/infrastructure/catalog/catalog-snapshot";
import {
  createZohoCatalogRuntime,
  DEFAULT_ZOHO_CATALOG_REFRESH_MINUTES,
  isZohoCatalogSource,
  publicationFor,
  readCatalogProductSource,
  readZohoCatalogRefreshMinutes,
} from "./zoho-catalog";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("readCatalogProductSource", () => {
  it("defaults to the static catalog", () => {
    expect(readCatalogProductSource({})).toBe("static");
    expect(readCatalogProductSource({ CATALOG_PRODUCT_SOURCE: " " })).toBe("static");
  });

  it("accepts the Zoho snapshot and full-catalog demo sources", () => {
    expect(readCatalogProductSource({ CATALOG_PRODUCT_SOURCE: "zoho-snapshot" })).toBe(
      "zoho-snapshot",
    );
    expect(readCatalogProductSource({ CATALOG_PRODUCT_SOURCE: "zoho-demo" })).toBe("zoho-demo");
  });

  it("maps sources to the publication rule", () => {
    expect(isZohoCatalogSource("static")).toBe(false);
    expect(isZohoCatalogSource("zoho-snapshot")).toBe(true);
    expect(isZohoCatalogSource("zoho-demo")).toBe(true);
    expect(publicationFor("zoho-snapshot")).toBe("production");
    expect(publicationFor("zoho-demo")).toBe("demo");
  });

  it("rejects unknown sources without echoing the value", () => {
    expect(() => readCatalogProductSource({ CATALOG_PRODUCT_SOURCE: "zoho-live-xyz" })).toThrow(
      /CATALOG_PRODUCT_SOURCE/,
    );
    expect(() => readCatalogProductSource({ CATALOG_PRODUCT_SOURCE: "zoho-live-xyz" })).not.toThrow(
      /xyz/,
    );
  });
});

describe("readZohoCatalogRefreshMinutes", () => {
  it("defaults to six hours", () => {
    expect(readZohoCatalogRefreshMinutes({})).toBe(DEFAULT_ZOHO_CATALOG_REFRESH_MINUTES);
    expect(DEFAULT_ZOHO_CATALOG_REFRESH_MINUTES).toBe(360);
  });

  it("accepts values within the bounds", () => {
    expect(readZohoCatalogRefreshMinutes({ ZOHO_CATALOG_REFRESH_MINUTES: "15" })).toBe(15);
    expect(readZohoCatalogRefreshMinutes({ ZOHO_CATALOG_REFRESH_MINUTES: "720" })).toBe(720);
  });

  it.each(["14", "721", "1.5", "-30", "abc"])("rejects %s", (value) => {
    expect(() => readZohoCatalogRefreshMinutes({ ZOHO_CATALOG_REFRESH_MINUTES: value })).toThrow(
      /ZOHO_CATALOG_REFRESH_MINUTES/,
    );
  });
});

const ORG = "100001";
const CLIENT_SECRET = "client-secret-value";
const REFRESH_TOKEN = "refresh-token-value";
const ACCESS_TOKEN = "access-token-value";

const ENV = {
  CATALOG_PRODUCT_SOURCE: "zoho-demo",
  ZOHO_API_BASE_URL: "https://api.example.test/inventory/v1",
  ZOHO_ACCOUNTS_URL: "https://accounts.example.test",
  ZOHO_CLIENT_ID: "client-id-value",
  ZOHO_CLIENT_SECRET: CLIENT_SECRET,
  ZOHO_REFRESH_TOKEN: REFRESH_TOKEN,
  ZOHO_ORGANIZATION_ID: ORG,
};

function zohoFetch(image: { status: number; type: string } = { status: 200, type: "image/jpeg" }) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    if (url.pathname === "/oauth/v2/token") {
      return Response.json({ access_token: ACCESS_TOKEN, expires_in: 3600 });
    }
    if (url.pathname === "/v1/organizations") {
      return Response.json({ code: 0, organizations: [{ organization_id: ORG, currency_code: "INR" }] });
    }
    if (url.pathname === "/inventory/v1/items") {
      return Response.json({
        code: 0,
        items: [
          {
            item_id: "11",
            group_id: "500",
            group_name: "Girl Coord Set",
            category_id: "900000000000009",
            category_name: "Co-Ord Set",
            status: "active",
            rate: 464,
            track_inventory: true,
            actual_available_stock: 2,
            image_document_id: "9001",
          },
        ],
        page_context: { page: 1, has_more_page: false },
      });
    }
    if (url.pathname === "/inventory/v1/items/11/image") {
      expect(url.searchParams.get("organization_id")).toBe(ORG);
      expect(new Headers(init?.headers).get("authorization")).toBe(`Zoho-oauthtoken ${ACCESS_TOKEN}`);
      return new Response(new Uint8Array([1, 2, 3]), {
        status: image.status,
        headers: { "content-type": image.type },
      });
    }
    return new Response("{}", { status: 404 });
  });
}

describe("createZohoCatalogRuntime", () => {
  it("reports missing Zoho settings as unavailable and logs only the setting name", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const runtime = createZohoCatalogRuntime({
      ZOHO_API_BASE_URL: "https://api.example.test/inventory/v1",
      ZOHO_CLIENT_SECRET: CLIENT_SECRET,
    });

    await expect(runtime.snapshot.get()).rejects.toBeInstanceOf(CatalogSnapshotUnavailableError);
    expect(errors).toHaveBeenCalledTimes(1);
    const line = String(errors.mock.calls[0][0]);
    expect(line).toContain("ZOHO_ORGANIZATION_ID");
    expect(line).not.toContain(CLIENT_SECRET);
  });

  it("serves images referenced by the snapshot through the server-side Zoho request", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    const fetchImpl = zohoFetch();
    const runtime = createZohoCatalogRuntime(ENV, { fetchImpl });

    const snapshot = await runtime.snapshot.get();
    const image = await runtime.loadImage("11", "9001");

    expect(snapshot.products[0].images).toEqual([
      { src: "/api/catalog-images/11/9001", alt: "Girl Coord Set" },
    ]);
    expect(snapshot.products[0].categoryIds).toEqual([]);
    expect(image?.contentType).toBe("image/jpeg");
    expect([...new Uint8Array(image!.body)]).toEqual([1, 2, 3]);
    const tokenCalls = fetchImpl.mock.calls.filter(([url]) => String(url).includes("/oauth/"));
    expect(tokenCalls).toHaveLength(1);
  });

  it("refuses image pairs the snapshot does not reference without calling Zoho for them", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    const fetchImpl = zohoFetch();
    const runtime = createZohoCatalogRuntime(ENV, { fetchImpl });

    expect(await runtime.loadImage("11", "9999")).toBeNull();
    expect(await runtime.loadImage("12", "9001")).toBeNull();
    expect(fetchImpl.mock.calls.some(([url]) => String(url).includes("/image"))).toBe(false);
  });

  it("treats a missing Zoho image as no image", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    const runtime = createZohoCatalogRuntime(ENV, {
      fetchImpl: zohoFetch({ status: 404, type: "application/json" }),
    });

    expect(await runtime.loadImage("11", "9001")).toBeNull();
  });

  it("rejects non-image responses with an error that carries no credentials", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    const runtime = createZohoCatalogRuntime(ENV, {
      fetchImpl: zohoFetch({ status: 200, type: "text/html" }),
    });

    const error = await runtime.loadImage("11", "9001").catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(Error);
    const message = String((error as Error).message);
    for (const secret of [ACCESS_TOKEN, REFRESH_TOKEN, CLIENT_SECRET, ORG, "api.example.test"]) {
      expect(message).not.toContain(secret);
    }
  });

  it("logs the refresh summary without credentials or the organization ID", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const runtime = createZohoCatalogRuntime(ENV, { fetchImpl: zohoFetch() });

    await runtime.snapshot.get();

    const logged = info.mock.calls.map((call) => String(call[0])).join("\n");
    expect(logged).toContain("publication=demo");
    for (const secret of [ACCESS_TOKEN, REFRESH_TOKEN, CLIENT_SECRET, ORG]) {
      expect(logged).not.toContain(secret);
    }
  });
});
