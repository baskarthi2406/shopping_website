# Mobile-First Requirements

Mobile-first is a **mandatory**, decided requirement for the customer storefront.

Exact breakpoint pixels, tap-target size, and Core Web Vitals numeric budgets are **TBD**. Do not invent them.

---

## Audience

Mobile customers are expected to be the **primary** audience.

## Responsive priority

```
Mobile → Tablet → Desktop
```

Desktop must be an extension of the mobile-first design, not a desktop layout squeezed onto phones.

---

## Every storefront task must consider

| Concern | Requirement |
|---------|-------------|
| Mobile layout | Compose for the smallest viewport first |
| Touch-friendly interactions | No hover-only actions; controls usable with a finger |
| Responsive typography | Type scales up for tablet/desktop; remains readable on mobile |
| Responsive images | Fluid images from `public/` (`DESIGN_ASSETS.md`); Next.js Image when the app exists; same files on all breakpoints — contain/crop, never stretch |
| No horizontal scrolling | No overflow-x from layout, images, or tables at mobile widths |
| Mobile navigation | A usable mobile nav (pattern TBD: menu, drawer, etc.) |
| Mobile product browsing | Listings usable on a phone (scan, tap through) |
| Mobile product detail | PDP readable and actionable on a phone |
| Mobile cart | Cart add/update/remove and cart page usable on a phone |
| Mobile performance | Avoid heavy client JS and oversized assets on catalog/cart |
| Core Web Vitals | Consider LCP, INP, CLS on storefront UI work; numeric targets TBD |

---

## Storefront rules

- Implement mobile first; enhance for tablet and desktop with responsive CSS (Tailwind).
- Do not build a separate mobile site or user-agent fork unless an ADR says so.
- There are no dedicated mobile/desktop image variants. Use approved `public/` assets with `object-fit` / cropping. Do not generate replacements.
- Primary catalog content must remain crawlable HTML (SEO + mobile).
- Navigation, category listing, product detail, and cart each need an explicit mobile treatment when those features are implemented.
- Checkout (when it exists) follows the same mobile-first rule.

## Admin (Phase 2)

Admin UI **may prioritize desktop** usability (data tables, bulk edit) but **must remain responsive**. It is not mobile-first in the same way as the storefront.

## TBD

- Breakpoint pixel values — S1-T07 uses Tailwind defaults as **implementation defaults** (`sm` 640 / `md` 768 / `lg` 1024). Not a business lock.
- Minimum tap-target size
- Numeric Core Web Vitals / Lighthouse budgets
- Mobile nav pattern (hamburger, bottom bar, etc.)
- Whether a physical-device test lab is required vs browser device mode
