import "server-only";
import type { PriceDisplayConfig } from "@/application/catalog";
import type { DemoOrderLedger } from "@/application/checkout/place-demo-order";
import { readServerEnv, type ServerEnv } from "@/config/server-env";
import { readZohoConfig, ZOHO_ENV, ZohoConfigError } from "@/infrastructure/zoho/zoho-config";
import {
  createZohoDemoGateway,
  type ZohoDemoGateway,
} from "@/infrastructure/zoho/zoho-demo-gateway";
import { createZohoTokenProvider, readZohoOAuthSettings } from "@/infrastructure/zoho/zoho-oauth";

/**
 * Zoho storefront demo (S6-T15). Disabled unless `ZOHO_DEMO_ENABLED=true`;
 * the regular catalog stays on its configured source either way.
 */
export const ZOHO_DEMO_ENV = {
  enabled: "ZOHO_DEMO_ENABLED",
  organizationId: "ZOHO_ORGANIZATION_ID",
  demoCustomerId: "ZOHO_DEMO_CUSTOMER_ID",
} as const;

/** Number of Zoho items (variants) shown on the demo page. */
export const ZOHO_DEMO_ITEM_LIMIT = 12;

/**
 * Demo-only price display: the Zoho organization's currency (INR, verified in
 * S6-T15). The main storefront keeps `priceDisplay = null` (D6 open).
 */
export const ZOHO_DEMO_PRICE_DISPLAY: PriceDisplayConfig = {
  locale: "en-IN",
  currencies: ["INR"],
};

export type ZohoDemo = {
  readonly gateway: ZohoDemoGateway;
  readonly ledger: DemoOrderLedger;
};

export function isZohoDemoEnabled(env: ServerEnv = process.env): boolean {
  return readServerEnv(ZOHO_DEMO_ENV.enabled, env)?.trim() === "true";
}

function required(name: string, env: ServerEnv): string {
  const value = readServerEnv(name, env);
  if (value === null || !/^\d{1,30}$/.test(value.trim())) {
    throw new ZohoConfigError(`Missing or invalid server-only setting ${name}`);
  }
  return value.trim();
}

export function createZohoDemo(env: ServerEnv = process.env): ZohoDemo {
  // The access token is supplied per request by the token provider.
  const { apiBaseUrl, timeoutMs } = readZohoConfig({ ...env, [ZOHO_ENV.accessToken]: "unused" });
  return {
    gateway: createZohoDemoGateway({
      config: { apiBaseUrl, timeoutMs },
      organizationId: required(ZOHO_DEMO_ENV.organizationId, env),
      demoCustomerId: required(ZOHO_DEMO_ENV.demoCustomerId, env),
      tokens: createZohoTokenProvider(readZohoOAuthSettings(env)),
    }),
    ledger: new Map(),
  };
}

const globalKey = Symbol.for("mini-mystiq.zoho-demo");
type GlobalWithDemo = typeof globalThis & { [globalKey]?: ZohoDemo };

/** Process-wide demo instance (shared token cache and order ledger), or null when disabled. */
export function getZohoDemo(): ZohoDemo | null {
  if (!isZohoDemoEnabled()) {
    return null;
  }
  const store = globalThis as GlobalWithDemo;
  store[globalKey] ??= createZohoDemo();
  return store[globalKey];
}
