# Design Assets Inventory

**Location:** repository root `public/`  
**Storefront must use SEO filenames.** Original WhatsApp / export names are **kept** in `public/` as safety copies. Do not delete originals. Do not generate replacements or redesign the logo.

When Next.js is initialized (S1-T03), serve the **SEO-named** files from the Next.js `public` directory.

**S1-T03:** the approved logo is copied to `frontend/public/mini-mystiq-logo.png`. Repository-root `public/` remains the source of truth.

**S2-T01:** the three `baby-essentials` product photos were copied (not renamed) into `frontend/public/`.

**S2-T03:** navy/tan, olive, and beige product photos copied into `frontend/public/`.

**S2-T07:** catalog review compared this inventory to fixtures and `frontend/public/`. No asset rename, copy, or classification correction.

**S2-T06:** remaining approved **product** photos copied into `frontend/public/`:

- `grey-pinafore-baby-set.jpg`
- `dusty-blue-floral-dress.jpg`
- `cream-tiered-shirt-dress.jpg`
- `kids-striped-shirts-burgundy-and-sage.jpg`
- `kids-button-down-shirts-rose-and-burgundy.jpg`
- `kids-linen-shirts-brown-and-sage.jpg`

**S3-T01:** hero and secondary promo copied into `frontend/public/` (SEO filenames; originals kept).

Do not delete originals.

---

## Brand (decided)

| Item | Value |
|------|--------|
| Brand | Mini Mystiq |
| Tagline | Delivering Style & Tech |
| Visual direction | **Design Option 1 FINALIZED** (`docs/project/DESIGN_OPTION_1.md`) |
| Primary background | White |
| Palette | Green-led, soft pastels, logo blue / magenta / orange |
| UI | Rounded, clean, friendly children's e-commerce |
| Layout | Mobile-first |

**Storefront logo:** `mini-mystiq-logo.png`  
Do not recreate or replace it. Do not rename it again.

---

## SEO filename mapping

| Original Filename | SEO Filename | Type | Usage | Status |
|-------------------|--------------|------|-------|--------|
| `app_design_suggestions.png` | `mini-mystiq-app-design-suggestions.png` | Design reference (4 options) | **Option 1 (top-left) is the finalized homepage.** Not a storefront `<img>`. | Approved — **use SEO name** for the reference file |
| `minimystiqpng.png` | `mini-mystiq-logo.png` | Logo | Header, footer, OpenGraph | Approved — **use SEO name** |
| `WhatsApp Image 2026-07-30 at 11.53.16 AM.jpeg` | — | Logo (JPEG duplicate) | Backup only; prefer PNG | Original retained; no second logo name |
| `minimystiq.html` | `mini-mystiq-homepage-wireframe.html` | Wireframe | Layout / token / IA reference | Approved — **use SEO name** |
| `78100118-cc8b-41db-9b80-7e1368fd5b50 (1).png` | `layout-reference-homepage-mockup.png` | Layout mockup (other brand) | Layout/spacing **only** — not Mini Mystiq identity | Approved as layout reference |
| `WhatsApp Image 2026-06-10 at 4.05.31 PM.jpeg` | `baby-sleeveless-sets-new-collection-banner.jpg` | Hero | **Initial primary homepage hero**; 3:4; LCP | Approved — **use SEO name** |
| `WhatsApp Image 2026-06-10 at 3.28.28 PM.jpeg` | `baby-dress-bloomer-sets-new-collection-banner.jpg` | Promo | **Secondary** promotional banner; 3:4 | Approved — **use SEO name** |
| `WhatsApp Image 2026-06-05 at 4.31.31 PM.jpeg` | `navy-star-and-tan-bow-dresses.jpg` | Product | Product card / PDP; 1:1 | Approved. **Category TBD** — do not infer Kids/Teens/Women |
| `WhatsApp Image 2026-06-05 at 4.42.19 PM.jpeg` | `olive-green-patterned-dress.jpg` | Product | Product card / PDP; 1:1 | Approved — **use SEO name** |
| `WhatsApp Image 2026-06-06 at 4.41.26 PM.jpeg` | `beige-motif-pleated-dress.jpg` | Product | Product card / PDP; 3:4 | Approved — **use SEO name** |
| `WhatsApp Image 2026-06-06 at 5.06.18 PM.jpeg` | `dusty-blue-floral-dress.jpg` | Product | Product card / PDP; 3:4 | Approved — **use SEO name** |
| `WhatsApp Image 2026-07-25 at 6.00.54 PM.jpeg` | `pink-white-pleated-baby-dress.jpg` | Product | Product card / PDP; 3:4 | Approved — **use SEO name** |
| `WhatsApp Image 2026-07-25 at 6.00.54 PM (1).jpeg` | `sage-striped-baby-top-and-shorts.jpg` | Product | Product card / PDP; 3:4 | Approved — **use SEO name** |
| `WhatsApp Image 2026-07-25 at 6.00.54 PM (2).jpeg` | `cream-tiered-shirt-dress.jpg` | Product | Product card / PDP; 3:4 | Approved — **use SEO name** |
| `WhatsApp Image 2026-07-25 at 6.00.55 PM.jpeg` | `grey-pinafore-baby-set.jpg` | Product | Product card / PDP; **4:3 landscape** — crop for cards | Approved — **use SEO name** |
| `WhatsApp Image 2026-07-25 at 6.00.55 PM (1).jpeg` | `cream-grey-rose-tiered-baby-dress.jpg` | Product | Product card / PDP; 3:4 | Approved — **use SEO name** |
| `WhatsApp Image 2026-06-26 at 4.51.31 PM.jpeg` (inside zip) | `kids-striped-shirts-burgundy-and-sage.jpg` | Product | Product card / PDP; 4:3 | Approved extract — **use SEO name**. In catalog (S2-T06), category `kids` |
| `WhatsApp Image 2026-06-26 at 4.53.57 PM.jpeg` (inside zip) | `kids-button-down-shirts-rose-and-burgundy.jpg` | Product | Product card / PDP | Approved extract — **use SEO name**. In catalog (S2-T06), category `kids` |
| `WhatsApp Image 2026-06-26 at 4.55.02 PM.jpeg` (inside zip) | `kids-linen-shirts-brown-and-sage.jpg` | Product | Product card / PDP | Approved extract — **use SEO name**. In catalog (S2-T06), category `kids`. Customer-facing name uses documented alt (does not claim linen) |
| `WhatsApp Image 2026-06-26 at 4.55.41 PM.jpeg` (inside zip) | — | Product **TBD** | Character-print outfits | **Do not extract/use.** Do not name as Disney/licensed. Zip entry only |
| `WhatsApp Image 2026-06-04 at 2.42.23 PM.jpeg` | — | Pigeon bottle promo | **Not in storefront** until confirmed as catalog product | TBD — original retained, not renamed |
| `WhatsApp Image 2026-07-30 at 11.58.49 AM.jpeg` | — | Hiring flyer | **Outside storefront.** Possible later Careers page | TBD — original retained |
| `WhatsApp Image 2026-07-30 at 11.58.49 AM (1).jpeg` | — | Duplicate hiring flyer | Do not use | Original retained |
| `WhatsApp Unknown 2026-08-01 at 6.03.10 PM.zip` | — | Archive | Zip kept. Three shirts extracted; character-print left inside | Original retained |

