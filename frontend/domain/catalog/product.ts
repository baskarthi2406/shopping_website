import type { CatalogImage } from "./catalog-image";
import type { InventoryStatus } from "./inventory-status";
import type { ProductVariant } from "./product-variant";

/**
 * Catalog product. Pricing, SKU, tax, discounts, brand, and shipping are TBD
 * and omitted from Phase 1 fixtures — do not invent them.
 */
export type Product = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly images: readonly CatalogImage[];
  /** Empty when merchandising category is TBD (e.g. navy/tan dresses). */
  readonly categoryIds: readonly string[];
  readonly variants: readonly ProductVariant[];
  /** Null until a UOM is decided. */
  readonly uomCode: string | null;
  readonly inventoryStatus: InventoryStatus;
};
