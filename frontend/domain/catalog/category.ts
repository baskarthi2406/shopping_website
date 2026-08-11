import type { CatalogImage } from "./catalog-image";

/**
 * Storefront category. No parent/child tree — Option 1 nav is a flat list.
 * Catalog completeness and age taxonomy are TBD.
 */
export type Category = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string | null;
  /** Temporary product-photo stand-in until dedicated category art exists. */
  readonly image: CatalogImage | null;
};
