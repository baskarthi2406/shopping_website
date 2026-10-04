import "server-only";
import type { ZohoConfig } from "./zoho-config";
import type { ZohoTokenProvider } from "./zoho-oauth";

/**
 * Server-only read of a Zoho item image (`GET /items/{item_id}/image`). The
 * authorization header and the Zoho URL stay on the server; callers receive
 * only the bytes and a validated image content type. Errors carry no URL,
 * header, query value, or token.
 */
export const ZOHO_ITEM_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ZOHO_ID_PATTERN = /^\d{1,30}$/;

export type ZohoItemImage = { readonly contentType: string; readonly body: ArrayBuffer };

export class ZohoItemImageError extends Error {
  constructor(reason: string) {
    super(`Zoho item image request failed: ${reason}`);
    this.name = "ZohoItemImageError";
  }
}

export type ZohoItemImageOptions = {
  readonly config: Omit<ZohoConfig, "accessToken">;
  readonly organizationId: string;
  readonly tokens: ZohoTokenProvider;
  readonly fetchImpl?: typeof fetch;
  readonly maxBytes?: number;
};

export type ZohoItemImageFetcher = (itemId: string) => Promise<ZohoItemImage | null>;

/** Resolves null when Zoho has no image for the item (404). */
export function createZohoItemImageFetcher(options: ZohoItemImageOptions): ZohoItemImageFetcher {
  const { config, organizationId, tokens, fetchImpl = fetch, maxBytes = ZOHO_ITEM_IMAGE_MAX_BYTES } = options;

  return async function fetchZohoItemImage(itemId) {
    if (!ZOHO_ID_PATTERN.test(itemId)) {
      throw new ZohoItemImageError("invalid item ID");
    }
    const base = new URL(config.apiBaseUrl);
    const url = new URL(`${config.apiBaseUrl.replace(/\/+$/, "")}/items/${itemId}/image`);
    if (url.origin !== base.origin) {
      throw new ZohoItemImageError("invalid request");
    }
    url.searchParams.set("organization_id", organizationId);

    const accessToken = await tokens.getAccessToken();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs);
    try {
      let response: Response;
      try {
        response = await fetchImpl(url, {
          method: "GET",
          // Zoho answers `Accept: image/*` with 406; the content type is validated below instead.
          headers: { Accept: "*/*", Authorization: `Zoho-oauthtoken ${accessToken}` },
          signal: controller.signal,
          cache: "no-store",
        });
      } catch {
        throw new ZohoItemImageError(controller.signal.aborted ? "timeout" : "network error");
      }
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new ZohoItemImageError(`HTTP ${response.status}`);
      }
      const contentType = (response.headers.get("content-type") ?? "").split(";", 1)[0].trim().toLowerCase();
      if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
        throw new ZohoItemImageError("response is not an image");
      }
      const declared = Number(response.headers.get("content-length"));
      if (Number.isFinite(declared) && declared > maxBytes) {
        throw new ZohoItemImageError("image is too large");
      }
      let body: ArrayBuffer;
      try {
        body = await response.arrayBuffer();
      } catch {
        throw new ZohoItemImageError(controller.signal.aborted ? "timeout" : "network error");
      }
      if (body.byteLength === 0) {
        return null;
      }
      if (body.byteLength > maxBytes) {
        throw new ZohoItemImageError("image is too large");
      }
      return { contentType, body };
    } finally {
      clearTimeout(timer);
    }
  };
}
