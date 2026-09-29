import { describe, expect, it } from "vitest";
import { validateInventory } from "./contract-validation";

describe("inventory model", () => {
  it("accepts valid on-hand, available-to-sell, and reserved quantities", () => {
    expect(
      validateInventory({
        stockOnHand: 12,
        availableToSell: 10,
        reserved: 2,
        status: "in_stock",
      }),
    ).toEqual([]);
  });

  it("treats null quantities as unknown, distinct from zero", () => {
    const unknown = {
      stockOnHand: null,
      availableToSell: null,
      reserved: null,
      status: "unknown" as const,
    };
    const zero = {
      stockOnHand: 0,
      availableToSell: 0,
      reserved: 0,
      status: "out_of_stock" as const,
    };

    expect(validateInventory(unknown)).toEqual([]);
    expect(validateInventory(zero)).toEqual([]);
    expect(unknown.stockOnHand).toBeNull();
    expect(zero.stockOnHand).toBe(0);
  });

  it("rejects negative and non-integer quantities", () => {
    expect(
      validateInventory({
        stockOnHand: -1,
        availableToSell: 1.5,
        reserved: null,
        status: "unknown",
      }),
    ).toEqual([
      {
        path: "inventory.stockOnHand",
        message: "must be null or a finite, non-negative integer",
      },
      {
        path: "inventory.availableToSell",
        message: "must be null or a finite, non-negative integer",
      },
    ]);
  });

  it("rejects reserved or available quantities that exceed on-hand stock", () => {
    expect(
      validateInventory({
        stockOnHand: 5,
        availableToSell: null,
        reserved: 6,
        status: "unknown",
      }),
    ).toEqual([
      {
        path: "inventory.reserved",
        message: "must not exceed stockOnHand",
      },
    ]);
    expect(
      validateInventory({
        stockOnHand: 5,
        availableToSell: 6,
        reserved: null,
        status: "in_stock",
      }),
    ).toEqual([
      {
        path: "inventory.availableToSell",
        message: "must not exceed stockOnHand",
      },
    ]);
    expect(
      validateInventory({
        stockOnHand: 5,
        availableToSell: 2,
        reserved: 4,
        status: "in_stock",
      }),
    ).toEqual([
      {
        path: "inventory.availableToSell",
        message: "plus reserved must not exceed stockOnHand",
      },
    ]);
  });

  it("accepts known availability states that match known quantities", () => {
    expect(
      validateInventory({
        stockOnHand: null,
        availableToSell: null,
        reserved: null,
        status: "in_stock",
      }),
    ).toEqual([]);
    expect(
      validateInventory({
        stockOnHand: 0,
        availableToSell: 0,
        reserved: 0,
        status: "out_of_stock",
      }),
    ).toEqual([]);
    expect(
      validateInventory({
        stockOnHand: 4,
        availableToSell: 0,
        reserved: 4,
        status: "out_of_stock",
      }),
    ).toEqual([]);
    expect(
      validateInventory({
        stockOnHand: 3,
        availableToSell: 3,
        reserved: 0,
        status: "unknown",
      }),
    ).toEqual([]);
  });

  it("rejects availability that contradicts known sellable quantity", () => {
    expect(
      validateInventory({
        stockOnHand: 0,
        availableToSell: 0,
        reserved: 0,
        status: "in_stock",
      }),
    ).toEqual([
      {
        path: "inventory.status",
        message: "must not be in_stock when available quantity is 0",
      },
    ]);
    expect(
      validateInventory({
        stockOnHand: 3,
        availableToSell: 3,
        reserved: 0,
        status: "out_of_stock",
      }),
    ).toEqual([
      {
        path: "inventory.status",
        message:
          "must not be out_of_stock when available quantity is greater than 0",
      },
    ]);
  });
});
