import "server-only";
import { catalogImagePath } from "@/app/api/catalog-images/catalog-image-path";
import type { PriceDisplayConfig } from "@/application/catalog";
import { DEFAULT_FRESHNESS_THRESHOLD_MS } from "@/application/catalog/field-provenance";
import { readServerEnv, type ServerEnv } from "@/config/server-env";
import {
  createCatalogSnapshotStore,
  type CatalogSnapshotStore,
} from "@/infrastructure/catalog/catalog-snapshot";
import {
  createZohoCatalogLoader,
  zohoImageKey,
  type ZohoCatalogPublication,
  type ZohoCatalogSnapshot,
} from "@/infrastructure/zoho/zoho-catalog-snapshot";
import { readZohoConfig, ZOHO_ENV, ZohoConfigError, type ZohoConfig } from "@/infrastructure/zoho/zoho-config";
import {
  createZohoItemImageFetcher,
  type ZohoItemImage,
  type ZohoItemImageFetcher,
} from "@/infrastructure/zoho/zoho-item-image";
import {
  createZohoTokenProvider,
  readZohoOAuthSettings,
  type ZohoTokenProvider,
} from "@/infrastructure/zoho/zoho-oauth";

/**
 * Storefront product source. `static` (default) keeps the repository
 * fixtures; `zoho-snapshot` serves the mapped Zoho products (production
 * publication rule); `zoho-demo` serves every active, contract-valid Zoho
 * product, leaving unmapped ones without a storefront placement, for catalog
 * inspection only. Categories stay storefront-owned either way.
 */
export const CATALOG_ENV = {
  productSource: "CATALOG_PRODUCT_SOURCE",
  refreshMinutes: "ZOHO_CATALOG_REFRESH_MINUTES",
  organizationId: "ZOHO_ORGANIZATION_ID",
} as const;

export type CatalogProductSource = "static" | "zoho-snapshot" | "zoho-demo";

const PRODUCT_SOURCES: readonly CatalogProductSource[] = ["static", "zoho-snapshot", "zoho-demo"];

export const DEFAULT_ZOHO_CATALOG_REFRESH_MINUTES = 360;
export const MIN_ZOHO_CATALOG_REFRESH_MINUTES = 15;
/** Must stay below the 24 h freshness threshold, after which a snapshot is not served. */
export const MAX_ZOHO_CATALOG_REFRESH_MINUTES = 720;
export const ZOHO_CATALOG_FAILURE_BACKOFF_MS = 5 * 60 * 1000;

/**
 * Demo-only price presentation for `zoho-demo`, matching the frozen `/demo`
 * flow: INR is the verified Zoho organization currency. Prices in any other
 * currency still render nothing. Not a production price-display decision (Q9).
 */
export const ZOHO_CATALOG_DEMO_PRICE_DISPLAY: PriceDisplayConfig = {
  locale: "en-IN",
  currencies: ["INR"],
};

export function readCatalogProductSource(env: ServerEnv = process.env): CatalogProductSource {
  const value = readServerEnv(CATALOG_ENV.productSource, env)?.trim() ?? "static";
  const source = PRODUCT_SOURCES.find((candidate) => candidate === value);
  if (source === undefined) {
    throw new ZohoConfigError(
      `${CATALOG_ENV.productSource} must be one of ${PRODUCT_SOURCES.map((name) => `"${name}"`).join(", ")}`,
    );
  }
  return source;
}

export function isZohoCatalogSource(source: CatalogProductSource): boolean {
  return source === "zoho-snapshot" || source === "zoho-demo";
}

export function publicationFor(source: CatalogProductSource): ZohoCatalogPublication {
  return source === "zoho-demo" ? "demo" : "production";
}

export function readZohoCatalogRefreshMinutes(env: ServerEnv = process.env): number {
  const value = readServerEnv(CATALOG_ENV.refreshMinutes, env)?.trim() ?? null;
  if (value === null) {
    return DEFAULT_ZOHO_CATALOG_REFRESH_MINUTES;
  }
  const minutes = /^\d+$/.test(value) ? Number(value) : Number.NaN;
  if (
    !Number.isSafeInteger(minutes) ||
    minutes < MIN_ZOHO_CATALOG_REFRESH_MINUTES ||
    minutes > MAX_ZOHO_CATALOG_REFRESH_MINUTES
  ) {
    throw new ZohoConfigError(
      `${CATALOG_ENV.refreshMinutes} must be an integer from ` +
        `${MIN_ZOHO_CATALOG_REFRESH_MINUTES} to ${MAX_ZOHO_CATALOG_REFRESH_MINUTES}`,
    );
  }
  return minutes;
}

