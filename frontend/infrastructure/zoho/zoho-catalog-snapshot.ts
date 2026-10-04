import "server-only";
import { validateProduct, type Product } from "@/domain/catalog";
import type { CatalogSnapshotLoader } from "@/infrastructure/catalog/catalog-snapshot";
import { createZohoClient, type ZohoClient } from "./zoho-client";
import type { ZohoConfig } from "./zoho-config";
import { mapZohoItemsToProducts } from "./map-zoho-catalog";
import { createZohoCategoryResolver, type ZohoCategoryResolver } from "./zoho-category-mapping";
import type { ZohoTokenProvider } from "./zoho-oauth";

/** 200 returned the full 157-item catalog in one page (S6-T15); the maximum is unverified (V2). */
export const ZOHO_CATALOG_PAGE_SIZE = 200;
/** Hard cap on item pages per refresh; a larger catalog fails the refresh instead of publishing part of it. */
export const ZOHO_CATALOG_MAX_PAGES = 10;

export type ZohoCatalogLoaderOptions = {
  /** Validated base settings; `accessToken` is replaced per request. */
  readonly config: Omit<ZohoConfig, "accessToken">;
  readonly organizationId: string;
  readonly tokens: ZohoTokenProvider;
  readonly fetchImpl?: typeof fetch;
  readonly resolveCategory?: ZohoCategoryResolver;
  readonly maxPages?: number;
  /** Receives one sanitized summary line per refresh (counts and Zoho category IDs only). */
  readonly log?: (line: string) => void;
};

export type ZohoCatalogSelection = {
  readonly published: readonly Product[];
  readonly unplaced: number;
  readonly inactive: number;
  readonly invalid: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Storefront publication rule: active products with exactly one storefront
 * placement that pass the catalog contract. Later duplicates of an ID or slug
 * are dropped. Unplaced products get no listing, product page, or sitemap URL.
 */
export function selectPublishableProducts(products: readonly Product[]): ZohoCatalogSelection {
  const published: Product[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();
  let unplaced = 0;
  let inactive = 0;
  let invalid = 0;
  for (const product of products) {
    if (product.categoryIds.length !== 1) {
      unplaced += 1;
    } else if (product.status !== "active") {
      inactive += 1;
    } else if (
      validateProduct(product).length > 0 ||
      ids.has(product.id) ||
      slugs.has(product.slug)
    ) {
      invalid += 1;
    } else {
      ids.add(product.id);
      slugs.add(product.slug);
      published.push(product);
    }
  }
  return { published, unplaced, inactive, invalid };
}

/**
 * Full catalog read for the snapshot: organization currency, then every item
 * page (GET only). Fails, keeping the previous snapshot, on any request
 * error, an unexpected response shape, an empty catalog, or more than
 * `maxPages` pages.
 */
export function createZohoCatalogLoader(options: ZohoCatalogLoaderOptions): CatalogSnapshotLoader {
  const {
    config,
    organizationId,
    tokens,
    fetchImpl = fetch,
    resolveCategory = createZohoCategoryResolver(),
    maxPages = ZOHO_CATALOG_MAX_PAGES,
    log = () => {},
  } = options;
  const org = { organization_id: organizationId };

  return async function loadZohoCatalog() {
    let requests = 0;
    const accessToken = await tokens.getAccessToken();
    const client = (apiBaseUrl: string): ZohoClient => {
      const zoho = createZohoClient({ ...config, apiBaseUrl, accessToken }, fetchImpl);
      return {
        request(request) {
          requests += 1;
          return zoho.request(request);
        },
      };
    };

    const orgs = await client(`${new URL(config.apiBaseUrl).origin}/v1`).request({
      method: "GET",
      path: "/organizations",
    });
    const list = isRecord(orgs.data) && Array.isArray(orgs.data.organizations) ? orgs.data.organizations : [];
    const match = list.find(
      (entry) => isRecord(entry) && String(entry.organization_id) === organizationId,
    );
    const currency = isRecord(match) ? match.currency_code : null;
    if (typeof currency !== "string" || !/^[A-Z]{3}$/.test(currency)) {
      throw new Error("Zoho organization currency unavailable");
    }

    const zoho = client(config.apiBaseUrl);
    const items: unknown[] = [];
    for (let page = 1; ; page += 1) {
      if (page > maxPages) {
        throw new Error(`Zoho catalog exceeds ${maxPages} pages`);
      }
      const { data } = await zoho.request({
        method: "GET",
        path: "/items",
        query: { ...org, page: String(page), per_page: String(ZOHO_CATALOG_PAGE_SIZE) },
      });
      if (!isRecord(data) || !Array.isArray(data.items)) {
        throw new Error("Zoho items response has no items list");
      }
      items.push(...data.items);
      const context = data.page_context;
      if (!(isRecord(context) && context.has_more_page === true)) {
        break;
      }
    }
    if (items.length === 0) {
      throw new Error("Zoho catalog is empty");
    }

    const unmapped = new Map<string, number>();
    const products = mapZohoItemsToProducts(items, currency, (source) => {
      const placement = resolveCategory(source);
      if (placement === null) {
        const key = source.categoryId ?? "none";
        unmapped.set(key, (unmapped.get(key) ?? 0) + 1);
      }
      return placement;
    });
    const selection = selectPublishableProducts(products);
    const unmappedList = [...unmapped].map(([id, count]) => `${id}x${count}`).join(",");
    log(
      `[zoho-catalog] snapshot refreshed requests=${requests} items=${items.length} ` +
        `products=${products.length} published=${selection.published.length} ` +
        `unplaced=${selection.unplaced} inactive=${selection.inactive} invalid=${selection.invalid}` +
        (unmappedList === "" ? "" : ` unmappedZohoCategories=${unmappedList}`),
    );
    return selection.published;
  };
}
