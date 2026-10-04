import { describe, expect, it } from "vitest";
import {
  REDIRECT_URI,
  ZOHO_SCOPES,
  ZohoDevAuthError,
  buildAuthorizeUrl,
  interpretTokenResponse,
  maskId,
  organizationsUrl,
  parseEnvText,
  readCallback,
  summarizeOrganizations,
  upsertEnvText,
} from "./zoho-oauth-dev";

const STATE = "state-123";

function callback(params: Record<string, string>): URL {
  const url = new URL(REDIRECT_URI);
  url.search = new URLSearchParams(params).toString();
  return url;
}

describe("env file helpers", () => {
  it("parses KEY=VALUE lines and strips matching quotes", () => {
    expect(parseEnvText('A=1\n# comment\nB = "two"\r\nC=\n')).toEqual({ A: "1", B: "two", C: "" });
  });

  it("replaces existing keys in place and appends new ones", () => {
    const text = "ZOHO_CLIENT_ID=id\n# keep\nZOHO_REFRESH_TOKEN=old\n";
    expect(upsertEnvText(text, { ZOHO_REFRESH_TOKEN: "new", ZOHO_ACCESS_TOKEN: "a" })).toBe(
      "ZOHO_CLIENT_ID=id\n# keep\nZOHO_REFRESH_TOKEN=new\nZOHO_ACCESS_TOKEN=a\n",
    );
  });

  it("handles an empty file", () => {
    expect(upsertEnvText("", { A: "1" })).toBe("A=1\n");
  });
});

describe("buildAuthorizeUrl", () => {
  it("targets the India accounts server with offline access and the minimum scopes", () => {
    const url = new URL(buildAuthorizeUrl("client-x", STATE));
    expect(url.origin + url.pathname).toBe("https://accounts.zoho.in/oauth/v2/auth");
    expect(url.searchParams.get("client_id")).toBe("client-x");
    expect(url.searchParams.get("redirect_uri")).toBe(REDIRECT_URI);
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("access_type")).toBe("offline");
    expect(url.searchParams.get("state")).toBe(STATE);
    expect(url.searchParams.get("scope")).toBe(ZOHO_SCOPES.join(","));
    expect(url.searchParams.has("client_secret")).toBe(false);
  });

  it("requests no full-access, invoice, or delete scopes", () => {
    for (const scope of ZOHO_SCOPES) {
      expect(scope).not.toMatch(/FullAccess|invoices|DELETE/i);
    }
  });
});

describe("readCallback", () => {
  it("returns the code when state matches", () => {
    expect(readCallback(callback({ state: STATE, code: "c1" }), STATE)).toEqual({
      kind: "code",
      code: "c1",
    });
  });

  it("rejects a state mismatch even when a code is present", () => {
    expect(readCallback(callback({ state: "other", code: "c1" }), STATE).kind).toBe("error");
  });

  it("reports a denied consent", () => {
    expect(readCallback(callback({ state: STATE, error: "access_denied" }), STATE)).toEqual({
      kind: "error",
      reason: "authorization denied or failed (access_denied)",
    });
  });

  it("rejects a non-India accounts server", () => {
    const url = callback({ state: STATE, code: "c1", "accounts-server": "https://accounts.zoho.com" });
    expect(readCallback(url, STATE).kind).toBe("error");
  });

  it("rejects a missing code", () => {
    expect(readCallback(callback({ state: STATE }), STATE).kind).toBe("error");
  });
});

describe("interpretTokenResponse", () => {
  it("extracts access and refresh tokens", () => {
    expect(
      interpretTokenResponse(200, { access_token: "a", refresh_token: "r", expires_in: 3600 }),
    ).toEqual({ accessToken: "a", refreshToken: "r", expiresInSeconds: 3600 });
  });

  it("allows a refresh response without a refresh token", () => {
    expect(interpretTokenResponse(200, { access_token: "a" }).refreshToken).toBeNull();
  });

  it("surfaces only Zoho's error code", () => {
    expect(() => interpretTokenResponse(200, { error: "invalid_code" })).toThrow(
      'token endpoint returned HTTP 200, error "invalid_code"',
    );
  });

  it("rejects non-JSON and token-less responses without echoing the body", () => {
    expect(() => interpretTokenResponse(500, null)).toThrow(ZohoDevAuthError);
    try {
      interpretTokenResponse(400, { refresh_token: "secret-refresh" });
      expect.unreachable();
    } catch (error) {
      expect((error as Error).message).not.toContain("secret-refresh");
    }
  });
});

describe("organizations", () => {
  it("derives the organizations endpoint from the API base origin", () => {
    expect(organizationsUrl("https://api.zakya.in/inventory/v1")).toBe(
      "https://api.zakya.in/v1/organizations",
    );
    expect(() => organizationsUrl("http://api.zakya.in/inventory/v1")).toThrow(ZohoDevAuthError);
  });

  it("summarizes organizations without other fields", () => {
    const result = summarizeOrganizations({
      code: 0,
      message: "success",
      organizations: [
        { organization_id: "60012345", name: "Shop", currency_code: "INR", is_default_org: true, email: "x@y" },
        { organization_id: 7, name: 3 },
      ],
    });
    expect(result).toEqual({
      zohoCode: 0,
      zohoMessage: "success",
      organizations: [
        { name: "Shop", currencyCode: "INR", isDefault: true, organizationId: "60012345" },
        { name: null, currencyCode: null, isDefault: null, organizationId: "7" },
      ],
    });
  });

  it("tolerates non-object bodies", () => {
    expect(summarizeOrganizations("nope").organizations).toEqual([]);
  });

  it("masks all but the last four characters", () => {
    expect(maskId("60012345")).toBe("****2345");
    expect(maskId("123")).toBe("****");
  });
});
