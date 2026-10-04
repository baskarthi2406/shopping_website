# Category / Subcategory Mapping Design

Status: **DESIGN APPROVED; PARTIALLY IMPLEMENTED** (2026-10-04). The
high-confidence rows and the Girl Coord set group override are implemented
in `frontend/infrastructure/zoho/zoho-category-mapping.ts` (see section 7).
No URL or Zoho change. P0-6 in `PRODUCTION-DECISIONS.md`.

Evidence: storefront records in
`frontend/infrastructure/catalog/data/category-records.ts` and
`product-records.ts`; read-only Zoho calls (all `GET`, HTTP 200):
`/inventory/v1/items?page=1&per_page=200` (157 items, `has_more_page:
false` — the full active catalog) and `/inventory/v1/categories` (45
entries). Probed and absent: `/inventory/v1/itemcategories`,
`/inventory/v1/settings/categories` (404). IDs are masked (`…1234`).

## 1. Current Storefront Hierarchy

Source: `category-records.ts` (S4-T02 customer reference). Every record has
`slug` = `id`, `visibility: "visible"`, `showInMenu: true`, no description.
There is **no ordering field**; order is array order (shown top to bottom).
Root categories have `parentId: null`; child `parentId` is the parent's ID.

```
baby-essentials            Baby Essentials
├── baby-essentials-feeding            Feeding
├── baby-essentials-shampoo            Shampoo
├── baby-essentials-soap               Soap
├── baby-essentials-body-lotion        Body Lotion
├── baby-essentials-body-wash          Body Wash
├── baby-essentials-cleansers          Cleansers
├── baby-essentials-wet-wipes          Wet Wipes
├── baby-essentials-mattress           Mattress
├── baby-essentials-baby-booties       Baby Booties
├── baby-essentials-grooming           Grooming
├── baby-essentials-bottles-zippers    Bottles & Zippers
└── baby-essentials-bed-protector-mat  Bed Protector Mat
infants                    Infants
├── infants-baby-girl                  Baby Girl
│   ├── infants-baby-girl-frock        Frock
│   ├── infants-baby-girl-pant-top     Pant & Top
│   ├── infants-baby-girl-co-ord-set   Co-Ord Set
│   ├── infants-baby-girl-t-shirts     T-Shirts
│   ├── infants-baby-girl-skirt-top    Skirt & Top
│   ├── infants-baby-girl-party-wear   Party Wear
│   ├── infants-baby-girl-jeans        Jeans
│   ├── infants-baby-girl-inner-wear   Inner Wear
│   └── infants-baby-girl-ethnic-wear  Ethnic Wear
└── infants-baby-boy                   Baby Boy
    ├── infants-baby-boy-t-shirt       T-Shirt
    ├── infants-baby-boy-co-ord-set    Co-Ord Set
    ├── infants-baby-boy-jeans         Jeans
    ├── infants-baby-boy-ethnic-wear   Ethnic Wear
    ├── infants-baby-boy-shirts        Shirts
    ├── infants-baby-boy-pants         Pants
    ├── infants-baby-boy-trousers      Trousers
    └── infants-baby-boy-inner-wear    Inner Wear
kids                       Kids            (no subcategories)
teens                      Teens           (no subcategories)
women                      Women
├── women-feeding          Feeding
├── women-nighties         Nighties
├── women-kurtis           Kurtis
├── women-co-ord-set       Co-Ord Set
├── women-churidhar        Churidhar
├── women-tops             Tops
├── women-short-tops       Short tops
├── women-sarees           Sarees
├── women-inner-wears      Inner Wears
├── women-in-skirt         In skirt
├── women-blouse-materials Blouse Materials
├── women-churidhar-materials Churidhar Materials
├── women-leggings         Leggings
└── women-straight-cut-pants  Straight Cut Pants
kids-wear                  Kid's Wear      (no subcategories)
boys-wear                  Boy's Wear      (no subcategories)
girls-wear                 Girl's Wear     (no subcategories)
boutique                   Boutique        (no subcategories)
```

