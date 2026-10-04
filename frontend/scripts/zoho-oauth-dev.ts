/**
 * Local-development Zoho POS OAuth helper for the S6-T15 feasibility spike.
 * Not part of the Next.js app. Run from `frontend/` with Node 24+:
 *
 *   node scripts/zoho-oauth-dev.ts authorize   # consent + store refresh token
 *   node scripts/zoho-oauth-dev.ts probe       # one read: list organizations
 *
 * Reads and writes `.env.local` (gitignored). Never prints tokens, the client
 * secret, or the client ID.
 */
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ZOHO_ACCOUNTS_URL = "https://accounts.zoho.in";
export const REDIRECT_URI = "http://localhost:3000/api/zoho/oauth/callback";
export const ZOHO_SCOPES = [
  "ZohoPOSAPI.items.READ",
  "ZohoPOSAPI.settings.READ",
  "ZohoPOSAPI.contacts.READ",
  "ZohoPOSAPI.contacts.CREATE",
  "ZohoPOSAPI.salesorders.READ",
  "ZohoPOSAPI.salesorders.CREATE",
  "ZohoPOSAPI.salesorders.UPDATE",
  // Required by GET /v1/organizations (organization ID discovery).
  "ZohoPOS.organizations.READ",
] as const;

const CALLBACK_TIMEOUT_MS = 5 * 60_000;
const REQUEST_TIMEOUT_MS = 15_000;

export class ZohoDevAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ZohoDevAuthError";
  }
}

