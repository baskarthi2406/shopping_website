import "server-only";
import { validateProduct, type Product } from "@/domain/catalog";
import type { CatalogSnapshotLoader } from "@/infrastructure/catalog/catalog-snapshot";
import { createZohoClient, type ZohoClient } from "./zoho-client";
import type { ZohoConfig } from "./zoho-config";
import {
  mapZohoItemsToProducts,
  zohoProductIdOf,
  type ZohoItemImageRef,
} from "./map-zoho-catalog";
import { createZohoCategoryResolver, type ZohoCategoryResolver } from "./zoho-category-mapping";
import type { ZohoTokenProvider } from "./zoho-oauth";

/** 200 returned the full 157-item catalog in one page (S6-T15); the maximum is unverified (V2). */
export const ZOHO_CATALOG_PAGE_SIZE = 200;
/** Hard cap on item pages per refresh; a larger catalog fails the refresh instead of publishing part of it. */
export const ZOHO_CATALOG_MAX_PAGES = 10;

/**
 * `production` publishes only products with one storefront placement.
 * `demo` also publishes unmapped products, with no placement, so the whole
 * catalog can be inspected; their Zoho category is metadata only.
 */
export type ZohoCatalogPublication = "production" | "demo";

/** Zoho category of a product as reported by Zoho; never a storefront placement. */
export type ZohoSourceCategory = { readonly id: string | null; readonly name: string | null };

export type ZohoCatalogSnapshot = {
  readonly products: readonly Product[];
  /** Zoho category per published product ID. */
  readonly sourceCategories: ReadonlyMap<string, ZohoSourceCategory>;
  /** `itemId/documentId` pairs referenced by published product images. */
  readonly imageKeys: ReadonlySet<string>;
};

export function zohoImageKey(ref: ZohoItemImageRef): string {
  return `${ref.itemId}/${ref.documentId}`;
}

export type ZohoCatalogLoaderOptions = {
  /** Validated base settings; `accessToken` is replaced per request. */
  readonly config: Omit<ZohoConfig, "accessToken">;
  readonly organizationId: string;
  readonly tokens: ZohoTokenProvider;
  readonly fetchImpl?: typeof fetch;
  readonly resolveCategory?: ZohoCategoryResolver;
  readonly publication?: ZohoCatalogPublication;
  /** Storefront image URL for an item image; without it products have no images. */
  readonly imageSrc?: (ref: ZohoItemImageRef) => string;
  readonly maxPages?: number;
  /** Receives one sanitized summary line per refresh (counts and Zoho category IDs only). */
  readonly log?: (line: string) => void;
};

export type ZohoCatalogSelection = {
  readonly published: readonly Product[];
  /** Products without exactly one storefront placement (published only in `demo`). */
  readonly unplaced: number;
  readonly inactive: number;
  readonly invalid: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

/**
 * Storefront publication rule: active products that pass the catalog
 * contract; in `production` they also need exactly one storefront placement.
 * Later duplicates of an ID or slug are dropped. Unpublished products get no
 * listing, product page, or sitemap URL.
 */
export function selectPublishableProducts(
  products: readonly Product[],
  publication: ZohoCatalogPublication = "production",
): ZohoCatalogSelection {
  const published: Product[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();
  let unplaced = 0;
  let inactive = 0;
  let invalid = 0;
  for (const product of products) {
    const placed = product.categoryIds.length === 1;
    if (!placed) {
      unplaced += 1;
    }
    if (!placed && (publication === "production" || product.categoryIds.length > 1)) {
      continue;
    }
    if (product.status !== "active") {
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
export function createZohoCatalogLoader(
  options: ZohoCatalogLoaderOptions,
): CatalogSnapshotLoader<ZohoCatalogSnapshot> {
  const {
    config,
    organizationId,
    tokens,
    fetchImpl = fetch,
    resolveCategory = createZohoCategoryResolver(),
    publication = "production",
    imageSrc,
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
    const imageRefs = new Map<string, ZohoItemImageRef>();
    const products = mapZohoItemsToProducts(
      items,
      currency,
      (source) => {
        const placement = resolveCategory(source);
        if (placement === null) {
          const key = source.categoryId ?? "none";
          unmapped.set(key, (unmapped.get(key) ?? 0) + 1);
        }
        return placement;
      },
      imageSrc === undefined
        ? {}
        : {
            imageSrc: (ref) => {
              const src = imageSrc(ref);
              imageRefs.set(src, ref);
              return src;
            },
          },
    );
    const selection = selectPublishableProducts(products, publication);

    const publishedIds = new Set(selection.published.map((product) => product.id));
    const sourceCategories = new Map<string, ZohoSourceCategory>();
    for (const item of items) {
      const productId = zohoProductIdOf(item);
      if (productId !== null && publishedIds.has(productId) && !sourceCategories.has(productId)) {
        const record = item as Record<string, unknown>;
        sourceCategories.set(productId, {
          id: text(record.category_id),
          name: text(record.category_name),
        });
      }
    }
    const imageKeys = new Set<string>();
    for (const product of selection.published) {
      for (const image of product.images) {
        const ref = imageRefs.get(image.src);
        if (ref !== undefined) {
          imageKeys.add(zohoImageKey(ref));
        }
      }
    }

    const variants = selection.published.flatMap((product) => product.variants);
    const unmappedList = [...unmapped].map(([id, count]) => `${id}x${count}`).join(",");
    log(
      `[zoho-catalog] snapshot refreshed publication=${publication} requests=${requests} ` +
        `items=${items.length} products=${products.length} published=${selection.published.length} ` +
        `unplaced=${selection.unplaced} inactive=${selection.inactive} invalid=${selection.invalid} ` +
        `variants=${variants.length} ` +
        `pricedVariants=${variants.filter((variant) => variant.pricing !== null).length} ` +
        `inStockVariants=${variants.filter((variant) => variant.inventory?.status === "in_stock").length} ` +
        `productsWithImages=${selection.published.filter((product) => product.images.length > 0).length}` +
        (unmappedList === "" ? "" : ` unmappedZohoCategories=${unmappedList}`),
    );
    return { products: selection.published, sourceCategories, imageKeys };
  };
}