Products: 12 static development products; 7 assigned (`baby-essentials` ×4,
`kids` ×3), 5 with `categoryIds: []`. No Zoho product is in this data.
Depth is up to 3 levels (Infants › Baby Girl › Co-Ord Set).

## 2. Current Zoho Category Vocabulary

**Finding: Zoho has its own category tree.** `GET /inventory/v1/categories`
returns 45 categories with `category_id`, `name`, `parent_category_id`,
`depth`, `sibling_order`, `visibility`, `show_in_menu`, `url`,
`has_active_items`. All are `visibility: true`, `show_in_menu: true`. Every
item carries exactly one `category_id`/`category_name`; all 157 items are
`active`, all have a group (49 groups) and a category, and **no group mixes
categories** (each product has one Zoho category).

Zoho tree (items per category in brackets; `—` = no active items):

```
Just born (…7012)                — 
├── Baby Girl (…7018)            [8]  Girl Coord set, Party frock
├── Baby Boy (…4551)             —
└── Unisex-Jb (…4566)            [3]  Muslin jabla set, Romper
Baby Essentials (…7015)          —
├── Feeding (…7021)              —
├── Bath Care (…4554)            [3]  Seba Med Cleansing Bar, TediBar Bathing Soap, Tedibar Shampoo
├── Skin Care (…0038)            [2]  Cetaphil Body lotion, Tedi bar Body Lotion
├── Grooming (…0043)             [2]  Electric Nail trimmer
├── Bottles & Zippers (…0046)    [1]  Luvlap Zippers
└── Nursery (…6018)              [3]  Baby Bed Carrying, Baby bed with net, Eva Mat
Women (…6015)                    —
├── Feeding (…0049)              [4]  Feeding kurti
├── Co-Ord Set (…4557)           [8]  2pc kurti
├── Tops (…4560)                 [8]  Kurti top
├── Blouse Materials (…6021)     [2]  Blouse, Kalamkari blouse
├── Western Wear (…4563)         —
│   ├── Leggings (…0052)         [22] Leggings
│   ├── Palazzo (…7024)          —
│   └── Straight Cut (…0059)     [12] Straight pant
├── Night Wear (…6024)           [2]  Feeding nighty
└── Sarees (…6027)               —
    ├── Silk Sarees (…6030)      [2]  saree
    └── Cotton Sarees (…7027)    [2]  Kattam saree
Kids (…0006)                     [2]  Coord Set (sizes XXL) — assigned to the top level
├── Girls (…0062)                [6]  frock (e.g. 10-11y)
├── Boys (…0065)                 [4]  Coord set, Coord set 1
└── Unisex - Kids (…4569)        [3]  Trouser (e.g. 2-3y)
Inner Wears (…4572)              —
├── Kids (…6033)                 —
│   ├── Girls (…4575)            —
│   └── Boys (…7030)             [4]  Boys vest (e.g. 55cm)
└── Women (…6036)                —
    ├── Panties (…0070)          [18] Womens panties
    ├── Bra (…4581)              [15] Womens bra
    └── Inskirt (…0073)          [4]  inskirt
Toys (…6115)                     —
├── Educational Toys (…4775)     [4]
├── Mini Cars (…0294)            [2]
├── Construction (…7040)         [2]
├── Remote Control (…7043)       [3]
├── Soft Toys (…0303)            [2]
├── Activity Toys (…7048)        [2]
└── Ride On (…6118)              [2]
```

**Names are not unique:** "Kids" (…0006, …6033), "Girls" (…0062, …4575),
"Boys" (…0065, …7030), "Feeding" (…7021, …0049), "Women" (…6015, …6036).
Zoho's own `url` values deduplicate with suffixes (`feeding_1`, `kids_1`,
`women_1`). Two different groups are both named "Coord set"/"Coord Set".

Representative sample (one item per used category; full 157-item sample was
read but not stored in the repository):