export function parseEnvText(text: string): Record<string, string> {
  const values: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (match) {
      values[match[1]] = match[2].trim().replace(/^(["'])(.*)\1$/, "$2");
    }
  }
  return values;
}

/** Replaces existing `KEY=` lines or appends them; other lines are kept. */
export function upsertEnvText(text: string, updates: Record<string, string>): string {
  const pending = new Map(Object.entries(updates));
  const lines = text === "" ? [] : text.replace(/\r?\n$/, "").split(/\r?\n/);
  const result = lines.map((line) => {
    const key = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line)?.[1];
    if (key !== undefined && pending.has(key)) {
      const value = pending.get(key);
      pending.delete(key);
      return `${key}=${value}`;
    }
    return line;
  });
  for (const [key, value] of pending) {
    result.push(`${key}=${value}`);
  }
  return `${result.join("\n")}\n`;
}

export function buildAuthorizeUrl(clientId: string, state: string): string {
  const url = new URL("/oauth/v2/auth", ZOHO_ACCOUNTS_URL);
  url.search = new URLSearchParams({
    scope: ZOHO_SCOPES.join(","),
    client_id: clientId,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    access_type: "offline",
    prompt: "consent",
    state,
  }).toString();
  return url.toString();
}

export type CallbackResult =
  | { readonly kind: "code"; readonly code: string }
  | { readonly kind: "error"; readonly reason: string };

export function readCallback(url: URL, expectedState: string): CallbackResult {
  const params = url.searchParams;
  if (params.get("state") !== expectedState) {
    return { kind: "error", reason: "state mismatch" };
  }
  const error = params.get("error");
  if (error !== null) {
    return { kind: "error", reason: `authorization denied or failed (${sanitize(error)})` };
  }
  const accountsServer = params.get("accounts-server");
  if (accountsServer !== null && new URL(accountsServer).origin !== ZOHO_ACCOUNTS_URL) {
    return { kind: "error", reason: "account is not on the India data center" };
  }
  const code = params.get("code");
  if (code === null || code.trim() === "") {
    return { kind: "error", reason: "callback has no authorization code" };
  }
  return { kind: "code", code };
}

export type TokenResult = {
  readonly accessToken: string;
  readonly refreshToken: string | null;
  readonly expiresInSeconds: number | null;
};

function sanitize(value: unknown): string {
  return String(value).replace(/[^\w.\- ]/g, "").slice(0, 80);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Interprets a Zoho token response; errors carry only Zoho's error code. */
export function interpretTokenResponse(status: number, body: unknown): TokenResult {
  if (!isRecord(body)) {
    throw new ZohoDevAuthError(`token endpoint returned HTTP ${status} without JSON`);
  }
  if (typeof body.error === "string") {
    throw new ZohoDevAuthError(
      `token endpoint returned HTTP ${status}, error "${sanitize(body.error)}"`,
    );
  }
  if (status < 200 || status > 299 || typeof body.access_token !== "string") {
    throw new ZohoDevAuthError(`token endpoint returned HTTP ${status} without an access token`);
  }
  return {
    accessToken: body.access_token,
    refreshToken: typeof body.refresh_token === "string" ? body.refresh_token : null,
    expiresInSeconds: typeof body.expires_in === "number" ? body.expires_in : null,
  };
}

export function organizationsUrl(apiBaseUrl: string): string {
  const base = new URL(apiBaseUrl);
  if (base.protocol !== "https:") {
    throw new ZohoDevAuthError("ZOHO_API_BASE_URL must use https");
  }
  return new URL("/v1/organizations", base.origin).toString();
}

export type OrganizationSummary = {
  readonly name: string | null;
  readonly currencyCode: string | null;
  readonly isDefault: boolean | null;
  readonly organizationId: string | null;
};

export type OrganizationsResult = {
  readonly zohoCode: number | null;
  readonly zohoMessage: string | null;
  readonly organizations: readonly OrganizationSummary[];
};

export function summarizeOrganizations(body: unknown): OrganizationsResult {
  if (!isRecord(body)) {
    return { zohoCode: null, zohoMessage: null, organizations: [] };
  }
  const list = Array.isArray(body.organizations) ? body.organizations : [];
  return {
    zohoCode: typeof body.code === "number" ? body.code : null,
    zohoMessage: typeof body.message === "string" ? sanitize(body.message) : null,
    organizations: list.filter(isRecord).map((org) => ({
      name: typeof org.name === "string" ? org.name : null,
      currencyCode: typeof org.currency_code === "string" ? org.currency_code : null,
      isDefault: typeof org.is_default_org === "boolean" ? org.is_default_org : null,
      organizationId:
        typeof org.organization_id === "string" || typeof org.organization_id === "number"
          ? String(org.organization_id)
          : null,
    })),
  };
}

export function maskId(id: string): string {
  return id.length <= 4 ? "****" : `${"*".repeat(id.length - 4)}${id.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// CLI (local development only)
// ---------------------------------------------------------------------------

const ENV_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env.local");

function loadEnv(): Record<string, string> {
  if (!existsSync(ENV_FILE)) {
    throw new ZohoDevAuthError("frontend/.env.local not found");
  }
  return parseEnvText(readFileSync(ENV_FILE, "utf8"));
}

function requireEnv(env: Record<string, string>, name: string): string {
  const value = env[name];
  if (value === undefined || value === "") {
    throw new ZohoDevAuthError(`missing ${name} in frontend/.env.local`);
  }
  return value;
}

function saveEnv(updates: Record<string, string>): void {
  writeFileSync(ENV_FILE, upsertEnvText(readFileSync(ENV_FILE, "utf8"), updates));
}

async function postToken(params: Record<string, string>): Promise<TokenResult> {
  const response = await fetch(new URL("/oauth/v2/token", ZOHO_ACCOUNTS_URL), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const body: unknown = await response.json().catch(() => null);
  return interpretTokenResponse(response.status, body);
}

function openInBrowser(url: string): void {
  const [command, args] =
    process.platform === "win32"
      ? ["rundll32", ["url.dll,FileProtocolHandler", url]]
      : process.platform === "darwin"
        ? ["open", [url]]
        : ["xdg-open", [url]];
  spawn(command, args, { detached: true, stdio: "ignore" }).unref();
}

async function authorize(): Promise<void> {
  const env = loadEnv();
  const clientId = requireEnv(env, "ZOHO_CLIENT_ID");
  const clientSecret = requireEnv(env, "ZOHO_CLIENT_SECRET");
  const state = randomBytes(16).toString("hex");
  const callbackPath = new URL(REDIRECT_URI).pathname;

  const code = await new Promise<string>((resolve, reject) => {
    const servers: Server[] = [];
    const finish = (outcome: () => void) => {
      clearTimeout(timer);
      for (const server of servers) {
        server.close();
        server.closeAllConnections();
      }
      outcome();
    };
    const timer = setTimeout(
      () => finish(() => reject(new ZohoDevAuthError("timed out waiting for callback"))),
      CALLBACK_TIMEOUT_MS,
    );
    for (const host of ["127.0.0.1", "::1"]) {
      const server = createServer((req, res) => {
        const url = new URL(req.url ?? "/", REDIRECT_URI);
        if (url.pathname !== callbackPath) {
          res.writeHead(404).end();
          return;
        }
        const result = readCallback(url, state);
        res.writeHead(result.kind === "code" ? 200 : 400, { "Content-Type": "text/plain" });
        res.end(
          result.kind === "code"
            ? "Mini Mystiq: authorization received. You can close this tab."
            : `Mini Mystiq: authorization failed (${result.reason}).`,
        );
        finish(() =>
          result.kind === "code"
            ? resolve(result.code)
            : reject(new ZohoDevAuthError(result.reason)),
        );
      });
      server.on("error", (error: NodeJS.ErrnoException) => {
        if (host === "::1" && error.code === "EADDRNOTAVAIL") return;
        finish(() => reject(new ZohoDevAuthError(`cannot listen on port 3000 (${error.code})`)));
      });
      server.listen(3000, host);
      servers.push(server);
    }
    openInBrowser(buildAuthorizeUrl(clientId, state));
    console.log("Opened the Zoho consent page in your browser. Waiting up to 5 minutes...");
  });

  const tokens = await postToken({
    grant_type: "authorization_code",
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: REDIRECT_URI,
  });
  saveEnv({
    ZOHO_ACCESS_TOKEN: tokens.accessToken,
    ...(tokens.refreshToken === null ? {} : { ZOHO_REFRESH_TOKEN: tokens.refreshToken }),
  });
  console.log("Access token obtained: yes (stored in .env.local)");
  console.log(`Refresh token obtained: ${tokens.refreshToken === null ? "no" : "yes (stored in .env.local)"}`);
  if (tokens.expiresInSeconds !== null) {
    console.log(`Access token lifetime: ${tokens.expiresInSeconds} s`);
  }
}

async function probe(): Promise<void> {
  const env = loadEnv();
  const tokens = await postToken({
    grant_type: "refresh_token",
    refresh_token: requireEnv(env, "ZOHO_REFRESH_TOKEN"),
    client_id: requireEnv(env, "ZOHO_CLIENT_ID"),
    client_secret: requireEnv(env, "ZOHO_CLIENT_SECRET"),
    redirect_uri: REDIRECT_URI,
  });
  saveEnv({ ZOHO_ACCESS_TOKEN: tokens.accessToken });
  console.log("Access token refreshed: yes (stored in .env.local)");

  const endpoint = organizationsUrl(requireEnv(env, "ZOHO_API_BASE_URL"));
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Zoho-oauthtoken ${tokens.accessToken}`,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const body: unknown = await response.json().catch(() => null);
  const summary = summarizeOrganizations(body);
  console.log(`GET ${new URL(endpoint).pathname} -> HTTP ${response.status}`);
  console.log(`Zoho code: ${summary.zohoCode ?? "n/a"}, message: ${summary.zohoMessage ?? "n/a"}`);
  console.log(`Organizations returned: ${summary.organizations.length}`);
  for (const org of summary.organizations) {
    console.log(
      `- name: ${org.name ?? "?"}, currency: ${org.currencyCode ?? "?"}, default: ${org.isDefault ?? "?"}, id: ${org.organizationId === null ? "missing" : maskId(org.organizationId)}`,
    );
  }
  const ids = summary.organizations.flatMap((org) =>
    org.organizationId === null ? [] : [org.organizationId],
  );
  if (ids.length === 1) {
    saveEnv({ ZOHO_ORGANIZATION_ID: ids[0] });
    console.log("ZOHO_ORGANIZATION_ID stored in .env.local");
  } else if (ids.length > 1) {
    console.log("Multiple organizations: ZOHO_ORGANIZATION_ID not stored; choose one manually.");
  }
}

const isCli =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  const command = process.argv[2];
  const run = command === "authorize" ? authorize : command === "probe" ? probe : null;
  if (run === null) {
    console.error("Usage: node scripts/zoho-oauth-dev.ts <authorize|probe>");
    process.exitCode = 2;
  } else {
    run().catch((error: unknown) => {
      const failure = error instanceof Error ? error : new Error(String(error));
      console.error(`Failed: ${failure.name}: ${sanitize(failure.message)}`);
      process.exitCode = 1;
    });
  }
}
