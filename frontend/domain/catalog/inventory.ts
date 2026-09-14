import type { InventoryStatus } from "./inventory-status";

/**
 * Provider-independent inventory snapshot. Null quantities mean unknown and
 * are distinct from zero. No reservation, deduction, or synchronization is
 * implemented.
 */
export type Inventory = {
  readonly stockOnHand: number | null;
  readonly availableToSell: number | null;
  readonly reserved: number | null;
  readonly status: InventoryStatus;
};