| Item | Group | SKU | Zoho category | Size | Color | Group ID | Status |
|---|---|---|---|---|---|---|---|
| …0339 | Girl Coord set | GIR-0-3-PIN | Baby Girl (…7018) | 0-3M | Pink | …0344 | active |
| …0375 | Muslin jabla set | — | Unisex-Jb (…4566) | — | — | …0378 | active |
| …1257 | Seba Med Cleansing Bar | — | Bath Care (…4554) | — | — | …1256 | active |
| …1571 | Cetaphil Body lotion | — | Skin Care (…0038) | — | — | …1570 | active |
| …1511 | Electric Nail trimmer | ELE-GRE | Grooming (…0043) | — | Green | …1509 | active |
| …1203 | Luvlap Zippers | — | Bottles & Zippers (…0046) | — | — | …1206 | active |
| …1155 | Baby Bed Carrying | — | Nursery (…6018) | — | — | …1158 | active |
| …7679 | Feeding kurti | FEE-L-GRE | Feeding (…0049, Women) | L | Green | …7687 | active |
| …8537 | 2pc kurti | 2PC-L-PIN | Co-Ord Set (…4557) | L | Pink | …8549 | active |
| …7651 | Kurti top | KUR-L-BLU | Tops (…4560) | L | Blue | …7665 | active |
| …4008 | Blouse | — | Blouse Materials (…6021) | — | — | …4007 | active |
| …0462 | Leggings | — | Leggings (…0052) | L | Black | …0493 | active |
| …7348 | Straight pant | STR-L-BLA | Straight Cut (…0059) | L | Black | …7366 | active |
| …7608 | Feeding nighty | FEE-FL-BLU | Night Wear (…6024) | FL | Blue | …7612 | active |
| …7516 | saree | GUL-PAS | Silk Sarees (…6030) | — | Pastel blue | …7520 | active |
| …4050 | Kattam saree | KAT-ORA | Cotton Sarees (…7027) | — | Orange | …4052 | active |
| …6058 | Coord Set | COO-GRE-XXL | Kids (…0006, top level) | XXL | Green | …6060 | active |
| …4123 | frock | FRO-10--ROS | Girls (…0062) | 10-11y | Rose | …4127 | active |
| …0156 | Coord set | COO-BLU | Boys (…0065) | — | Blue | …0160 | active |
| …4251 | Trouser | TRO-2-3-WHI | Unisex - Kids (…4569) | 2-3y | White with orange | …4257 | active |
| …4288 | Boys vest | BOY-55C-WHI | Boys (…7030, Inner Wears › Kids) | 55cm | White | …4296 | active |
| …8045 | Womens panties | WOM-100-BLA | Panties (…0070) | 100cm | Black | …8049 | active |
| …8489 | Womens bra | WOM-100-GRE | Bra (…4581) | 100cm | Green | …8479 | active |
| …8862 | inskirt | INS-7PA1 | Inskirt (…0073) | 7part | Blue | …8864 | active |
| …7024 | 8-in-1 Activity Triangle Toy | — | Educational Toys (…4775) | — | — | …7027 | active |
| …7460 | Die-Cast Car | — | Mini Cars (…0294) | — | — | …7459 | active |
| …1381 | Bulldozer Set | — | Construction (…7040) | — | — | …1384 | active |
| …4895 | FLYI Super RC Car | — | Remote Control (…7043) | — | — | …4898 | active |
| …7251 | Gorilla Soft Plush Toy | — | Soft Toys (…0303) | — | — | …7250 | active |
| …7299 | Hex Snap Puzzle Blocks | — | Activity Toys (…7048) | — | — | …7302 | active |
| …4984 | Buzz Rider car | — | Ride On (…6118) | — | — | …4987 | active |

51 of 157 items have no SKU (mostly single-item toys/essentials, and Leggings).

## 3. Mapping Analysis

Confidence: **High** = same name under an equivalent parent, one obvious
target. **Medium** = plausible target but a merge/split or naming difference.
**Low/None** = no clear target or depends on facts Zoho does not hold.

