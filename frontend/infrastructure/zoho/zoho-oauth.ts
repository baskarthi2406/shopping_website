import "server-only";
import { readServerEnv, type ServerEnv } from "@/config/server-env";
import { ZohoConfigError } from "./zoho-config";

/** Server-only OAuth refresh settings. Never exposed to the browser. */
export type ZohoOAuthSettings = {
  readonly accountsUrl: string;
  readonly clientId: string;
  readonly clientSecret: string;
  readonly refreshToken: string;
};

export const ZOHO_OAUTH_ENV = {
  accountsUrl: "ZOHO_ACCOUNTS_URL",
  clientId: "ZOHO_CLIENT_ID",
  clientSecret: "ZOHO_CLIENT_SECRET",
  refreshToken: "ZOHO_REFRESH_TOKEN",
} as const;

/** Refresh this long before Zoho's stated expiry. */
const EXPIRY_MARGIN_MS = 60_000;
const DEFAULT_LIFETIME_S = 3600;
const TOKEN_TIMEOUT_MS = 10_000;

export class ZohoAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ZohoAuthError";
  }
}

function required(name: string, env: ServerEnv): string {
  const value = readServerEnv(name, env);
  if (value === null) {
    throw new ZohoConfigError(`Missing server-only setting ${name}`);
  }
  return value.trim();
}

export function readZohoOAuthSettings(env: ServerEnv = process.env): ZohoOAuthSettings {
  const accountsUrl = required(ZOHO_OAUTH_ENV.accountsUrl, env);
  let url: URL;
  try {
    url = new URL(accountsUrl);
  } catch {
    throw new ZohoConfigError(`${ZOHO_OAUTH_ENV.accountsUrl} must be an absolute URL`);
  }
  if (url.protocol !== "https:" || url.pathname !== "/" || url.search !== "" || url.username !== "") {
    throw new ZohoConfigError(`${ZOHO_OAUTH_ENV.accountsUrl} must be an https origin`);
  }
  return {
    accountsUrl: url.origin,
    clientId: required(ZOHO_OAUTH_ENV.clientId, env),
    clientSecret: required(ZOHO_OAUTH_ENV.clientSecret, env),
    refreshToken: required(ZOHO_OAUTH_ENV.refreshToken, env),
  };
}

export type ZohoTokenProvider = {
  getAccessToken(): Promise<string>;
};

/**
 * Exchanges the refresh token for short-lived access tokens, caching each
 * until shortly before expiry. Concurrent callers share one refresh. Errors
 * carry Zoho's error code only, never token material.
 */
export function createZohoTokenProvider(
  settings: ZohoOAuthSettings,
  fetchImpl: typeof fetch = fetch,
  now: () => number = Date.now,
): ZohoTokenProvider {
  let cached: { token: string; expiresAt: number } | null = null;
  let pending: Promise<string> | null = null;

  async function refresh(): Promise<string> {
    let response: Response;
    try {
      response = await fetchImpl(new URL("/oauth/v2/token", settings.accountsUrl), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: settings.refreshToken,
          client_id: settings.clientId,
          client_secret: settings.clientSecret,
        }).toString(),
        cache: "no-store",
        signal: AbortSignal.timeout(TOKEN_TIMEOUT_MS),
      });
    } catch {
      throw new ZohoAuthError("Zoho token refresh failed: network error");
    }
    const body: unknown = await response.json().catch(() => null);
    const record = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
    if (typeof record.error === "string") {
      const code = record.error.replace(/[^\w.-]/g, "").slice(0, 60);
      throw new ZohoAuthError(`Zoho token refresh failed: ${code}`);
    }
    if (!response.ok || typeof record.access_token !== "string" || record.access_token === "") {
      throw new ZohoAuthError(`Zoho token refresh failed: HTTP ${response.status}`);
    }
    const lifetime =
      typeof record.expires_in === "number" && record.expires_in > 0
        ? record.expires_in
        : DEFAULT_LIFETIME_S;
    cached = { token: record.access_token, expiresAt: now() + lifetime * 1000 - EXPIRY_MARGIN_MS };
    return record.access_token;
  }

  return {
    async getAccessToken() {
      if (cached !== null && now() < cached.expiresAt) {
        return cached.token;
      }
      pending ??= refresh().finally(() => {
        pending = null;
      });
      return pending;
    },
  };
}
