/**
 * Phase 1 static development data. UOM codes and labels are TBD.
 * Do not invent "each" / "piece" units until merchandising decides.
 */
export type UomRecord = {
  code: string;
  label: string;
};

export const uomRecords: readonly UomRecord[] = [];