| Zoho value (ID) | Storefront destination (candidate) | Confidence | Ambiguity |
|---|---|---|---|
| Baby Girl (…7018) | `infants-baby-girl` (or its leaves) | Medium | Zoho has no 3rd level; storefront leaves (Co-Ord Set, Frock, Party Wear…) need per-group placement. "Party frock" could be Frock or Party Wear. |
| Baby Boy (…4551) | `infants-baby-boy` | High | No active items. |
| Unisex-Jb (…4566) | None | None | Storefront has no unisex infant category; Baby Girl and Baby Boy both plausible. |
| Feeding (…7021, Baby Essentials) | `baby-essentials-feeding` | High | No active items. |
| Bath Care (…4554) | `baby-essentials-soap` / `-shampoo` / `-cleansers` / `-body-wash` | Low | One Zoho category spans several storefront leaves; per-group placement needed. |
| Skin Care (…0038) | `baby-essentials-body-lotion` | Medium | Current items are body lotions; the category is broader. |
| Grooming (…0043) | `baby-essentials-grooming` | High | — |
| Bottles & Zippers (…0046) | `baby-essentials-bottles-zippers` | High | — |
| Nursery (…6018) | `baby-essentials-mattress` / `-bed-protector-mat` / none | Low | Baby beds and Eva mat have no exact storefront leaf. |
| Feeding (…0049, Women) | `women-feeding` | High | — |
| Co-Ord Set (…4557, Women) | `women-co-ord-set` | High | — |
| Tops (…4560) | `women-tops` | High | "Kurti top" items could also fit `women-kurtis`/`women-short-tops`; name-based only. |
| Blouse Materials (…6021) | `women-blouse-materials` | High | — |
| Leggings (…0052) | `women-leggings` | High | Western Wear level dropped. |
| Straight Cut (…0059) | `women-straight-cut-pants` | High | Western Wear level dropped. |
| Palazzo (…7024) | None | None | No storefront category; no active items. |
| Night Wear (…6024) | `women-nighties` | Medium | Only item is a feeding nighty; `women-feeding` also plausible. |
| Silk Sarees (…6030), Cotton Sarees (…7027) | `women-sarees` | High (merge) | Storefront has no saree sub-types. |
| Kids (…0006, items on top level) | `kids` | Low | Items are "Coord Set" in XXL; age band and gender not established. |
| Girls (…0062, Kids) | `kids` / `girls-wear` / `teens` | Low | Storefront `kids` has no Girls/Boys level; sizes (e.g. 10-11y) span Kids/Teens. |
| Boys (…0065, Kids) | `kids` / `boys-wear` | Low | Same as above. |
| Unisex - Kids (…4569) | `kids` / `kids-wear` | Low | Sizes include 2-3y (could be Infants). |
| Boys (…7030, Inner Wears › Kids) | `infants-baby-boy-inner-wear` / `kids` / none | Low | Storefront has kids inner wear only under Infants. |
| Girls (…4575, Inner Wears › Kids) | `infants-baby-girl-inner-wear` / none | Low | No active items. |
| Panties (…0070), Bra (…4581) | `women-inner-wears` | Medium (merge) | Two Zoho leaves into one storefront leaf. |
| Inskirt (…0073) | `women-in-skirt` | High | — |
| Toys and its 7 subcategories | None | None | Storefront has no Toys category. 19 active items. |

Storefront categories with **no Zoho source** today: `teens`, `kids-wear`,
`boys-wear`, `girls-wear`, `boutique`; `baby-essentials-` body-wash,
wet-wipes, baby-booties (and mattress/bed-protector-mat unless Nursery maps);
`infants-baby-girl-` pant-top, t-shirts, skirt-top, jeans, inner-wear,
ethnic-wear; every `infants-baby-boy-*` leaf (Zoho Baby Boy has no items);
`women-` kurtis, churidhar, short-tops, churidhar-materials.

## 4. Ambiguous Cases

