import type { Category } from "@/domain/catalog";
import { isCatalogSlug } from "@/domain/catalog";
import type { CategoryRecord } from "./data/category-records";

export function mapCategory(record: CategoryRecord): Category {
  if (!isCatalogSlug(record.slug)) {
    throw new Error(`Invalid category slug: ${record.slug}`);
  }

  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    description: record.description,
    image: record.image,
  };
}
