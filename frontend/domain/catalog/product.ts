import type { CatalogImage } from "./catalog-image";
import type { Inventory } from "./inventory";
import type { Pricing } from "./pricing";
import type { ProductStatus } from "./product-status";
import type { ProductVariant } from "./product-variant";
import type { Uom } from "./uom";

/**
 * Product fields shared by catalog lists and product details.
 */
export type ProductSummary = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly images: readonly CatalogImage[];
  /** Empty when merchandising category is TBD (e.g. navy/tan dresses). */
  readonly categoryIds: readonly string[];
  /** Product-level SKU; nullable when variants own SKU or no SKU is supplied. */
  readonly sku: string | null;
  readonly uom: Uom | null;
  readonly pricing: Pricing | null;
  readonly inventory: Inventory | null;
  readonly status: ProductStatus;
};

/** Full product detail, including zero or more real variants. */
export type Product = ProductSummary & {
  readonly variants: readonly ProductVariant[];
};
