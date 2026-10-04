/**
 * Customer-facing tax presentation.
 *
 * Zoho taxed SO-00001 at 5% on top of the item rate (`is_inclusive_tax: false`),
 * but that does not decide whether the storefront price is meant to include GST.
 * OD-1 and OD-2 in `docs/project/ZOHO-TAX-VERIFICATION.md` are still open.
 * `unresolved` shows the verified selling price and calculates no tax.
 */
export const STOREFRONT_TAX_POLICY = "unresolved" as const;

export type StorefrontTaxPolicy = typeof STOREFRONT_TAX_POLICY;

/** Does not claim the selling price is tax-inclusive or tax-exclusive. */
export const STOREFRONT_TAX_NOTE =
  "Tax is not calculated. Whether this price includes GST has not been decided. Shipping is not calculated.";
