import "server-only";
import type { PriceDisplayConfig } from "@/application/catalog";
import { readCatalogProductSource, ZOHO_CATALOG_DEMO_PRICE_DISPLAY } from "./zoho-catalog";

/**
 * Storefront price presentation. No display locale or currency is approved
 * yet (Sprint 5 Q9), so no price renders even if catalog data supplies one.
 * Set this only from a verified business decision; do not infer it from the
 * store's location. The full-catalog demo source (`zoho-demo`) alone shows
 * the verified Zoho selling price, as the frozen `/demo` flow does.
 */
export const priceDisplay: PriceDisplayConfig | null =
  readCatalogProductSource() === "zoho-demo" ? ZOHO_CATALOG_DEMO_PRICE_DISPLAY : null;
