# Mini Mystiq — Design Option 1 (Finalized)

**Status:** FINALIZED  
**Source image:** `public/mini-mystiq-app-design-suggestions.png` (original: `public/app_design_suggestions.png`)  
**Which option:** **Option 1 — top-left** of the four mockups. Options 2–4 are not the storefront direction.

This file is the homepage **visual and IA** source of truth. If it conflicts with `mini-mystiq-homepage-wireframe.html` or `layout-reference-homepage-mockup.png`, **Option 1 wins**.

Do not implement UI in this documentation task. Do not extract/crop new image files from the composite unless a later task explicitly requires it.

---

## What is decided (design)

| Area | Option 1 |
|------|----------|
| Page | Desktop homepage mockup (implement **mobile-first**; stack sections on small screens) |
| Palette | Forest green, white, light gray. Exact hex **TBD** (derive in the first UI task from this mockup; do not invent a second palette) |
| Type | Clean sans-serif |
| Logo | Existing `mini-mystiq-logo.png` + tagline Delivering Style & Tech — do not redraw |
| Announcement bar | Forest green bar, white text |
| Header | Logo left; centered search; Wishlist, Account, Cart (badge) right |
| Nav | Baby Essentials · Infants · Kids · Teens (dropdown indicated) · Women · New Arrivals · Offers |
| Hero | Headline + subhead + green “Shop Now” + lifestyle photo of two children (girl in pink dress, boy in yellow polo) + small star/plane doodles |
| Categories | Five **circular** photo/icon tiles with captions (see below) |
| Featured products | Heading “Featured Products” + View All; horizontal product cards with wishlist heart |
| Trust bar | Four columns (see copy below) |

---

## Copy shown in Option 1

Treat as **intended homepage copy** from the finalized mockup. Change only if a later requirements update says so.

**Announcement bar:** Free Shipping on Orders above ₹999 | Easy Returns | COD Available

**Hero headline:** Dress them cute, see them shine!  
**Hero subhead:** Stylish, Comfortable & Perfect for Every Moment.  
**Hero CTA:** Shop Now

**Category labels / subtext:**

| Category | Subtext |
|----------|---------|
| Baby Essentials | Gentle & Nurturing |
| Infants | Adorable Styles |
| Kids | Cute & Comfy |
| Teens | Trendy Looks |
| Women | Stylish & Elegant |

**Trust bar:**

| Item | Subtext in mockup |
|------|-------------------|
| Free Shipping | On orders above ₹999 |
| Easy Returns | Hassle free returns |
| Secure Payment | 100% secure checkout |
| 24/7 Support | We are here to help |

₹999, COD, and 24/7 support are **in the approved design**. If operations cannot honor them, update this file — do not silently drop the bar.

---

## Assets vs the mockup

The Option 1 frame is a **composite**. These pieces are **not** separate files in `public/` yet:

- Standalone hero lifestyle photo (two children)
- Five circular category images
- Five featured-product photos as shown in the mockup (pink ruffle dress, yellow shirt, denim set, mint jacket, pink patterned dress)

Until standalone files exist:

- Use `mini-mystiq-logo.png` for the logo.
- Do **not** crop Option 1 out of the 4-up PNG for production.
- **Initial primary hero image:** `baby-sleeveless-sets-new-collection-banner.jpg` (approved S1-T01). Keep Option 1 headline/CTA copy.
- **Secondary promo image:** `baby-dress-bloomer-sets-new-collection-banner.jpg`.
- Category circles: temporary product photos in `DESIGN_ASSETS.md` (not dedicated art).
- Product cards may use SEO product photos in `DESIGN_ASSETS.md`.

---

## Mobile-first

Option 1 is a **desktop** frame. Implementation order remains Mobile → Tablet → Desktop.

Proposed stacking (not pixel-spec): announcement → logo/search/icons → nav (menu pattern **TBD**) → hero text then image → category row (horizontal scroll or wrap) → featured cards (1–2 columns) → trust bar.

Do not stretch the desktop hero across a phone. Same assets; contain/crop.

---

## Phase 1 behavior vs chrome

Option 1 **shows** Wishlist and Account. Customer accounts are Phase 2 (Sprint 8). Phase 1 may render the icons as chrome; login/wishlist persistence **TBD** (do not invent auth).

Offers / New Arrivals links are design IA. Coupon engine is not Phase 1. Destination pages **TBD**.

Cart icon is in scope for Sprint 4.

---

## Related documents

- `docs/decisions/0001-storefront-design-option-1.md`
- `docs/project/DESIGN_ASSETS.md`
- `docs/architecture/FRONTEND_ARCHITECTURE.md`
