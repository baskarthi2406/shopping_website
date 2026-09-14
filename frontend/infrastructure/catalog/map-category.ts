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
    parentId: record.parentId,
    children: [],
    visibility: record.visibility,
    showInMenu: record.showInMenu,
    description: record.description,
    image: record.image,
  };
}

/**
 * Maps a flat record set to record-order categories with recursively populated
 * children. Shared object references keep each category consistent whether it
 * is read from `list()` or through an ancestor.
 */
export function mapCategories(
  records: readonly CategoryRecord[],
): readonly Category[] {
  const recordsById = new Map<string, CategoryRecord>();
  const childrenByParentId = new Map<string, CategoryRecord[]>();

  for (const record of records) {
    if (recordsById.has(record.id)) {
      throw new Error(`Duplicate category id: ${record.id}`);
    }
    recordsById.set(record.id, record);

    if (record.parentId !== null) {
      const siblings = childrenByParentId.get(record.parentId) ?? [];
      siblings.push(record);
      childrenByParentId.set(record.parentId, siblings);
    }
  }

  for (const record of records) {
    if (record.parentId !== null && !recordsById.has(record.parentId)) {
      throw new Error(
        `Unknown parent category ${record.parentId} for ${record.id}`,
      );
    }
  }

  const mappedById = new Map<string, Category>();

  function mapNode(record: CategoryRecord, ancestors: ReadonlySet<string>): Category {
    const mapped = mappedById.get(record.id);
    if (mapped) {
      return mapped;
    }
    if (ancestors.has(record.id)) {
      throw new Error(`Category hierarchy cycle at ${record.id}`);
    }

    const nextAncestors = new Set(ancestors);
    nextAncestors.add(record.id);
    const children = (childrenByParentId.get(record.id) ?? []).map((child) =>
      mapNode(child, nextAncestors),
    );
    const category = { ...mapCategory(record), children };
    mappedById.set(record.id, category);
    return category;
  }

  return records.map((record) => mapNode(record, new Set()));
}