There are **no** dedicated category image files (Option 1 shows circular category photos inside the composite only).  
There are **no** dedicated mobile vs desktop image pairs.  
There are **no** standalone icon, favicon, SVG, or standalone Option 1 hero files.

Homepage layout follows **Option 1**, not the HTML wireframe. See `docs/project/DESIGN_OPTION_1.md`.

---

## Recommended `alt` text (when UI exists)

Do **not** use the filename as alt text.

| SEO Filename | Suggested alt |
|--------------|----------------|
| `mini-mystiq-logo.png` | Mini Mystiq |
| `baby-sleeveless-sets-new-collection-banner.jpg` | Sage and dusty rose baby sleeveless top and shorts sets |
| `baby-dress-bloomer-sets-new-collection-banner.jpg` | Lavender and dusty rose baby dresses with matching bloomers |
| `navy-star-and-tan-bow-dresses.jpg` | Navy star-print dress and tan bow-print dress on hangers |
| `olive-green-patterned-dress.jpg` | Olive green patterned dress on a wooden hanger |
| `beige-motif-pleated-dress.jpg` | Beige motif pleated dress on a wooden hanger |
| `dusty-blue-floral-dress.jpg` | Dusty blue floral dress on a wooden hanger |
| `pink-white-pleated-baby-dress.jpg` | Pink and white pleated baby dress |
| `sage-striped-baby-top-and-shorts.jpg` | Sage striped baby top and matching shorts |
| `cream-tiered-shirt-dress.jpg` | Cream tiered shirt-dress on a wooden hanger |
| `grey-pinafore-baby-set.jpg` | Grey pinafore baby dress over a white ribbed top |
| `cream-grey-rose-tiered-baby-dress.jpg` | Cream, grey, and dusty rose tiered baby dress with bunny appliqué |
| `kids-striped-shirts-burgundy-and-sage.jpg` | Burgundy and sage striped kids shirts |
| `kids-button-down-shirts-rose-and-burgundy.jpg` | Dusty rose and burgundy kids button-down shirts |
| `kids-linen-shirts-brown-and-sage.jpg` | Brown and sage textured kids shirts |
| `layout-reference-homepage-mockup.png` | Not for storefront `<img>` |

---

## Logo

