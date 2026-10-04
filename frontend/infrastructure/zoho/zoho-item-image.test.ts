import { describe, expect, it, vi } from "vitest";
import { createZohoItemImageFetcher, ZohoItemImageError } from "./zoho-item-image";

const TOKEN = "access-token-value";
const ORG = "100001";

function fetcher(response: () => Response, maxBytes?: number) {
  const fetchImpl = vi.fn<typeof fetch>(async () => response());
  const fetchImage = createZohoItemImageFetcher({
    config: { apiBaseUrl: "https://api.example.test/pos/v1", timeoutMs: 1000 },
    organizationId: ORG,
    tokens: { getAccessToken: async () => TOKEN },
    fetchImpl,
    maxBytes,
  });
  return { fetchImage, fetchImpl };
}

const jpeg = () =>
  new Response(new Uint8Array([1, 2, 3]), { status: 200, headers: { "content-type": "image/jpeg" } });

describe("createZohoItemImageFetcher", () => {
  it("GETs the item image on the configured origin with server-side authorization", async () => {
    const { fetchImage, fetchImpl } = fetcher(jpeg);

    const image = await fetchImage("4273340000000040344");

    expect(image?.contentType).toBe("image/jpeg");
    expect(image?.body.byteLength).toBe(3);
    const [url, init] = fetchImpl.mock.calls[0];
    const target = new URL(String(url));
    expect(target.origin).toBe("https://api.example.test");
    expect(target.pathname).toBe("/pos/v1/items/4273340000000040344/image");
    expect(target.searchParams.get("organization_id")).toBe(ORG);
    expect(init?.method).toBe("GET");
    expect(new Headers(init?.headers).get("authorization")).toBe(`Zoho-oauthtoken ${TOKEN}`);
    expect(new Headers(init?.headers).get("accept")).toBe("*/*");
  });

  it("rejects non-numeric item IDs without a request", async () => {
    const { fetchImage, fetchImpl } = fetcher(jpeg);

    await expect(fetchImage("../../oauth")).rejects.toBeInstanceOf(ZohoItemImageError);
    await expect(fetchImage("https://evil.example/a.jpg")).rejects.toBeInstanceOf(ZohoItemImageError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns null when Zoho has no image", async () => {
    const { fetchImage } = fetcher(() => Response.json({ code: 1 }, { status: 404 }));

    expect(await fetchImage("11")).toBeNull();
  });

  it.each([
    ["a non-image response", () => new Response("<html>", { headers: { "content-type": "text/html" } })],
    ["an SVG (scriptable) response", () => new Response("<svg/>", { headers: { "content-type": "image/svg+xml" } })],
    ["an HTTP error", () => Response.json({ message: `bad ${TOKEN}` }, { status: 401 })],
  ])("fails on %s without exposing credentials", async (_label, response) => {
    const { fetchImage } = fetcher(response);

    const error = await fetchImage("11").catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ZohoItemImageError);
    const message = (error as Error).message;
    expect(message).not.toContain(TOKEN);
    expect(message).not.toContain(ORG);
    expect(message).not.toContain("api.example.test");
  });

  it("refuses images over the size cap", async () => {
    const { fetchImage } = fetcher(jpeg, 2);

    await expect(fetchImage("11")).rejects.toThrow("too large");
  });
});