1. **Co-Ord Set.** Within Zoho there is **no** ambiguity: co-ord products sit
   in four distinct category IDs — Baby Girl (…7018, "Girl Coord set"), Kids
   › Boys (…0065, "Coord set", "Coord set 1"), Kids top level (…0006, "Coord
   Set", XXL) and Women › Co-Ord Set (…4557, "2pc kurti"). The ambiguity
   appears only if mapping uses **names**: the storefront has three
   "Co-Ord Set" leaves (`infants-baby-girl-`, `infants-baby-boy-`,
   `women-co-ord-set`), and only Women's has a Zoho category of that name.
   Baby Girl's co-ord set needs a group-level placement (its Zoho category
   also holds "Party frock"); the Kids co-ord sets have no storefront Co-Ord
   Set target at all; `infants-baby-boy-co-ord-set` has no Zoho source.
2. **Duplicate Zoho names** ("Kids", "Girls", "Boys", "Feeding", "Women"):
   any name-keyed mapping is unsafe.
3. **Coarser Zoho categories** than storefront leaves: Baby Girl, Bath Care,
   Nursery, Skin Care — placement depends on the specific product (group).
4. **Age/gender only in names or sizes:** "Girl Coord set", "Boys vest",
   "Womens bra", sizes 0-3M / 2-3y / 10-11y / XXL / 55cm. Not usable for
   automatic placement.
5. **Kids structure mismatch:** Zoho Kids has Girls/Boys/Unisex subcategories
   (and items on the top level); storefront `kids` is a leaf, with separate
   top-level Kid's Wear / Boy's Wear / Girl's Wear / Teens.
6. **Unisex:** Unisex-Jb and Unisex - Kids have no storefront equivalent.
7. **Merges:** Silk + Cotton Sarees → Sarees; Panties + Bra → Inner Wears;
   Western Wear level dropped.
8. **Zoho with no storefront home:** Toys (7 subcategories, 19 items),
   Palazzo, Unisex-Jb.
9. **Storefront with no Zoho products:** see the list under §3; these pages
   would be empty.

## 5. Recommended Mapping Model

**Additional merchandising mapping is required.** The Zoho data uniquely
identifies each product's Zoho category, but it cannot uniquely determine the
storefront `Category → Subcategory` for every product: several Zoho
categories are coarser than storefront leaves, some have no target, and
age/gender exists only in names and sizes.

Options evaluated:

| Option | Verdict |
|---|---|
| 1. Zoho category **name** → storefront category | Rejected: duplicate names (Kids, Boys, Girls, Feeding, Women). |
| 2. Zoho **category ID** → one storefront category/subcategory | Covers every High/Medium row in one entry per category. Insufficient alone for coarse categories (Baby Girl, Bath Care, Nursery). |
| 3. Zoho **item group** → storefront subcategory only | Unambiguous but one entry per product (49 today), and every new product needs a code change. |
| 4. Explicit item/group ID → category | Same as 3 at item granularity; items are variants, so group is the right unit. |
| 5. **Category ID with group-ID overrides** | **Recommended.** |
| 6. Adopt Zoho's category tree as the storefront taxonomy | Viable alternative (Zoho already has hierarchy, order, visibility), but it replaces the storefront tree and its URLs — an owner decision (D13), not a mapping. |

Recommended (option 5), smallest model that avoids ambiguity:

- Keyed by **Zoho IDs only**, never names.
- `category_id → storefront category ID` (one target per Zoho category).
- `group_id → storefront category ID` overrides, used only where a Zoho
  category is coarser than the storefront leaf (e.g. Girl Coord set →
  `infants-baby-girl-co-ord-set`).
- Resolution: group override → category mapping → otherwise **unmapped**.
- Exactly one storefront placement per product (see §8).
- Zoho renames are harmless (IDs); new Zoho categories are unmapped until
  added.

If the owner chooses option 6 instead, the mapping work is replaced by a
taxonomy migration (URLs and navigation change); this document's mapping
table would then be unnecessary.

## 6. Required Owner Decisions

