import "server-only";
import { readServerEnv, type ServerEnv } from "@/config/server-env";

/**
 * Server-only Zoho connection settings. Values come from host environment
 * variables (never `NEXT_PUBLIC_*`). How the access token is obtained and
 * refreshed is not yet verified (S6-T15).
 */
export type ZohoConfig = {
  readonly apiBaseUrl: string;
  readonly accessToken: string;
  readonly timeoutMs: number;
};

export const ZOHO_ENV = {
  apiBaseUrl: "ZOHO_API_BASE_URL",
  accessToken: "ZOHO_ACCESS_TOKEN",
  timeoutMs: "ZOHO_REQUEST_TIMEOUT_MS",
} as const;

export const DEFAULT_ZOHO_TIMEOUT_MS = 10_000;
export const MAX_ZOHO_TIMEOUT_MS = 60_000;

export class ZohoConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ZohoConfigError";
  }
}

export function isValidZohoTimeout(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0 && value <= MAX_ZOHO_TIMEOUT_MS;
}

function requireSetting(name: string, env: ServerEnv): string {
  const value = readServerEnv(name, env);
  if (value === null) {
    throw new ZohoConfigError(`Missing server-only setting ${name}`);
  }
  return value.trim();
}

function parseBaseUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ZohoConfigError(`${ZOHO_ENV.apiBaseUrl} must be an absolute URL`);
  }
  if (url.protocol !== "https:" || url.username !== "" || url.password !== "") {
    throw new ZohoConfigError(
      `${ZOHO_ENV.apiBaseUrl} must use https and contain no credentials`,
    );
  }
  if (url.search !== "" || url.hash !== "") {
    throw new ZohoConfigError(
      `${ZOHO_ENV.apiBaseUrl} must not contain a query string or fragment`,
    );
  }
  return url.toString().replace(/\/+$/, "");
}

function parseTimeout(value: string | null): number {
  if (value === null) {
    return DEFAULT_ZOHO_TIMEOUT_MS;
  }
  const timeout = /^\d+$/.test(value.trim()) ? Number(value.trim()) : Number.NaN;
  if (!isValidZohoTimeout(timeout)) {
    throw new ZohoConfigError(
      `${ZOHO_ENV.timeoutMs} must be an integer from 1 to ${MAX_ZOHO_TIMEOUT_MS}`,
    );
  }
  return timeout;
}

/** Reads and validates Zoho settings; errors name the variable, never its value. */
export function readZohoConfig(env: ServerEnv = process.env): ZohoConfig {
  return {
    apiBaseUrl: parseBaseUrl(requireSetting(ZOHO_ENV.apiBaseUrl, env)),
    accessToken: requireSetting(ZOHO_ENV.accessToken, env),
    timeoutMs: parseTimeout(readServerEnv(ZOHO_ENV.timeoutMs, env)),
  };
}
