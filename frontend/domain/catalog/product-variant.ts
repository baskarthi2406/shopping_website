/**
 * Minimum variant shape. Size, color, and other options are TBD.
 * Phase 1 products use a single default variant with no option values.
 */
export type ProductVariant = {
  readonly id: string;
  readonly size?: string;
  readonly color?: string;
};
