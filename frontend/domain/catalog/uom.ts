/**
 * Unit of measure. Phase 2 admin will manage UOM.
 * Phase 1 fixtures do not invent codes or labels.
 */
export type Uom = {
  readonly code: string;
  readonly label: string;
};