- **Use:** `mini-mystiq-logo.png` (1024×466, ≈2.20:1).
- Opaque white around the mark (not a transparent cut-out). Header-on-green treatment **TBD**.
- **Mobile:** `object-fit: contain`; do not stretch. Tagline visibility on a narrow header **TBD** (do not crop a new logo file).
- **Favicon:** no file. Deriving an M-only icon **TBD**.
- JPEG original retained; do not publish a second logo filename.

---

## Hero / promo (mobile-first)

**Initial primary hero (approved):** `baby-sleeveless-sets-new-collection-banner.jpg`  
LCP candidate. 3:4 — full width on mobile; contain/crop on desktop; do not stretch.

**Secondary promotional banner (approved):** `baby-dress-bloomer-sets-new-collection-banner.jpg`  
Lazy-load. Same responsive rules.

Option 1’s two-children lifestyle photo is still only inside the 4-up PNG. Do not slice it. A future standalone lifestyle hero is **TBD** and would not replace this decision until documented.

---

## Category images (temporary)

No dedicated category assets. **Temporary decision:** reuse approved product photos for Option 1 circular cards until dedicated art exists.

| Option 1 category | Temporary image | Note |
|-------------------|-----------------|------|
| Baby Essentials | `sage-striped-baby-top-and-shorts.jpg` | Baby set; stand-in only |
| Infants | `cream-grey-rose-tiered-baby-dress.jpg` | Baby dress; stand-in only |
| Kids | `kids-striped-shirts-burgundy-and-sage.jpg` | Kids shirts; stand-in only |
| Teens | `dusty-blue-floral-dress.jpg` | **Age not confirmed** — visual stand-in only, not taxonomy |
| Women | `olive-green-patterned-dress.jpg` | **Age not confirmed** — visual stand-in only, not taxonomy |

Do **not** use `navy-star-and-tan-bow-dresses.jpg` as a Kids/Teens/Women category card. Its category stays **TBD**.

Do not slice Option 1 composite circles. Replace this table when dedicated category files exist.

---

## Zip archive

Original zip **kept**. Three shirt photos copied to SEO names (above) and added to the static catalog in S2-T06 (`kids`). Character-print entry **not** extracted and **not** used. Hangtags may read BINTANG (manufacturer TBD). Storefront brand remains Mini Mystiq.

---

## Design references

**Final homepage:** Option 1 in `mini-mystiq-app-design-suggestions.png` — `docs/project/DESIGN_OPTION_1.md`.

**Wireframe:** `mini-mystiq-homepage-wireframe.html` (historical). Option 1 supersedes it for homepage layout. Footer “© 2026 Enn2Gee” — legal entity **TBD**.

**Layout mockup:** `layout-reference-homepage-mockup.png` — other brand. Do not copy that identity.

---

## Next.js image rules (when UI exists)

- `src` = SEO filename, not the WhatsApp original.
- Next.js `<Image>`; do not distort.
- Studio shots: `object-fit: contain`. Landscape `grey-pinafore-baby-set.jpg`: crop toward the garment for 3:4/1:1 cards (`cover`), do not stretch.
- Meaningful alt from the table above — not the filename.
- No placeholder images when an approved SEO file exists.

---

## Implementation mapping (storefront)

| UI surface | SEO asset |
|------------|-----------|
| Header logo | `mini-mystiq-logo.png` |
| Homepage layout | Design Option 1 |
| Primary hero | `baby-sleeveless-sets-new-collection-banner.jpg` |
| Secondary promo | `baby-dress-bloomer-sets-new-collection-banner.jpg` |
| Category circles | Temporary product-photo table above |
| Product cards / PDP | SEO product `.jpg` files (including three extracted kids shirts, S2-T06) |

---

## Recorded asset decisions (S1-T01)

1. **Pigeon bottle** — not in the storefront until confirmed as a catalog product.
2. **Hiring flyer** — outside the storefront; may later support a Careers page.
3. **Zip shirts** — three SEO files extracted; in the static catalog as Kids products (S2-T06).
4. **Character-print outfits** — TBD; do not use or name as Disney/licensed.
5. **Hero** — sleeveless-sets banner primary; dress-bloomer banner secondary.
6. **Navy/tan dresses** — category TBD; do not infer Kids/Teens/Women.
7. **Category images** — none dedicated; temporary product-photo reuse (table above).

Remaining TBD: dedicated category art, standalone Option 1 lifestyle hero, Pigeon/Careers/character-print confirmation, navy/tan and other dress taxonomy (dusty-blue, cream-tiered, olive, beige), toys (no approved toy product assets).

---

## SEO image naming rules (ongoing)

- lowercase, hyphen-separated, descriptive, concise
- no spaces, no WhatsApp timestamps, no `IMG_1234` / `product1`
- `{product}-{attribute}.ext` when the product is known
- do not rename from guesses — mark **TBD** and ask
- do not rename `mini-mystiq-logo.png` again
- filename ≠ alt text
- keep originals; storefront references SEO names only
