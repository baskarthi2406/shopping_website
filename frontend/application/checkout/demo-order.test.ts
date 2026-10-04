import { describe, expect, it } from "vitest";
import {
  createDemoOrderReference,
  DEMO_PAYMENT_METHOD,
  normalizeIndianMobile,
  parsePlaceDemoOrderRequest,
} from "./demo-order";

const valid = {
  reference: "MMDEMO-ABCDEFGH23",
  customer: { name: "Test Shopper", mobile: "+91 98765-43210", address: "1 Test Street, Test City" },
  paymentMethod: DEMO_PAYMENT_METHOD,
  lines: [{ variantId: "900001", quantity: 1, unitPrice: { amount: 464, currency: "INR" } }],
};

describe("normalizeIndianMobile", () => {
  it("accepts 10-digit numbers with optional prefixes", () => {
    expect(normalizeIndianMobile("9876543210")).toBe("9876543210");
    expect(normalizeIndianMobile("+91 98765 43210")).toBe("9876543210");
    expect(normalizeIndianMobile("09876543210")).toBe("9876543210");
  });

  it("rejects invalid numbers", () => {
    for (const value of ["12345", "5876543210", "98765432101", "abcdefghij", 9876543210]) {
      expect(normalizeIndianMobile(value)).toBeNull();
    }
  });
});

describe("parsePlaceDemoOrderRequest", () => {
  it("accepts a valid request and normalizes customer fields", () => {
    const result = parsePlaceDemoOrderRequest(valid);
    expect(result).toEqual({
      ok: true,
      value: { ...valid, customer: { ...valid.customer, mobile: "9876543210" } },
    });
  });

  it("reports each invalid customer field", () => {
    const result = parsePlaceDemoOrderRequest({
      ...valid,
      customer: { name: "A", mobile: "123", address: "short" },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(["address", "mobile", "name"]);
    }
  });

  it("requires the Demo/COD payment method and a well-formed reference", () => {
    const result = parsePlaceDemoOrderRequest({ ...valid, paymentMethod: "card", reference: "x" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.paymentMethod).toBeDefined();
      expect(result.errors.reference).toBeDefined();
    }
  });

  it.each([
    ["empty", []],
    ["zero quantity", [{ ...valid.lines[0], quantity: 0 }]],
    ["fractional quantity", [{ ...valid.lines[0], quantity: 1.5 }]],
    ["too many", [{ ...valid.lines[0], quantity: 11 }]],
    ["bad price", [{ ...valid.lines[0], unitPrice: { amount: 0, currency: "INR" } }]],
    ["bad id", [{ ...valid.lines[0], variantId: "../x" }]],
    ["duplicate", [valid.lines[0], valid.lines[0]]],
  ])("rejects %s lines", (_label, lines) => {
    expect(parsePlaceDemoOrderRequest({ ...valid, lines }).ok).toBe(false);
  });

  it("rejects non-object bodies", () => {
    expect(parsePlaceDemoOrderRequest(null).ok).toBe(false);
  });
});

describe("createDemoOrderReference", () => {
  it("produces a reference the parser accepts", () => {
    const reference = createDemoOrderReference((length) => new Uint8Array(length).map((_, i) => i * 7));
    expect(reference).toMatch(/^MMDEMO-[A-Z0-9]{10}$/);
    expect(parsePlaceDemoOrderRequest({ ...valid, reference }).ok).toBe(true);
  });
});
