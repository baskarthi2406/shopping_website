import type { PriceDisplayConfig } from "@/application/catalog";

/**
 * Storefront price presentation. No display locale or currency is approved
 * yet (Sprint 5 Q9), so no price renders even if catalog data supplies one.
 * Set this only from a verified business decision; do not infer it from the
 * store's location.
 */
export const priceDisplay: PriceDisplayConfig | null = null;
