import "server-only";
import {
  toDemoProductViewModels,
  type DemoProductViewModel,
} from "@/application/checkout/demo-catalog-view-model";
import {
  getZohoDemo,
  isZohoDemoEnabled,
  ZOHO_DEMO_ITEM_LIMIT,
  ZOHO_DEMO_PRICE_DISPLAY,
} from "@/config/zoho-demo";

/**
 * Provider-neutral facade for demo pages: presentation code depends on this
 * module, never on the provider adapter or its configuration.
 */
export const demoStore = {
  /** Shown in demo copy, e.g. "Products from Zoho". */
  providerLabel: "Zoho",

  isEnabled(): boolean {
    return isZohoDemoEnabled();
  },

  /** Live demo catalog, or null when disabled or the provider is unavailable. */
  async loadProducts(): Promise<DemoProductViewModel[] | null> {
    const demo = getZohoDemo();
    if (demo === null) return null;
    try {
      const products = await demo.gateway.listProducts(ZOHO_DEMO_ITEM_LIMIT);
      return toDemoProductViewModels(products, ZOHO_DEMO_PRICE_DISPLAY);
    } catch (error) {
      console.error(`[demo] product load failed: ${error instanceof Error ? error.name : "unknown"}`);
      return null;
    }
  },
};
