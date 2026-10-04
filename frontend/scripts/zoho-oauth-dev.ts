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
  return String(value).replace(/[^\w.\-/;= ]/g, "").slice(0, 80);
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

/**
 * Spike-only normalization of one Zoho POS item (a sellable variant) into
 * storefront-safe fields. Not wired into the catalog runtime.
 */
export type NormalizedZohoItem = {
  readonly zohoItemId: string;
  readonly zohoGroupId: string | null;
  readonly productName: string;
  readonly variantName: string;
  readonly sku: string | null;
  readonly description: string | null;
  readonly categoryName: string | null;
  readonly attributes: readonly { readonly name: string; readonly value: string }[];
  readonly uom: string | null;
  readonly price: { readonly amount: number; readonly currency: string } | null;
  readonly labelRate: number | null;
  readonly gstPercentage: number | null;
  readonly inventory: {
    readonly stockOnHand: number | null;
    readonly availableToSell: number | null;
    readonly reserved: number | null;
    readonly status: "unknown" | "in_stock" | "out_of_stock";
    readonly observedAt: string;
  };
  readonly image: { readonly zohoImageName: string } | null;
  readonly status: "active" | "inactive";
};

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function quantity(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function normalizeZohoItem(
  item: Record<string, unknown>,
  currency: string | null,
  observedAt: string,
): NormalizedZohoItem {
  const id = text(item.item_id);
  if (id === null) {
    throw new ZohoDevAuthError("item has no item_id");
  }
  const variantName = text(item.name) ?? text(item.item_name) ?? id;
  const attributes = [1, 2, 3].flatMap((index) => {
    const name = text(item[`attribute_name${index}`]);
    const value = text(item[`attribute_option_name${index}`]);
    return name !== null && value !== null ? [{ name, value }] : [];
  });
  const rate = quantity(item.rate);
  const tracked = item.track_inventory === true;
  const availableToSell = tracked ? quantity(item.actual_available_for_sale_stock) : null;
  const gst = Array.isArray(item.item_tax_preferences)
    ? item.item_tax_preferences.filter(isRecord).map((pref) => quantity(pref.tax_percentage))
    : [];
  const imageName = text(item.image_name);
  return {
    zohoItemId: id,
    zohoGroupId: text(item.group_id),
    productName: text(item.group_name) ?? variantName,
    variantName,
    sku: text(item.sku),
    description: text(item.description),
    categoryName: text(item.category_name),
    attributes,
    uom: text(item.unit),
    price: rate !== null && rate >= 0 && currency !== null ? { amount: rate, currency } : null,
    labelRate: quantity(item.label_rate),
    gstPercentage: gst.length > 0 && gst.every((value) => value === gst[0]) ? gst[0] : null,
    inventory: {
      stockOnHand: tracked ? quantity(item.stock_on_hand) : null,
      availableToSell,
      reserved: tracked ? quantity(item.actual_committed_stock) : null,
      status:
        availableToSell === null ? "unknown" : availableToSell > 0 ? "in_stock" : "out_of_stock",
      observedAt,
    },
    image: imageName === null ? null : { zohoImageName: imageName },
    status: item.status === "active" ? "active" : "inactive",
  };
}

/** Fields whose values are safe to show; every other field shows its type only. */
const SHOWN_VALUE_FIELDS = new Set([
  "code", "message", "name", "item_name", "sku", "description", "unit", "status",
  "item_type", "product_type", "group_name", "category_name", "brand",
  "rate", "sales_rate", "pricebook_rate", "label_rate", "is_taxable",
  "tax_name", "tax_percentage", "tax_type", "is_inclusive_tax", "tax_inclusive",
  "stock_on_hand", "available_stock", "actual_available_stock", "committed_stock",
  "actual_committed_stock", "available_for_sale_stock", "actual_available_for_sale_stock",
  "quantity_in_transit", "track_inventory", "is_combo_product", "is_returnable",
  "image_name", "image_type", "location_name", "warehouse_name", "is_primary",
  "is_primary_location", "location_type", "currency_code", "has_more_page", "page",
  "per_page", "attribute_name1", "attribute_option_name1", "attribute_name2",
  "attribute_option_name2", "attribute_name3", "attribute_option_name3",
]);
const MASKED_ID_FIELDS = /(^|_)(item_id|group_id|location_id|warehouse_id|image_id|image_document_id|category_id)$/;

/** Lists the shape of a provider response, showing values only for allowlisted fields. */
export function describeShape(value: unknown, indent = "", depth = 0): string[] {
  if (Array.isArray(value)) {
    const head = `${indent}[array, ${value.length} entries]`;
    return value.length === 0 || depth >= 3
      ? [head]
      : [head, ...describeShape(value[0], `${indent}  `, depth + 1)];
  }
  if (!isRecord(value)) {
    return [`${indent}${value === null ? "null" : typeof value}`];
  }
  const lines: string[] = [];
  for (const [key, field] of Object.entries(value)) {
    if (Array.isArray(field) || isRecord(field)) {
      lines.push(`${indent}${key}: ${Array.isArray(field) ? `array(${field.length})` : "object"}`);
      if (depth < 3) lines.push(...describeShape(field, `${indent}  `, depth + 1));
      continue;
    }
    const type = field === null ? "null" : typeof field;
    let shown = "";
    if (field !== null && field !== "" && MASKED_ID_FIELDS.test(key)) {
      shown = ` = ${maskId(String(field))}`;
    } else if (SHOWN_VALUE_FIELDS.has(key)) {
      shown = ` = ${JSON.stringify(typeof field === "string" ? field.slice(0, 80) : field)}`;
    }
    lines.push(`${indent}${key}: ${type}${shown}`);
  }
  return lines;
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
  const accessToken = await refreshAccessToken(env);
  console.log("Access token refreshed: yes (stored in .env.local)");

  const endpoint = organizationsUrl(requireEnv(env, "ZOHO_API_BASE_URL"));
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
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

async function refreshAccessToken(env: Record<string, string>): Promise<string> {
  const tokens = await postToken({
    grant_type: "refresh_token",
    refresh_token: requireEnv(env, "ZOHO_REFRESH_TOKEN"),
    client_id: requireEnv(env, "ZOHO_CLIENT_ID"),
    client_secret: requireEnv(env, "ZOHO_CLIENT_SECRET"),
    redirect_uri: REDIRECT_URI,
  });
  saveEnv({ ZOHO_ACCESS_TOKEN: tokens.accessToken });
  return tokens.accessToken;
}

type ReadOnlyGet = (
  pathname: string,
  query: Record<string, string>,
  options?: { readonly shape?: boolean; readonly binary?: boolean },
) => Promise<unknown>;

function createReadOnlyGet(accessToken: string, apiOrigin: string): ReadOnlyGet {
  return async (pathname, query, options = {}) => {
    const url = new URL(pathname, apiOrigin);
    url.search = new URLSearchParams(query).toString();
    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}`, Accept: "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const shownPath = pathname.replace(/\d{6,}/g, (id) => maskId(id));
    const shownQuery = Object.keys(query).map((key) =>
      key === "organization_id" ? `${key}=<org>` : `${key}=${query[key]}`,
    );
    console.log(`\n=== GET ${shownPath}?${shownQuery.join("&")} -> HTTP ${response.status}`);
    const contentType = response.headers.get("content-type") ?? "";
    if (options.binary && !contentType.includes("json")) {
      const bytes = (await response.arrayBuffer()).byteLength;
      console.log(`content-type: ${sanitize(contentType)}, bytes: ${bytes} (body discarded)`);
      return null;
    }
    const body: unknown = await response.json().catch(() => null);
    const lines = options.shape === false && isRecord(body)
      ? describeShape({ code: body.code, message: body.message })
      : describeShape(body);
    for (const line of lines) console.log(line);
    return body;
  };
}

async function catalog(): Promise<void> {
  const env = loadEnv();
  const organizationId = requireEnv(env, "ZOHO_ORGANIZATION_ID");
  const apiBaseUrl = requireEnv(env, "ZOHO_API_BASE_URL");
  const get = createReadOnlyGet(await refreshAccessToken(env), new URL(apiBaseUrl).origin);
  const org = { organization_id: organizationId };

  const orgs = summarizeOrganizations(
    await get(new URL(organizationsUrl(apiBaseUrl)).pathname, {}, { shape: false }),
  );
  const currency =
    orgs.organizations.find((entry) => entry.organizationId === organizationId)?.currencyCode ??
    null;

  const list = await get("/inventory/v1/items", { ...org, page: "1", per_page: "3" });
  const listed = isRecord(list) && Array.isArray(list.items) ? list.items.filter(isRecord) : [];
  const observedAt = new Date().toISOString();
  const sample: NormalizedZohoItem[] = [];
  for (const item of listed.slice(0, 3)) {
    const id = item.item_id;
    if (typeof id !== "string") continue;
    const detail = await get(`/inventory/v1/items/${encodeURIComponent(id)}`, org, {
      shape: sample.length === 0,
    });
    if (isRecord(detail) && isRecord(detail.item)) {
      sample.push(normalizeZohoItem(detail.item, currency, observedAt));
    }
  }

  const first = listed[0];
  if (first !== undefined && typeof first.group_id === "string" && first.group_id !== "") {
    await get(`/inventory/v1/itemgroups/${encodeURIComponent(first.group_id)}`, org);
  }
  if (first !== undefined && typeof first.item_id === "string") {
    await get(`/inventory/v1/items/${encodeURIComponent(first.item_id)}/image`, org, {
      binary: true,
    });
  }
  await get("/inventory/v1/locations", org);

  console.log("\n=== Normalized sample (IDs masked)");
  console.log(
    JSON.stringify(
      sample.map((entry) => ({
        ...entry,
        zohoItemId: maskId(entry.zohoItemId),
        zohoGroupId: entry.zohoGroupId === null ? null : maskId(entry.zohoGroupId),
      })),
      null,
      2,
    ),
  );
}

export const DEMO_CUSTOMER_NAME = "MINI MYSTIQ DEMO - DO NOT FULFILL";

/** Finds the demo contact by exact name; creates it only when none exists. */
async function demoCustomer(): Promise<void> {
  const env = loadEnv();
  const organizationId = requireEnv(env, "ZOHO_ORGANIZATION_ID");
  const accessToken = await refreshAccessToken(env);
  const apiOrigin = new URL(requireEnv(env, "ZOHO_API_BASE_URL")).origin;
  const get = createReadOnlyGet(accessToken, apiOrigin);
  const org = { organization_id: organizationId };

  const list = await get("/inventory/v1/contacts", { ...org, contact_name: DEMO_CUSTOMER_NAME }, { shape: false });
  const matches = (isRecord(list) && Array.isArray(list.contacts) ? list.contacts : [])
    .filter(isRecord)
    .filter((contact) => contact.contact_name === DEMO_CUSTOMER_NAME);
  console.log(`Exact-name matches: ${matches.length}`);

  let contactId = matches.length > 0 ? text(matches[0].contact_id) : null;
  if (contactId === null) {
    const url = new URL("/inventory/v1/contacts", apiOrigin);
    url.search = new URLSearchParams(org).toString();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contact_name: DEMO_CUSTOMER_NAME,
        contact_type: "customer",
        gst_treatment: "consumer",
        notes: "Mini Mystiq training demo customer. Orders for this contact must not be fulfilled.",
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const body: unknown = await response.json().catch(() => null);
    console.log(`\n=== POST /inventory/v1/contacts -> HTTP ${response.status}`);
    const record = isRecord(body) ? body : {};
    for (const line of describeShape({ code: record.code, message: record.message })) console.log(line);
    contactId = isRecord(record.contact) ? text(record.contact.contact_id) : null;
  }
  if (contactId === null) {
    throw new ZohoDevAuthError("demo customer not found or created");
  }
  saveEnv({ ZOHO_DEMO_CUSTOMER_ID: contactId });
  console.log(`Demo customer id ${maskId(contactId)} stored as ZOHO_DEMO_CUSTOMER_ID`);
}

/** Read-only verification of one demo sales order by its Mini Mystiq reference. */
async function verifyOrder(): Promise<void> {
  const reference = process.argv[3] ?? "";
  if (!/^MMDEMO-[A-Z0-9]{10}$/.test(reference)) {
    throw new ZohoDevAuthError("usage: verify-order MMDEMO-XXXXXXXXXX");
  }
  const env = loadEnv();
  const organizationId = requireEnv(env, "ZOHO_ORGANIZATION_ID");
  const get = createReadOnlyGet(
    await refreshAccessToken(env),
    new URL(requireEnv(env, "ZOHO_API_BASE_URL")).origin,
  );
  const org = { organization_id: organizationId };

  const list = await get("/inventory/v1/salesorders", { ...org, reference_number: reference }, { shape: false });
  const matches = (isRecord(list) && Array.isArray(list.salesorders) ? list.salesorders : [])
    .filter(isRecord)
    .filter((order) => order.reference_number === reference);
  console.log(`Sales orders with reference ${reference}: ${matches.length}`);
  const id = matches.length === 1 ? text(matches[0].salesorder_id) : null;
  if (id === null) return;

  const detail = await get(`/inventory/v1/salesorders/${encodeURIComponent(id)}`, org, { shape: false });
  const order = isRecord(detail) && isRecord(detail.salesorder) ? detail.salesorder : {};
  const pick = (key: string) => JSON.stringify(order[key] ?? null);
  console.log("\n=== Sales order (selected fields)");
  for (const key of [
    "salesorder_number", "status", "order_status", "reference_number", "customer_name", "date",
    "currency_code", "is_inclusive_tax", "sub_total", "tax_total", "total",
  ]) {
    console.log(`${key}: ${pick(key)}`);
  }
  console.log(`customer_id matches ZOHO_DEMO_CUSTOMER_ID: ${String(order.customer_id) === env.ZOHO_DEMO_CUSTOMER_ID}`);
  console.log(`notes first line: ${JSON.stringify(String(order.notes ?? "").split("\n")[0])}`);
  const lines = Array.isArray(order.line_items) ? order.line_items.filter(isRecord) : [];
  for (const line of lines) {
    console.log(
      `line: ${JSON.stringify(line.name)} sku=${JSON.stringify(line.sku)} qty=${String(line.quantity)} rate=${String(line.rate)} item_total=${String(line.item_total)} tax=${JSON.stringify(line.tax_name)} ${String(line.tax_percentage)}%`,
    );
  }
  for (const line of lines) {
    const itemId = text(line.item_id);
    if (itemId === null) continue;
    const item = await get(`/inventory/v1/items/${encodeURIComponent(itemId)}`, org, { shape: false });
    const record = isRecord(item) && isRecord(item.item) ? item.item : {};
    console.log(
      `stock after order for ${JSON.stringify(record.sku)}: on_hand=${String(record.stock_on_hand)} committed=${String(record.actual_committed_stock)} available_for_sale=${String(record.actual_available_for_sale_stock)}`,
    );
  }
}

const isCli =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  const command = process.argv[2];
  const commands: Record<string, () => Promise<void>> = {
    authorize,
    probe,
    catalog,
    "demo-customer": demoCustomer,
    "verify-order": verifyOrder,
  };
  const run = command !== undefined && Object.hasOwn(commands, command) ? commands[command] : null;
  if (run === null) {
    console.error(
      "Usage: node scripts/zoho-oauth-dev.ts <authorize|probe|catalog|demo-customer|verify-order REF>",
    );
    process.exitCode = 2;
  } else {
    run().catch((error: unknown) => {
      const failure = error instanceof Error ? error : new Error(String(error));
      console.error(`Failed: ${failure.name}: ${sanitize(failure.message)}`);
      process.exitCode = 1;
    });
  }
}
