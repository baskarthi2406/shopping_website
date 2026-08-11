# Catalog listing filter and sort

**Task:** S2-T05 — Listing Filter/Sort (Placeholder)  
**Status:** Deferred (TBD). Not implemented on the storefront.

S2-T05 allowed either a minimal documented sort **or** an explicit deferral. Business rules for filters and merchandising order are **TBD**, so this task records deferral. It does **not** ship filter/sort UI or logic.

---

## What is decided

- Phase 1 catalog discovery is **category → product** via crawlable URLs: `/c/{slug}`, `/p/{slug}`.
- Category listings render repository order from `listProductsByCategory` / `getCategoryPage`. That order is not a finalized merchandising rule.
- No faceted search in Phase 1 until filterable fields exist in the domain and a product owner decides the rules.

## What is not decided (TBD)

| Topic | Why it is deferred |
|-------|--------------------|
| Price / price-range filter | Price is not on the product model |
| Size / color / variant filters | Variant options are TBD |
| Brand filter | Brand is not a domain field |
| Inventory / availability filter | `inventoryStatus` is `unknown`; do not display stock |
| Age / taxonomy facets | Option 1 nav is a flat category list; further taxonomy is TBD |
| Sort (name, price, newest, featured) | No merchandising or sort contract exists |
| Query-parameter listings (`?sort=`, `?color=`) | Would create duplicate indexable URLs without an SEO strategy |
| Search | Separate capability; not S2-T05 |

## What was not built

- No Filter/Sort controls (including disabled or “coming soon” buttons)
- No Client Component listing state
- No query-parameter architecture
- No pagination or infinite scroll
- No invented domain fields to support facets
- No default name-sort (that would invent a merchandising rule)

## SEO

Do not add indexable filter URLs until a later SEO task defines canonical vs `noindex` behavior for filtered listings. Canonical category URLs remain `/c/{slug}` with no query string.

## When to revisit

After pricing, variants, and merchandising rules are decided (not before S2-T06 catalog fixture expansion, and not as an automatic follow-on to this task). Search remains a separate TBD (`FRONTEND_ARCHITECTURE.md` §20).
