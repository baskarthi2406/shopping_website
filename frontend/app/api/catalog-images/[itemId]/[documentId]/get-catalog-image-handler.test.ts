import { describe, expect, it, vi } from "vitest";
import { catalogImagePath } from "@/app/api/catalog-images/catalog-image-path";
import { createGetCatalogImageHandler } from "./get-catalog-image-handler";

const JPEG = new Uint8Array([0xff, 0xd8, 0xff]).buffer;

describe("catalogImagePath", () => {
  it("builds a same-origin path from numeric identifiers only", () => {
    expect(catalogImagePath("4273340000000040344", "4273340000000099001")).toBe(
      "/api/catalog-images/4273340000000040344/4273340000000099001",
    );
    expect(() => catalogImagePath("https://evil.example/a.jpg", "1")).toThrow(RangeError);
    expect(() => catalogImagePath("1", "../2")).toThrow(RangeError);
  });
});

describe("GET /api/catalog-images/{itemId}/{documentId}", () => {
  it("returns the image bytes with an image content type and cache headers", async () => {
    const load = vi.fn(async () => ({ contentType: "image/jpeg", body: JPEG }));
    const handler = createGetCatalogImageHandler(load);

    const response = await handler("11", "9001");

    expect(load).toHaveBeenCalledWith("11", "9001");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect(response.headers.get("cache-control")).toBe("public, max-age=86400");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("authorization")).toBeNull();
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array(JPEG));
  });

  it.each([
    ["https%3A%2F%2Fevil.example%2Fa.jpg", "1"],
    ["https://evil.example/a.jpg", "1"],
    ["11", "//evil.example"],
    ["11", "9001?x=1"],
    ["-1", "9001"],
    ["", "9001"],
    ["1".repeat(31), "9001"],
  ])("rejects non-numeric identifiers %s / %s without loading anything", async (itemId, documentId) => {
    const load = vi.fn();
    const handler = createGetCatalogImageHandler(load);

    const response = await handler(itemId, documentId);

    expect(response.status).toBe(404);
    expect(load).not.toHaveBeenCalled();
  });

  it("answers a missing or unreferenced image with a safe 404", async () => {
    const handler = createGetCatalogImageHandler(async () => null);

    const response = await handler("11", "9001");

    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      error: { code: "not_found", message: "Catalog image was not found" },
    });
  });

  it("answers provider failures with a generic 503 that leaks no error details", async () => {
    const onError = vi.fn();
    const failure = new Error("Zoho-oauthtoken secret-token https://www.zohoapis.in/items/11/image");
    const handler = createGetCatalogImageHandler(async () => {
      throw failure;
    }, onError);

    const response = await handler("11", "9001");
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(onError).toHaveBeenCalledWith(failure);
    expect(body).not.toContain("secret-token");
    expect(body).not.toContain("zohoapis");
    expect(JSON.parse(body)).toEqual({
      error: { code: "temporarily_unavailable", message: "Catalog image is temporarily unavailable" },
    });
  });
});
