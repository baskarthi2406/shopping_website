import type { CatalogImage } from "./catalog-image";

/**
 * Storefront category hierarchy. `children` is derived from `parentId` by the
 * repository mapper so callers can render arbitrary navigation depth.
 */
export type CategoryVisibility = "visible" | "hidden";

export type Category = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly parentId: string | null;
  readonly children: readonly Category[];
  readonly visibility: CategoryVisibility;
  readonly showInMenu: boolean;
  readonly description: string | null;
  /** Temporary product-photo stand-in until dedicated category art exists. */
  readonly image: CatalogImage | null;
};
