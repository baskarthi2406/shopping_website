import { describe, expect, it } from "vitest";
import {
  validateMoney,
  validatePricing,
} from "./contract-validation";

describe("pricing model", () => {
  it("accepts a valid money value and currency", () => {
    expect(validateMoney({ amount: 799, currency: "INR" })).toEqual([]);
    expect(validateMoney({ amount: 0, currency: "USD" })).toEqual([]);
  });

  it("rejects invalid and negative money amounts", () => {
    expect(validateMoney({ amount: -1, currency: "INR" })).toEqual([
      {
        path: "money.amount",
        message: "must be a finite, non-negative number",
      },
    ]);
    expect(validateMoney({ amount: Number.NaN, currency: "INR" })).toHaveLength(
      1,
    );
  });

  it("rejects invalid currency codes", () => {
    expect(validateMoney({ amount: 1, currency: "inr" })).toEqual([
      {
        path: "money.currency",
        message: "must be a three-letter uppercase code",
      },
    ]);
    expect(validateMoney({ amount: 1, currency: "IN" })).toHaveLength(1);
  });

  it("accepts a current price with a nullable compare-at price", () => {
    expect(
      validatePricing({
        price: { amount: 799, currency: "INR" },
        compareAtPrice: null,
      }),
    ).toEqual([]);
  });

  it("rejects a negative compare-at price", () => {
    expect(
      validatePricing({
        price: { amount: 799, currency: "INR" },
        compareAtPrice: { amount: -1, currency: "INR" },
      }),
    ).toEqual([
      {
        path: "pricing.compareAtPrice.amount",
        message: "must be a finite, non-negative number",
      },
    ]);
  });

  it("accepts a valid compare-at price at or above the current price", () => {
    expect(
      validatePricing({
        price: { amount: 799, currency: "INR" },
        compareAtPrice: { amount: 799, currency: "INR" },
      }),
    ).toEqual([]);
    expect(
      validatePricing({
        price: { amount: 799, currency: "INR" },
        compareAtPrice: { amount: 999, currency: "INR" },
      }),
    ).toEqual([]);
  });

  it("rejects a compare-at price below the current price", () => {
    expect(
      validatePricing({
        price: { amount: 999, currency: "INR" },
        compareAtPrice: { amount: 799, currency: "INR" },
      }),
    ).toEqual([
      {
        path: "pricing.compareAtPrice.amount",
        message: "must not be less than the current price",
      },
    ]);
  });

  it("does not calculate discounts from compare-at pricing", () => {
    const pricing = {
      price: { amount: 799, currency: "INR" },
      compareAtPrice: { amount: 999, currency: "INR" },
    };

    expect(validatePricing(pricing)).toEqual([]);
    expect(pricing).not.toHaveProperty("discount");
    expect(pricing).not.toHaveProperty("percentOff");
    expect(pricing.price.amount).toBe(799);
  });
});
