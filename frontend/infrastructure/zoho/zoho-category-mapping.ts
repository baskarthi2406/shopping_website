import "server-only";

/**
 * Zoho POS → Mini Mystiq storefront category placement
 * (`docs/project/CATEGORY-MAPPING-DESIGN.md`). The storefront tree stays the
 * customer-facing taxonomy; Zoho's own tree is not adopted.
 *
 * Keys are Zoho IDs only, never names: Zoho repeats names such as "Kids",
 * "Boys", "Girls", "Feeding" and "Women" across its tree. Each product gets
 * exactly one placement. A product whose group and category are both
 * unlisted is unmapped and appears in no category listing.
 *
 * Only placements the design marks as unambiguous are listed. Zoho
 * categories awaiting an owner decision (Unisex-Jb, Bath Care, Skin Care,
 * Nursery, Night Wear, Kids and its children, Inner Wears › Kids, Panties,
 * Bra, Palazzo, Toys) stay unmapped rather than guessed.
 */

export type ZohoCategoryMapping = {
  readonly zohoCategoryId: string;
  readonly storefrontCategoryId: string;
};

export type ZohoItemGroupOverride = {
  readonly zohoItemGroupId: string;
  readonly storefrontCategoryId: string;
};

export const ZOHO_CATEGORY_MAPPINGS: readonly ZohoCategoryMapping[] = [
  // Baby Essentials › Feeding
  { zohoCategoryId: "4273340000000037021", storefrontCategoryId: "baby-essentials-feeding" },
  // Baby Essentials › Grooming
  { zohoCategoryId: "4273340000000040043", storefrontCategoryId: "baby-essentials-grooming" },
  // Baby Essentials › Bottles & Zippers
  { zohoCategoryId: "4273340000000040046", storefrontCategoryId: "baby-essentials-bottles-zippers" },
  // Just born › Baby Boy
  { zohoCategoryId: "4273340000000034551", storefrontCategoryId: "infants-baby-boy" },
  // Women › Feeding
  { zohoCategoryId: "4273340000000040049", storefrontCategoryId: "women-feeding" },
  // Women › Co-Ord Set
  { zohoCategoryId: "4273340000000034557", storefrontCategoryId: "women-co-ord-set" },
  // Women › Tops
  { zohoCategoryId: "4273340000000034560", storefrontCategoryId: "women-tops" },
  // Women › Blouse Materials
  { zohoCategoryId: "4273340000000036021", storefrontCategoryId: "women-blouse-materials" },
  // Women › Western Wear › Leggings
  { zohoCategoryId: "4273340000000040052", storefrontCategoryId: "women-leggings" },
  // Women › Western Wear › Straight Cut
  { zohoCategoryId: "4273340000000040059", storefrontCategoryId: "women-straight-cut-pants" },
  // Women › Sarees › Silk Sarees
  { zohoCategoryId: "4273340000000036030", storefrontCategoryId: "women-sarees" },
  // Women › Sarees › Cotton Sarees
  { zohoCategoryId: "4273340000000037027", storefrontCategoryId: "women-sarees" },
  // Inner Wears › Women › Inskirt
  { zohoCategoryId: "4273340000000040073", storefrontCategoryId: "women-in-skirt" },
];

/**
 * Only for Zoho categories coarser than the storefront leaf. Zoho "Baby
 * Girl" also holds "Party frock" (Frock vs Party Wear undecided), so the
 * category itself stays unmapped.
 */
export const ZOHO_ITEM_GROUP_OVERRIDES: readonly ZohoItemGroupOverride[] = [
  // "Girl Coord set" (Zoho category Just born › Baby Girl)
  { zohoItemGroupId: "4273340000000040344", storefrontCategoryId: "infants-baby-girl-co-ord-set" },
];

export type ZohoPlacementSource = {
  readonly groupId: string | null;
  readonly categoryId: string | null;
};

/** Storefront category for a Zoho product, or null when it cannot be placed safely. */
export type ZohoCategoryResolver = (source: ZohoPlacementSource) => string | null;

export function createZohoCategoryResolver(
  mappings: readonly ZohoCategoryMapping[] = ZOHO_CATEGORY_MAPPINGS,
  overrides: readonly ZohoItemGroupOverride[] = ZOHO_ITEM_GROUP_OVERRIDES,
): ZohoCategoryResolver {
  const byCategory = new Map(mappings.map((entry) => [entry.zohoCategoryId, entry.storefrontCategoryId]));
  const byGroup = new Map(overrides.map((entry) => [entry.zohoItemGroupId, entry.storefrontCategoryId]));
  return ({ groupId, categoryId }) =>
    (groupId === null ? undefined : byGroup.get(groupId)) ??
    (categoryId === null ? undefined : byCategory.get(categoryId)) ??
    null;
}

const ZOHO_ID = /^\d{1,30}$/;

/** Configuration errors; empty when the mapping is consistent with the storefront tree. */
export function validateZohoCategoryMapping(
  storefrontCategoryIds: ReadonlySet<string>,
  mappings: readonly ZohoCategoryMapping[] = ZOHO_CATEGORY_MAPPINGS,
  overrides: readonly ZohoItemGroupOverride[] = ZOHO_ITEM_GROUP_OVERRIDES,
): string[] {
  const errors: string[] = [];
  const check = (kind: string, key: string, target: string, seen: Set<string>) => {
    if (!ZOHO_ID.test(key)) errors.push(`${kind} key "${key}" is not a Zoho ID`);
    if (seen.has(key)) errors.push(`${kind} key "${key}" is listed more than once`);
    if (!storefrontCategoryIds.has(target)) {
      errors.push(`${kind} key "${key}" targets unknown storefront category "${target}"`);
    }
    seen.add(key);
  };
  const categoryKeys = new Set<string>();
  for (const entry of mappings) check("category", entry.zohoCategoryId, entry.storefrontCategoryId, categoryKeys);
  const groupKeys = new Set<string>();
  for (const entry of overrides) check("group", entry.zohoItemGroupId, entry.storefrontCategoryId, groupKeys);
  return errors;
}