type ZohoCatalogContext = {
  readonly config: Omit<ZohoConfig, "accessToken">;
  readonly organizationId: string;
  readonly tokens: ZohoTokenProvider;
};

function readZohoCatalogContext(env: ServerEnv, fetchImpl: typeof fetch): ZohoCatalogContext {
  // The access token is supplied per request by the token provider.
  const { apiBaseUrl, timeoutMs } = readZohoConfig({ ...env, [ZOHO_ENV.accessToken]: "unused" });
  const organizationId = readServerEnv(CATALOG_ENV.organizationId, env)?.trim() ?? "";
  if (!/^\d{1,30}$/.test(organizationId)) {
    throw new ZohoConfigError(`Missing or invalid server-only setting ${CATALOG_ENV.organizationId}`);
  }
  return {
    config: { apiBaseUrl, timeoutMs },
    organizationId,
    tokens: createZohoTokenProvider(readZohoOAuthSettings(env), fetchImpl),
  };
}

export function describeZohoCatalogError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : "unknown error";
}

export type ZohoCatalogRuntime = {
  readonly snapshot: CatalogSnapshotStore<ZohoCatalogSnapshot>;
  /**
   * Image bytes for an item image referenced by the current snapshot; null
   * for any pair the snapshot does not reference or Zoho does not have.
   */
  loadImage(itemId: string, documentId: string): Promise<ZohoItemImage | null>;
};

/**
 * Zoho settings are read on first use, so misconfiguration surfaces as a
 * logged refresh failure. The snapshot loader and image fetcher share one
 * token provider.
 */
export function createZohoCatalogRuntime(
  env: ServerEnv = process.env,
  options: { readonly publication?: ZohoCatalogPublication; readonly fetchImpl?: typeof fetch } = {},
): ZohoCatalogRuntime {
  const { fetchImpl = fetch } = options;
  const publication = options.publication ?? publicationFor(readCatalogProductSource(env));
  let context: ZohoCatalogContext | null = null;
  let fetchImage: ZohoItemImageFetcher | null = null;
  const getContext = () => (context ??= readZohoCatalogContext(env, fetchImpl));

  const snapshot = createCatalogSnapshotStore<ZohoCatalogSnapshot>({
    load: () =>
      createZohoCatalogLoader({
        ...getContext(),
        fetchImpl,
        publication,
        imageSrc: (ref) => catalogImagePath(ref.itemId, ref.documentId),
        log: (line) => console.info(line),
      })(),
    refreshIntervalMs: readZohoCatalogRefreshMinutes(env) * 60 * 1000,
    maxAgeMs: DEFAULT_FRESHNESS_THRESHOLD_MS,
    failureBackoffMs: ZOHO_CATALOG_FAILURE_BACKOFF_MS,
    onRefreshError: (error) => console.error(`[zoho-catalog] snapshot refresh failed: ${describeZohoCatalogError(error)}`),
  });

  return {
    snapshot,
    async loadImage(itemId, documentId) {
      const { imageKeys } = await snapshot.get();
      if (!imageKeys.has(zohoImageKey({ itemId, documentId }))) {
        return null;
      }
      fetchImage ??= createZohoItemImageFetcher({ ...getContext(), fetchImpl });
      return fetchImage(itemId);
    },
  };
}

const globalKey = Symbol.for("mini-mystiq.zoho-catalog-runtime");
type GlobalWithRuntime = typeof globalThis & { [globalKey]?: ZohoCatalogRuntime };

/** Process-wide snapshot and image runtime, shared across module reloads. */
export function getZohoCatalogRuntime(): ZohoCatalogRuntime {
  const store = globalThis as GlobalWithRuntime;
  store[globalKey] ??= createZohoCatalogRuntime();
  return store[globalKey];
}
