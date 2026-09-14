import type { InventoryStatus } from "./inventory-status";

/**
 * Provider-independent inventory snapshot. Quantities are nullable because a
 * source may expose only availability. No reservation behavior is implemented.
 */
export type Inventory = {
  readonly stockOnHand: number | null;
  readonly availableToSell: number | null;
  readonly reserved: number | null;
  readonly status: InventoryStatus;
};
