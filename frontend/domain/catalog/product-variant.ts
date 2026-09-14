import type { Inventory } from "./inventory";
import type { Pricing } from "./pricing";
import type { ProductStatus } from "./product-status";

/** Generic name/value option such as Size=0-3M or Color=Pink. */
export type VariantAttribute = {
  readonly name: string;
  readonly value: string;
};

/** Provider-independent sellable variation. Attribute names are data-driven. */
export type ProductVariant = {
  readonly id: string;
  readonly sku: string | null;
  readonly attributes: readonly VariantAttribute[];
  readonly pricing: Pricing | null;
  readonly inventory: Inventory | null;
  readonly status: ProductStatus;
};
