import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_ZOHO_TIMEOUT_MS,
  readZohoConfig,
  ZohoConfigError,
} from "./zoho-config";

/* Synthetic test values only; not real Zoho endpoints or credentials. */
const TOKEN = "s6t14-synthetic-token-not-real";
const ENV = {
  ZOHO_API_BASE_URL: "https://zoho.example.test/api/v1/",
  ZOHO_ACCESS_TOKEN: TOKEN,
};

function failure(env: Record<string, string | undefined>): ZohoConfigError {
  try {
    readZohoConfig(env);
  } catch (error) {
    return error as ZohoConfigError;
  }
  throw new Error("expected a configuration error");
}

describe("Zoho server-only configuration", () => {
  it("loads settings from the supplied server environment", () => {
    expect(readZohoConfig(ENV)).toEqual({
      apiBaseUrl: "https://zoho.example.test/api/v1",
      accessToken: TOKEN,
      timeoutMs: DEFAULT_ZOHO_TIMEOUT_MS,
    });
    expect(readZohoConfig({ ...ENV, ZOHO_REQUEST_TIMEOUT_MS: "2500" }).timeoutMs).toBe(2500);
  });

  it.each([
    ["ZOHO_API_BASE_URL", { ZOHO_ACCESS_TOKEN: TOKEN }],
    ["ZOHO_ACCESS_TOKEN", { ZOHO_API_BASE_URL: ENV.ZOHO_API_BASE_URL }],
    ["ZOHO_ACCESS_TOKEN", { ...ENV, ZOHO_ACCESS_TOKEN: "   " }],
  ])("fails with the missing variable name (%s)", (name, env) => {
    const error = failure(env);
    expect(error).toBeInstanceOf(ZohoConfigError);
    expect(error.message).toBe(`Missing server-only setting ${name}`);
  });

  it("never reads NEXT_PUBLIC_ variants", () => {
    const error = failure({
      NEXT_PUBLIC_ZOHO_API_BASE_URL: ENV.ZOHO_API_BASE_URL,
      NEXT_PUBLIC_ZOHO_ACCESS_TOKEN: TOKEN,
    });
    expect(error.message).toContain("ZOHO_API_BASE_URL");
  });

  it.each([
    "not a url",
    "http://zoho.example.test/api",
    `https://user:${TOKEN}@zoho.example.test/api`,
    `https://zoho.example.test/api?authtoken=${TOKEN}`,
  ])("rejects unsafe base URL %j without echoing it", (url) => {
    const error = failure({ ...ENV, ZOHO_API_BASE_URL: url });
    expect(error.message).toMatch(/^ZOHO_API_BASE_URL must/);
    expect(error.message).not.toContain(TOKEN);
    expect(error.message).not.toContain("zoho.example.test");
  });

  it.each(["0", "-1", "1.5", "abc", "60001"])("rejects timeout %j", (timeout) => {
    expect(failure({ ...ENV, ZOHO_REQUEST_TIMEOUT_MS: timeout }).message).toMatch(
      /^ZOHO_REQUEST_TIMEOUT_MS must be an integer/,
    );
  });

  it("is a server-only module", () => {
    for (const file of ["./zoho-config.ts", "./zoho-client.ts"]) {
      const source = readFileSync(new URL(file, import.meta.url), "utf8");
      expect(source.startsWith('import "server-only";'), file).toBe(true);
    }
  });
});
