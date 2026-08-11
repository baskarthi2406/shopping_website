import type { Product } from "@/domain/catalog";
import { isCatalogSlug } from "@/domain/catalog";
import type { ProductRecord } from "./data/product-records";

export function mapProduct(record: ProductRecord): Product {
  if (!isCatalogSlug(record.slug)) {
    throw new Error(`Invalid product slug: ${record.slug}`);
  }

  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    description: record.description,
    images: record.images,
    categoryIds: record.categoryIds,
    variants: [{ id: `${record.id}-default` }],
    uomCode: null,
    inventoryStatus: "unknown",
  };
}
