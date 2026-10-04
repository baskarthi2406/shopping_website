import "server-only";
import { DEFAULT_FRESHNESS_THRESHOLD_MS } from "@/application/catalog/field-provenance";
import { readServerEnv, type ServerEnv } from "@/config/server-env";
import {
  createCatalogSnapshotStore,
  type CatalogSnapshotLoader,
  type CatalogSnapshotStore,
} from "@/infrastructure/catalog/catalog-snapshot";
import { createZohoCatalogLoader } from "@/infrastructure/zoho/zoho-catalog-snapshot";
import { readZohoConfig, ZOHO_ENV, ZohoConfigError } from "@/infrastructure/zoho/zoho-config";
import { createZohoTokenProvider, readZohoOAuthSettings } from "@/infrastructure/zoho/zoho-oauth";

/**
 * Storefront product source. `static` (default) keeps the repository
 * fixtures; `zoho-snapshot` serves products from the in-memory Zoho catalog
 * snapshot. Categories stay storefront-owned either way.
 */
export const CATALOG_ENV = {
  productSource: "CATALOG_PRODUCT_SOURCE",
  refreshMinutes: "ZOHO_CATALOG_REFRESH_MINUTES",
  organizationId: "ZOHO_ORGANIZATION_ID",
} as const;

export type CatalogProductSource = "static" | "zoho-snapshot";

export const DEFAULT_ZOHO_CATALOG_REFRESH_MINUTES = 360;
export const MIN_ZOHO_CATALOG_REFRESH_MINUTES = 15;
/** Must stay below the 24 h freshness threshold, after which a snapshot is not served. */
export const MAX_ZOHO_CATALOG_REFRESH_MINUTES = 720;
export const ZOHO_CATALOG_FAILURE_BACKOFF_MS = 5 * 60 * 1000;

export function readCatalogProductSource(env: ServerEnv = process.env): CatalogProductSource {
  const value = readServerEnv(CATALOG_ENV.productSource, env)?.trim() ?? "static";
  if (value !== "static" && value !== "zoho-snapshot") {
    throw new ZohoConfigError(`${CATALOG_ENV.productSource} must be "static" or "zoho-snapshot"`);
  }
  return value;
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

function createLoader(env: ServerEnv): CatalogSnapshotLoader {
  // The access token is supplied per refresh by the token provider.
  const { apiBaseUrl, timeoutMs } = readZohoConfig({ ...env, [ZOHO_ENV.accessToken]: "unused" });
  const organizationId = readServerEnv(CATALOG_ENV.organizationId, env)?.trim() ?? "";
  if (!/^\d{1,30}$/.test(organizationId)) {
    throw new ZohoConfigError(`Missing or invalid server-only setting ${CATALOG_ENV.organizationId}`);
  }
  return createZohoCatalogLoader({
    config: { apiBaseUrl, timeoutMs },
    organizationId,
    tokens: createZohoTokenProvider(readZohoOAuthSettings(env)),
    log: (line) => console.info(line),
  });
}

function describe(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : "unknown error";
}

/** Zoho settings are read on the first refresh, so misconfiguration surfaces as a logged refresh failure. */
export function createZohoCatalogSnapshotStore(env: ServerEnv = process.env): CatalogSnapshotStore {
  let loader: CatalogSnapshotLoader | null = null;
  return createCatalogSnapshotStore({
    load: () => {
      loader ??= createLoader(env);
      return loader();
    },
    refreshIntervalMs: readZohoCatalogRefreshMinutes(env) * 60 * 1000,
    maxAgeMs: DEFAULT_FRESHNESS_THRESHOLD_MS,
    failureBackoffMs: ZOHO_CATALOG_FAILURE_BACKOFF_MS,
    onRefreshError: (error) => console.error(`[zoho-catalog] snapshot refresh failed: ${describe(error)}`),
  });
}

const globalKey = Symbol.for("mini-mystiq.zoho-catalog-snapshot");
type GlobalWithSnapshot = typeof globalThis & { [globalKey]?: CatalogSnapshotStore };

/** Process-wide snapshot store, shared across module reloads. */
export function getZohoCatalogSnapshotStore(): CatalogSnapshotStore {
  const store = globalThis as GlobalWithSnapshot;
  store[globalKey] ??= createZohoCatalogSnapshotStore();
  return store[globalKey];
}
