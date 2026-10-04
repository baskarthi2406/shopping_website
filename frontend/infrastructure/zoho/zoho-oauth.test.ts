import { describe, expect, it, vi } from "vitest";
import { ZohoConfigError } from "./zoho-config";
import { createZohoTokenProvider, readZohoOAuthSettings, ZohoAuthError } from "./zoho-oauth";

const SETTINGS = {
  accountsUrl: "https://accounts.example.test",
  clientId: "client-id-value",
  clientSecret: "client-secret-value",
  refreshToken: "refresh-token-value",
};

const ENV = {
  ZOHO_ACCOUNTS_URL: "https://accounts.example.test",
  ZOHO_CLIENT_ID: "client-id-value",
  ZOHO_CLIENT_SECRET: "client-secret-value",
  ZOHO_REFRESH_TOKEN: "refresh-token-value",
};

function tokenResponse(body: unknown, status = 200) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

describe("readZohoOAuthSettings", () => {
  it("reads all settings", () => {
    expect(readZohoOAuthSettings(ENV)).toEqual(SETTINGS);
  });

  it("names a missing variable without exposing values", () => {
    expect(() => readZohoOAuthSettings({ ...ENV, ZOHO_REFRESH_TOKEN: "" })).toThrow(
      "Missing server-only setting ZOHO_REFRESH_TOKEN",
    );
  });

  it("requires an https origin for the accounts server", () => {
    for (const value of ["http://accounts.example.test", "https://accounts.example.test/oauth"]) {
      expect(() => readZohoOAuthSettings({ ...ENV, ZOHO_ACCOUNTS_URL: value })).toThrow(ZohoConfigError);
    }
  });
});

describe("createZohoTokenProvider", () => {
  it("refreshes once and caches until shortly before expiry", async () => {
    let now = 0;
    const fetchImpl = tokenResponse({ access_token: "access-1", expires_in: 3600 });
    const provider = createZohoTokenProvider(SETTINGS, fetchImpl, () => now);

    const [a, b] = await Promise.all([provider.getAccessToken(), provider.getAccessToken()]);
    expect([a, b]).toEqual(["access-1", "access-1"]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    now = 3_540_000 - 1;
    await provider.getAccessToken();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    now = 3_540_000;
    await provider.getAccessToken();
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("posts the refresh grant to the accounts token endpoint", async () => {
    const fetchImpl = tokenResponse({ access_token: "access-1", expires_in: 3600 });
    await createZohoTokenProvider(SETTINGS, fetchImpl).getAccessToken();
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [URL, RequestInit];
    expect(url.toString()).toBe("https://accounts.example.test/oauth/v2/token");
    const params = new URLSearchParams(String(init.body));
    expect(params.get("grant_type")).toBe("refresh_token");
    expect(params.get("refresh_token")).toBe("refresh-token-value");
  });

  it("reports Zoho's error code without token or secret material", async () => {
    const provider = createZohoTokenProvider(SETTINGS, tokenResponse({ error: "invalid_code" }));
    const error = await provider.getAccessToken().catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ZohoAuthError);
    expect((error as Error).message).toBe("Zoho token refresh failed: invalid_code");
    expect((error as Error).message).not.toMatch(/secret|refresh-token-value|client-id-value/);
  });

  it("fails on a response without an access token and retries next time", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response("{}", { status: 500 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "access-2" })));
    const provider = createZohoTokenProvider(SETTINGS, fetchImpl);
    await expect(provider.getAccessToken()).rejects.toThrow("HTTP 500");
    await expect(provider.getAccessToken()).resolves.toBe("access-2");
  });

  it("maps network failures to a generic error", async () => {
    const provider = createZohoTokenProvider(SETTINGS, vi.fn().mockRejectedValue(new TypeError("boom")));
    await expect(provider.getAccessToken()).rejects.toThrow("network error");
  });
});