1. **Taxonomy source:** keep the current storefront tree and map Zoho into
   it (recommended model), or adopt Zoho's category tree as the storefront
   navigation (D13)?
2. **Placement for each Zoho category** in §3 — especially the Low/None rows:
   Unisex-Jb; Bath Care (split by product?); Nursery; Night Wear (Nighties or
   Feeding?); Kids top-level items; Kids › Girls / Boys / Unisex - Kids (Kids,
   Teens, Girl's Wear, Boy's Wear, or Kid's Wear?); Inner Wears › Kids › Boys.
3. **Co-Ord Sets:** confirm Women › Co-Ord Set → `women-co-ord-set` and
   Girl Coord set → `infants-baby-girl-co-ord-set`; where should the Kids
   co-ord sets ("Coord set", "Coord set 1", "Coord Set" XXL) appear?
4. **Toys:** add a storefront Toys category, or do not sell toys online?
5. **Single vs multiple placement:** may one product appear in more than one
   category (e.g. a co-ord set under both Women and a collection)?
6. **Parent category pages:** should Infants / Baby Girl / Women pages list
   all products from their subcategories, or only directly assigned products
   (D15; current behavior is direct only)?
7. **Empty storefront categories** (Teens, Kid's Wear, Boy's Wear, Girl's
   Wear, Boutique and the leaves listed in §3): hide until products exist, or
   show empty?
8. **Who maintains placement:** shop staff in Zoho (e.g. creating Baby Girl
   sub-categories such as Co-Ord Set/Frock so the category ID alone suffices),
   or developers via group overrides in the mapping file?
9. **Existing 12 static products:** retired when the Zoho catalog goes live
   (their `/p/…` URLs would disappear)?

## 7. Implementation Plan

**Implemented (2026-10-04):** `frontend/infrastructure/zoho/zoho-category-mapping.ts`
(server-only) holds 13 Zoho category → storefront category rows (the
high-confidence rows of section 3; Silk and Cotton Sarees both →
`women-sarees`) and one group override (Girl Coord set →
`infants-baby-girl-co-ord-set`). `createZohoCategoryResolver` applies group
override → category mapping → `null`; `validateZohoCategoryMapping` checks
numeric ID keys, no duplicates, and targets present in `categoryRecords`.
`mapZohoItemsToProducts` fills `categoryIds` with one entry or `[]`; the Zoho
demo gateway uses the committed mapping (the `/demo` UI ignores categories).
All section 6 pending categories (Baby Girl category, Party frock group,
Kids tree, Unisex-Jb, Bath/Skin Care, Nursery, Night Wear, Inner Wears ›
Kids, Panties, Bra, Palazzo, Toys) stay **unmapped** and are not listed.
**Catalog snapshot (2026-10-04):** with `CATALOG_PRODUCT_SOURCE=zoho-snapshot`
the storefront publishes only active products with one approved placement;
unplaced products get no listing, product page, or sitemap URL. Each
refresh logs a sanitized summary with unmapped Zoho category IDs and product
counts. Live read-only check: 157 items → 49 products → 13 published, 36
unplaced pending OD-6.

Original plan:

- **Proposed file:** `frontend/infrastructure/zoho/zoho-category-mapping.ts`
  (`import "server-only"`; provider-specific data belongs under
  `infrastructure/zoho` per ADR 0009 principle 1, keeping Zoho terms out of
  `app/**` and `components/**` per the storefront data-boundary test). The
  `frontend/config/catalog-category-mapping.ts` location is an acceptable
  alternative if `config/` remains the selection point, but Zoho IDs would
  then live outside the provider boundary.
- **Structure (conceptual):**
  ```ts
  export const zohoCategoryMapping = {
    byCategoryId: { "<zoho category_id>": "women-co-ord-set" },
    byGroupId: { "<zoho group_id>": "infants-baby-girl-co-ord-set" },
  } as const;
  ```
  Plus a pure resolver `resolveStorefrontCategory(item, mapping) →
  storefront category ID | null`, used by `mapZohoItemsToProducts` to fill
  `categoryIds` (one entry).
- **Validation rules (build/test time):** every target ID exists in the
  storefront category records; one target per key (no arrays); keys are
  non-empty Zoho ID strings; no key in both an approved mapping and a
  "pending decision" list; group overrides only for groups whose Zoho
  category is mapped coarser or unmapped (warning, not failure).
- **Unmapped products:** `categoryIds: []`; not listed in any category and
  excluded from the sitemap until mapped (whether the product page itself is
  published follows owner decision 7/9; default: not published). Each refresh
  reports unmapped Zoho category/group IDs and counts in sanitized server
  logs.
- **Ambiguous mappings:** cannot be expressed (single target per key); an
  undecided Zoho category stays unmapped rather than guessed.
- **Tests required:** resolver precedence (group override > category >
  unmapped); duplicate Zoho names do not collide (ID keys); Co-Ord Set
  fixtures (Women, Baby Girl group override, Kids unmapped) land correctly;
  unknown/new Zoho category → unmapped; mapping file validated against the
  real `categoryRecords` (missing target fails); one placement per product;
  server-only boundary entry for the new module; no real Zoho calls (fakes
  only).

## 8. SEO / Navigation Impact

Current behavior (from code, unchanged here):

- **Category URLs** `/c/{slug}`, flat; slug = record ID (e.g.
  `/c/infants-baby-girl-co-ord-set`). The recommended model maps *into* these
  IDs, so **no category URL changes**. Zoho's own `url` values
  (`baby_girl`, `feeding_1`) are not used. Option 6 would change category
  URLs.
- **Product URLs** `/p/{slug}`, flat, independent of category, so a product's
  URL does not change with its placement. Zoho products need a slug rule
  (TD-005); group names collide ("Coord set" ×2), so the demo rule (name +
  ID suffix) or an approved alternative is required. Retiring the 12 static
  products removes their current `/p/…` URLs (owner decision 9).
- **Canonical URLs** are path-only (`/c/{slug}`, `/p/{slug}` via
  `metadataBase`); one product URL regardless of placement, so multiple
  placements would not create duplicate product URLs.
- **Breadcrumbs:** category pages render `Home › {category}` only (no
  ancestors), so `Women › Co-Ord Set` would show as `Home › Co-Ord Set` —
  three storefront categories share the name "Co-Ord Set". Product pages
  render `Home › {every category in categoryIds}` as one chain, which is
  only correct with a **single** placement and still lacks ancestors. The
  Category → Subcategory requirement needs an ancestor trail (follow-up task;
  also affects BreadcrumbList JSON-LD).
- **Product listing:** listings are direct membership (D15). With products
  mapped to leaves, `/c/women` and `/c/infants` show no products unless
  descendant listing is approved (owner decision 6).
- **Sitemap** (`listIndexableUrls`): includes every category (including
  empty ones) and every product. With mapping, many storefront categories
  stay empty (§3), creating thin indexed pages unless hidden (owner
  decision 7). Unmapped products should be excluded.
- **Intended navigation** Home → Category → Subcategory → Product listing →
  Product detail (e.g. Women → Co-Ord Set → listing; Infants → Baby Girl →
  Co-Ord Set → listing) is supported by the existing tree, menu, and
  `/c/{slug}` routes; only the breadcrumb trail and parent-listing semantics
  need work. A product appears in exactly one location unless owner decision
  5 allows more.

**Navigation audit (2026-10-04, implemented):** header and mobile menus
already rendered the full tree (all depths, "View all" links) and were not
changed. Fixed: category pages now render `Home › ancestors › category`
(also in BreadcrumbList JSON-LD) and link their visible direct
subcategories; a parent category with subcategories but no direct products
shows the subcategory links instead of "No products in this category yet";
product pages render one trail `Home › ancestors › primary category ›
product`. Listings remain direct membership (no descendant aggregation,
pending owner decision 6). Category URLs and the Zoho mapping are unchanged.
