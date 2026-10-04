import { afterEach, describe, expect, it, vi } from "vitest";
import { CatalogSnapshotUnavailableError } from "@/infrastructure/catalog/catalog-snapshot";
import {
  createZohoCatalogSnapshotStore,
  DEFAULT_ZOHO_CATALOG_REFRESH_MINUTES,
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

  it("accepts the Zoho snapshot source", () => {
    expect(readCatalogProductSource({ CATALOG_PRODUCT_SOURCE: "zoho-snapshot" })).toBe(
      "zoho-snapshot",
    );
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

describe("createZohoCatalogSnapshotStore", () => {
  it("reports missing Zoho settings as unavailable and logs only the setting name", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const store = createZohoCatalogSnapshotStore({
      ZOHO_API_BASE_URL: "https://api.example.test/inventory/v1",
      ZOHO_CLIENT_SECRET: "client-secret-value",
    });

    await expect(store.getProducts()).rejects.toBeInstanceOf(CatalogSnapshotUnavailableError);
    expect(errors).toHaveBeenCalledTimes(1);
    const line = String(errors.mock.calls[0][0]);
    expect(line).toContain("ZOHO_ORGANIZATION_ID");
    expect(line).not.toContain("client-secret-value");
  });
});
