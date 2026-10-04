import "server-only";
import { isValidZohoTimeout, type ZohoConfig } from "./zoho-config";

/**
 * Minimal server-only Zoho HTTP wrapper. It adds authorization, enforces a
 * timeout, keeps requests on the configured origin, and normalizes failures.
 * Responses are returned as untrusted `unknown` data for a server-side adapter
 * to validate and map; they must never be passed to the browser as-is.
 */
export type ZohoMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ZohoRequest = {
  readonly method: ZohoMethod;
  /** Path relative to the configured API base URL, starting with `/`. */
  readonly path: string;
  readonly query?: Readonly<Record<string, string>>;
  readonly headers?: Readonly<Record<string, string>>;
  /** Serialized as JSON when present. */
  readonly body?: unknown;
  /** Overrides the configured timeout for this request. */
  readonly timeoutMs?: number;
};

export type ZohoResponse = {
  readonly status: number;
  readonly data: unknown;
};

export type ZohoErrorKind =
  | "invalid_request"
  | "timeout"
  | "network"
  | "http"
  | "invalid_response";

/**
 * Sanitized failure. Carries method, path (no query string), status, and the
 * provider's top-level `code`/`message` when present, with the access token
 * redacted. Never carries headers, tokens, query values, or request bodies.
 */
export class ZohoRequestError extends Error {
  readonly kind: ZohoErrorKind;
  readonly method: ZohoMethod;
  readonly endpoint: string;
  readonly status: number | null;
  readonly retryAfter: string | null;
  readonly providerCode: string | null;
  readonly providerMessage: string | null;

  constructor(details: {
    kind: ZohoErrorKind;
    method: ZohoMethod;
    endpoint: string;
    status?: number | null;
    retryAfter?: string | null;
    providerCode?: string | null;
    providerMessage?: string | null;
    detail?: string;
  }) {
    const status = details.status ?? null;
    super(
      `Zoho request failed: ${details.method} ${details.endpoint} (${details.kind}` +
        `${status === null ? "" : ` ${status}`})${details.detail ? `: ${details.detail}` : ""}`,
    );
    this.name = "ZohoRequestError";
    this.kind = details.kind;
    this.method = details.method;
    this.endpoint = details.endpoint;
    this.status = status;
    this.retryAfter = details.retryAfter ?? null;
    this.providerCode = details.providerCode ?? null;
    this.providerMessage = details.providerMessage ?? null;
  }
}

export type ZohoClient = {
  request(request: ZohoRequest): Promise<ZohoResponse>;
};

type Fetch = typeof fetch;

/** Zoho's general OAuth header scheme; to be confirmed for Zoho POS in S6-T15. */
const AUTHORIZATION_SCHEME = "Zoho-oauthtoken";
const MAX_DIAGNOSTIC_LENGTH = 300;
const REDACTED = "[redacted]";

function redact(text: string, secret: string): string {
  const withoutSecret = secret === "" ? text : text.split(secret).join(REDACTED);
  return withoutSecret
    .replace(/(Zoho-oauthtoken|Bearer)\s+\S+/gi, `$1 ${REDACTED}`)
    .slice(0, MAX_DIAGNOSTIC_LENGTH);
}

function endpointOf(path: string): string {
  return typeof path === "string" ? path.split(/[?#]/, 1)[0] || "/" : "/";
}

function buildUrl(config: ZohoConfig, request: ZohoRequest): URL | null {
  const { path } = request;
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//") || /[?#]/.test(path)) {
    return null;
  }
  const base = new URL(config.apiBaseUrl);
  const basePath = base.pathname.replace(/\/+$/, "");
  const url = new URL(`${config.apiBaseUrl}${path}`);
  if (url.origin !== base.origin || !url.pathname.startsWith(`${basePath}/`)) {
    return null;
  }
  for (const [name, value] of Object.entries(request.query ?? {})) {
    url.searchParams.set(name, value);
  }
  return url;
}

function providerDetails(
  payload: unknown,
  secret: string,
): { providerCode: string | null; providerMessage: string | null } {
  if (typeof payload !== "object" || payload === null) {
    return { providerCode: null, providerMessage: null };
  }
  const { code, message } = payload as { code?: unknown; message?: unknown };
  const asText = (value: unknown) =>
    typeof value === "string" || typeof value === "number" ? redact(String(value), secret) : null;
  return { providerCode: asText(code), providerMessage: asText(message) };
}

function parseJson(text: string): { ok: true; value: unknown } | { ok: false } {
  if (text.trim() === "") {
    return { ok: true, value: null };
  }
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}

export function createZohoClient(config: ZohoConfig, fetchImpl: Fetch = fetch): ZohoClient {
  return {
    async request(request) {
      const endpoint = endpointOf(request.path);
      const fail = (
        kind: ZohoErrorKind,
        extra: Omit<ConstructorParameters<typeof ZohoRequestError>[0], "kind" | "method" | "endpoint"> = {},
      ) => new ZohoRequestError({ kind, method: request.method, endpoint, ...extra });

      const url = buildUrl(config, request);
      if (url === null) {
        throw fail("invalid_request", {
          detail: "path must be relative to the configured API base URL",
        });
      }
      const customHeaders = request.headers ?? {};
      if (Object.keys(customHeaders).some((name) => name.toLowerCase() === "authorization")) {
        throw fail("invalid_request", { detail: "authorization is set by the client" });
      }
      const timeoutMs = request.timeoutMs ?? config.timeoutMs;
      if (!isValidZohoTimeout(timeoutMs)) {
        throw fail("invalid_request", { detail: "timeoutMs is out of range" });
      }

      const headers = new Headers(customHeaders);
      headers.set("Accept", "application/json");
      headers.set("Authorization", `${AUTHORIZATION_SCHEME} ${config.accessToken}`);
      let body: string | undefined;
      if (request.body !== undefined) {
        body = JSON.stringify(request.body);
        headers.set("Content-Type", "application/json");
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      let response: Response;
      let text: string;
      try {
        response = await fetchImpl(url, {
          method: request.method,
          headers,
          body,
          signal: controller.signal,
          cache: "no-store",
        });
        text = await response.text();
      } catch (error) {
        if (controller.signal.aborted) {
          throw fail("timeout", { detail: `no response within ${timeoutMs} ms` });
        }
        const name = error instanceof Error ? error.name : "Error";
        const cause = error instanceof Error ? (error.cause as { code?: unknown } | undefined) : undefined;
        const code = typeof cause?.code === "string" ? ` ${cause.code}` : "";
        throw fail("network", { detail: redact(`${name}${code}`, config.accessToken) });
      } finally {
        clearTimeout(timer);
      }

      const parsed = parseJson(text);
      if (!response.ok) {
        throw fail("http", {
          status: response.status,
          retryAfter: response.headers.get("retry-after"),
          ...providerDetails(parsed.ok ? parsed.value : null, config.accessToken),
        });
      }
      if (!parsed.ok) {
        throw fail("invalid_response", {
          status: response.status,
          detail: "response body is not JSON",
        });
      }
      return { status: response.status, data: parsed.value };
    },
  };
}
