import { describe, expect, it } from "vitest";
import { categoryRecords } from "@/infrastructure/catalog/data/category-records";
import {
  createZohoCategoryResolver,
  validateZohoCategoryMapping,
  ZOHO_CATEGORY_MAPPINGS,
  ZOHO_ITEM_GROUP_OVERRIDES,
} from "./zoho-category-mapping";

const storefrontIds = new Set(categoryRecords.map((record) => record.id));

/** Observed Zoho IDs (read-only catalog, 2026-10-04). */
const ZOHO = {
  womenCoOrdSet: "4273340000000034557",
  babyGirl: "4273340000000037018",
  babyEssentialsFeeding: "4273340000000037021",
  womenFeeding: "4273340000000040049",
  silkSarees: "4273340000000036030",
  cottonSarees: "4273340000000037027",
  girlCoordSetGroup: "4273340000000040344",
  partyFrockGroup: "4273340000000054198",
};

/** Synthetic IDs standing in for Zoho categories/groups that are not mapped (e.g. Kids, Kids › Boys). */
const UNMAPPED = { kidsCategory: "900000000000001", kidsBoysCategory: "900000000000002", group: "900000000000003" };

describe("committed Zoho category mapping", () => {
  it("targets only existing storefront categories, with one entry per Zoho ID", () => {
    expect(validateZohoCategoryMapping(storefrontIds)).toEqual([]);
    expect(ZOHO_CATEGORY_MAPPINGS.length).toBeGreaterThan(0);
  });

  it("keeps the storefront tree unchanged: every target is an existing category ID", () => {
    for (const entry of [...ZOHO_CATEGORY_MAPPINGS, ...ZOHO_ITEM_GROUP_OVERRIDES]) {
      expect(storefrontIds.has(entry.storefrontCategoryId), entry.storefrontCategoryId).toBe(true);
    }
  });
});

describe("createZohoCategoryResolver (committed mapping)", () => {
  const resolve = createZohoCategoryResolver();

  it("places the Co-Ord Set cases by ID, never by name", () => {
    expect(resolve({ groupId: UNMAPPED.group, categoryId: ZOHO.womenCoOrdSet })).toBe(
      "women-co-ord-set",
    );
    expect(resolve({ groupId: ZOHO.girlCoordSetGroup, categoryId: ZOHO.babyGirl })).toBe(
      "infants-baby-girl-co-ord-set",
    );
    expect(resolve({ groupId: UNMAPPED.group, categoryId: UNMAPPED.kidsBoysCategory })).toBeNull();
    expect(resolve({ groupId: UNMAPPED.group, categoryId: UNMAPPED.kidsCategory })).toBeNull();
  });

  it("leaves a coarse category unmapped when only some of its groups are approved", () => {
    expect(resolve({ groupId: ZOHO.partyFrockGroup, categoryId: ZOHO.babyGirl })).toBeNull();
  });

  it("distinguishes Zoho categories that share a name", () => {
    expect(resolve({ groupId: null, categoryId: ZOHO.babyEssentialsFeeding })).toBe(
      "baby-essentials-feeding",
    );
    expect(resolve({ groupId: null, categoryId: ZOHO.womenFeeding })).toBe("women-feeding");
  });

  it("merges several Zoho categories into one storefront category where approved", () => {
    expect(resolve({ groupId: null, categoryId: ZOHO.silkSarees })).toBe("women-sarees");
    expect(resolve({ groupId: null, categoryId: ZOHO.cottonSarees })).toBe("women-sarees");
  });

  it("returns null for unknown or missing IDs", () => {
    expect(resolve({ groupId: null, categoryId: "4273340000000099999" })).toBeNull();
    expect(resolve({ groupId: null, categoryId: null })).toBeNull();
  });
});

describe("createZohoCategoryResolver (injected mapping)", () => {
  const resolve = createZohoCategoryResolver(
    [{ zohoCategoryId: "10", storefrontCategoryId: "women" }],
    [{ zohoItemGroupId: "20", storefrontCategoryId: "kids" }],
  );

  it("prefers the group override over the category mapping", () => {
    expect(resolve({ groupId: "20", categoryId: "10" })).toBe("kids");
    expect(resolve({ groupId: "21", categoryId: "10" })).toBe("women");
    expect(resolve({ groupId: "20", categoryId: null })).toBe("kids");
  });

  it("does not match by name-like or partial keys", () => {
    expect(resolve({ groupId: null, categoryId: "1" })).toBeNull();
    expect(resolve({ groupId: null, categoryId: "Women" })).toBeNull();
  });
});

describe("validateZohoCategoryMapping", () => {
  it("reports unknown targets, duplicate keys, and non-ID keys", () => {
    const errors = validateZohoCategoryMapping(
      new Set(["women"]),
      [
        { zohoCategoryId: "10", storefrontCategoryId: "women" },
        { zohoCategoryId: "10", storefrontCategoryId: "women" },
        { zohoCategoryId: "Co-Ord Set", storefrontCategoryId: "women" },
        { zohoCategoryId: "11", storefrontCategoryId: "missing" },
      ],
      [{ zohoItemGroupId: "", storefrontCategoryId: "women" }],
    );
    expect(errors).toEqual([
      'category key "10" is listed more than once',
      'category key "Co-Ord Set" is not a Zoho ID',
      'category key "11" targets unknown storefront category "missing"',
      'group key "" is not a Zoho ID',
    ]);
  });
});
