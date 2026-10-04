import { afterEach, describe, expect, it, vi } from "vitest";
import { createZohoClient, ZohoRequestError, type ZohoRequest } from "./zoho-client";
import type { ZohoConfig } from "./zoho-config";

/* Synthetic test values only; no real Zoho request is made. */
const TOKEN = "s6t14-synthetic-token-not-real";
const CONFIG: ZohoConfig = {
  apiBaseUrl: "https://zoho.example.test/api/v1",
  accessToken: TOKEN,
  timeoutMs: 1000,
};

type Call = { url: string; init: RequestInit };

function fakeFetch(respond: (call: Call) => Promise<Response> | Response) {
  const calls: Call[] = [];
  const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const call = { url: String(input), init: init ?? {} };
    calls.push(call);
    return respond(call);
  }) as unknown as typeof fetch;
  return { calls, fetchImpl };
}

async function failure(promise: Promise<unknown>): Promise<ZohoRequestError> {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(ZohoRequestError);
    return error as ZohoRequestError;
  }
  throw new Error("expected the request to fail");
}

function expectNoSecrets(error: ZohoRequestError): void {
  const surfaces = [error.message, error.stack ?? "", JSON.stringify(error), String(error)];
  for (const text of surfaces) {
    expect(text).not.toContain(TOKEN);
    expect(text).not.toMatch(/Zoho-oauthtoken\s+(?!\[redacted\])/);
  }
}

afterEach(() => {
  vi.useRealTimers();
});

describe("server-side Zoho request wrapper", () => {
  it("sends an authorized JSON request and returns the parsed body", async () => {
    const { calls, fetchImpl } = fakeFetch(() =>
      Response.json({ code: 0, items: [{ id: "probe" }] }, { status: 200 }),
    );
    const client = createZohoClient(CONFIG, fetchImpl);

    const result = await client.request({
      method: "POST",
      path: "/probe-endpoint",
      query: { page: "1" },
      headers: { "X-Probe": "yes" },
      body: { probe: true },
    });

    expect(result).toEqual({ status: 200, data: { code: 0, items: [{ id: "probe" }] } });
    expect(calls).toHaveLength(1);
    const [call] = calls;
    const headers = new Headers(call?.init.headers);
    expect(call?.url).toBe("https://zoho.example.test/api/v1/probe-endpoint?page=1");
    expect(call?.init.method).toBe("POST");
    expect(call?.init.body).toBe('{"probe":true}');
    expect(call?.init.signal).toBeInstanceOf(AbortSignal);
    expect(headers.get("authorization")).toBe(`Zoho-oauthtoken ${TOKEN}`);
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("accept")).toBe("application/json");
    expect(headers.get("x-probe")).toBe("yes");
  });

  it("returns null data for an empty successful body", async () => {
    const { fetchImpl } = fakeFetch(() => new Response(null, { status: 204 }));
    await expect(
      createZohoClient(CONFIG, fetchImpl).request({ method: "DELETE", path: "/probe/1" }),
    ).resolves.toEqual({ status: 204, data: null });
  });

  it("normalizes a non-2xx response without exposing the token", async () => {
    const { fetchImpl } = fakeFetch(() =>
      Response.json(
        { code: 57, message: `Invalid token ${TOKEN} (Zoho-oauthtoken ${TOKEN})` },
        { status: 401, headers: { "Retry-After": "30" } },
      ),
    );
    const error = await failure(
      createZohoClient(CONFIG, fetchImpl).request({
        method: "GET",
        path: "/probe-endpoint",
        query: { organization_id: "probe-org" },
      }),
    );

    expect(error).toMatchObject({
      kind: "http",
      method: "GET",
      endpoint: "/probe-endpoint",
      status: 401,
      retryAfter: "30",
      providerCode: "57",
    });
    expect(error.providerMessage).toContain("[redacted]");
    expect(error.message).not.toContain("probe-org");
    expectNoSecrets(error);
  });

  it("does not treat an invalid JSON success body as success", async () => {
    const { fetchImpl } = fakeFetch(() => new Response("<html>ok</html>", { status: 200 }));
    const error = await failure(
      createZohoClient(CONFIG, fetchImpl).request({ method: "GET", path: "/probe" }),
    );
    expect(error).toMatchObject({ kind: "invalid_response", status: 200 });
  });

  it("normalizes a network failure", async () => {
    const { fetchImpl } = fakeFetch(() => {
      throw new TypeError(`fetch failed for Zoho-oauthtoken ${TOKEN}`, {
        cause: { code: "ECONNREFUSED" },
      });
    });
    const error = await failure(
      createZohoClient(CONFIG, fetchImpl).request({ method: "GET", path: "/probe" }),
    );

    expect(error).toMatchObject({ kind: "network", status: null, endpoint: "/probe" });
    expect(error.message).toContain("TypeError ECONNREFUSED");
    expectNoSecrets(error);
  });

  it("aborts a request that exceeds its timeout", async () => {
    vi.useFakeTimers();
    const { calls, fetchImpl } = fakeFetch(
      ({ init }) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener("abort", () =>
            reject(new DOMException("aborted", "AbortError")),
          );
        }),
    );
    const pending = failure(
      createZohoClient(CONFIG, fetchImpl).request({
        method: "GET",
        path: "/slow",
        timeoutMs: 250,
      }),
    );

    await vi.advanceTimersByTimeAsync(249);
    expect(calls[0]?.init.signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);

    const error = await pending;
    expect(error).toMatchObject({ kind: "timeout", endpoint: "/slow" });
    expect(error.message).toContain("no response within 250 ms");
    expect(calls[0]?.init.signal?.aborted).toBe(true);
  });

  it("applies the configured timeout by default", async () => {
    vi.useFakeTimers();
    const { fetchImpl } = fakeFetch(
      ({ init }) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => reject(new Error("aborted")));
        }),
    );
    const pending = failure(
      createZohoClient(CONFIG, fetchImpl).request({ method: "GET", path: "/slow" }),
    );
    await vi.advanceTimersByTimeAsync(CONFIG.timeoutMs);
    await expect(pending).resolves.toMatchObject({ kind: "timeout" });
  });

  it.each<[string, Partial<ZohoRequest>]>([
    ["absolute URL", { path: "https://evil.example.test/steal" }],
    ["protocol-relative URL", { path: "//evil.example.test/steal" }],
    ["path outside the base path", { path: "/../../admin" }],
    ["relative path", { path: "probe" }],
    ["query in path", { path: `/probe?authtoken=${TOKEN}` }],
    ["caller authorization header", { path: "/probe", headers: { authorization: "x" } }],
    ["timeout above the limit", { path: "/probe", timeoutMs: 60_001 }],
    ["zero timeout", { path: "/probe", timeoutMs: 0 }],
  ])("rejects %s before any network call", async (_case, overrides) => {
    const { calls, fetchImpl } = fakeFetch(() => Response.json({}));
    const error = await failure(
      createZohoClient(CONFIG, fetchImpl).request({ method: "GET", path: "/probe", ...overrides }),
    );

    expect(error.kind).toBe("invalid_request");
    expect(calls).toHaveLength(0);
    expectNoSecrets(error);
  });
});
