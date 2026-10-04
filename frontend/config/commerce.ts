import "server-only";
import type { PriceDisplayConfig } from "@/application/catalog";
import {
  isZohoCatalogSource,
  readCatalogProductSource,
  ZOHO_CATALOG_DEMO_PRICE_DISPLAY,
  type CatalogProductSource,
} from "./zoho-catalog";

/**
 * Storefront price presentation for a catalog source. The static fixture
 * catalog still hides prices. Both Zoho sources (`zoho-snapshot` and
 * `zoho-demo`) may show a verified INR selling price. Whether that price
 * includes GST is still unresolved, and `label_rate` is never a compare-at
 * price. Do not infer a currency from the store's location.
 */
export function priceDisplayFor(source: CatalogProductSource): PriceDisplayConfig | null {
  return isZohoCatalogSource(source) ? ZOHO_CATALOG_DEMO_PRICE_DISPLAY : null;
}

/** Price presentation for the process catalog source. */
export const priceDisplay: PriceDisplayConfig | null = priceDisplayFor(readCatalogProductSource());
