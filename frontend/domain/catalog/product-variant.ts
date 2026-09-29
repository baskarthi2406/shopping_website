import type { Inventory } from "./inventory";
import type { Pricing } from "./pricing";
import type { ProductStatus } from "./product-status";

/**
 * Generic name/value option. Size, color, age, material, style, and any future
 * option use this shape. Names are data, not TypeScript properties.
 */
export type VariantAttribute = {
  readonly name: string;
  readonly value: string;
};

/**
 * Provider-independent sellable variation. Attribute names are data-driven.
 * SKU, pricing, and inventory remain nullable until a source supplies them.
 */
export type ProductVariant = {
  readonly id: string;
  readonly sku: string | null;
  readonly attributes: readonly VariantAttribute[];
  readonly pricing: Pricing | null;
  readonly inventory: Inventory | null;
  readonly status: ProductStatus;
};
