import "server-only";
import type {
  CreatedSalesOrder,
  DemoOrderGateway,
  DemoSalesOrder,
} from "@/application/checkout/place-demo-order";
import type { Product } from "@/domain/catalog";
import { createZohoClient, ZohoRequestError, type ZohoClient } from "./zoho-client";
import type { ZohoConfig } from "./zoho-config";
import {
  mapZohoItemsToProducts,
  readZohoSalesOrderNumber,
  toZohoSalesOrderBody,
} from "./map-zoho-catalog";
import { createZohoCategoryResolver, type ZohoCategoryResolver } from "./zoho-category-mapping";
import type { ZohoTokenProvider } from "./zoho-oauth";

export type ZohoDemoGatewayOptions = {
  /** Validated base settings; `accessToken` is replaced per request. */
  readonly config: Omit<ZohoConfig, "accessToken">;
  readonly organizationId: string;
  readonly demoCustomerId: string;
  readonly tokens: ZohoTokenProvider;
  readonly fetchImpl?: typeof fetch;
  /** Storefront placement; defaults to the committed Zoho category mapping. */
  readonly resolveCategory?: ZohoCategoryResolver;
};

export type ZohoDemoGateway = DemoOrderGateway & {
  /** First page of Zoho items grouped into products (demo catalog). */
  listProducts(limit: number): Promise<Product[]>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function createZohoDemoGateway(options: ZohoDemoGatewayOptions): ZohoDemoGateway {
  const {
    config,
    organizationId,
    demoCustomerId,
    tokens,
    fetchImpl = fetch,
    resolveCategory = createZohoCategoryResolver(),
  } = options;
  const org = { organization_id: organizationId };
  let currency: Promise<string> | null = null;

  async function client(apiBaseUrl = config.apiBaseUrl): Promise<ZohoClient> {
    const accessToken = await tokens.getAccessToken();
    return createZohoClient({ ...config, apiBaseUrl, accessToken }, fetchImpl);
  }

  /** Organization currency from `GET /v1/organizations` on the same API origin. */
  function organizationCurrency(): Promise<string> {
    currency ??= (async () => {
      const zoho = await client(`${new URL(config.apiBaseUrl).origin}/v1`);
      const { data } = await zoho.request({ method: "GET", path: "/organizations" });
      const orgs = isRecord(data) && Array.isArray(data.organizations) ? data.organizations : [];
      const match = orgs.find(
        (entry) => isRecord(entry) && String(entry.organization_id) === organizationId,
      );
      const code = isRecord(match) ? match.currency_code : null;
      if (typeof code !== "string" || !/^[A-Z]{3}$/.test(code)) {
        throw new Error("Zoho organization currency unavailable");
      }
      return code;
    })().catch((error: unknown) => {
      currency = null;
      throw error;
    });
    return currency;
  }

  return {
    async listProducts(limit) {
      const [code, zoho] = await Promise.all([organizationCurrency(), client()]);
      const { data } = await zoho.request({
        method: "GET",
        path: "/items",
        query: { ...org, page: "1", per_page: String(limit) },
      });
      const items = isRecord(data) && Array.isArray(data.items) ? data.items : [];
      return mapZohoItemsToProducts(items, code, resolveCategory);
    },

    async findVariantProduct(variantId) {
      const [code, zoho] = await Promise.all([organizationCurrency(), client()]);
      try {
        const { data } = await zoho.request({
          method: "GET",
          path: `/items/${encodeURIComponent(variantId)}`,
          query: org,
        });
        const item = isRecord(data) ? data.item : null;
        return isRecord(item) ? (mapZohoItemsToProducts([item], code, resolveCategory)[0] ?? null) : null;
      } catch (error) {
        if (error instanceof ZohoRequestError && error.kind === "http" && error.status === 404) {
          return null;
        }
        throw error;
      }
    },

    async createSalesOrder(order: DemoSalesOrder): Promise<CreatedSalesOrder> {
      const zoho = await client();
      const { data } = await zoho.request({
        method: "POST",
        path: "/salesorders",
        query: org,
        body: toZohoSalesOrderBody(order, demoCustomerId),
      });
      const orderNumber = readZohoSalesOrderNumber(data);
      if (orderNumber === null) {
        throw new Error("Zoho sales order response had no order number");
      }
      return { orderNumber };
    },
  };
}
