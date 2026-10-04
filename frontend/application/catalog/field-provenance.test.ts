import { describe, expect, it } from "vitest";
import type { Inventory, Pricing, Product } from "@/domain/catalog";
import { evaluatePurchasability } from "./evaluate-purchasability";
import {
  DEFAULT_FRESHNESS_THRESHOLD_MS,
  evaluateFieldProvenance,
  isValidInventory,
  parseObservationTime,
  resolveInventoryProvenance,
  resolvePricingProvenance,
  type FieldObservation,
  type ProvenancePolicy,
} from "./field-provenance";

/*
 * Synthetic probe values only: XTS is the ISO 4217 testing currency and the
 * quantities, source name, and timestamps are arbitrary fixed values.
 */
const NOW = "2026-10-04T12:00:00Z";
const FRESH = "2026-10-04T06:00:00Z";
const AT_THRESHOLD = "2026-10-03T12:00:00Z";
const JUST_EXPIRED = "2026-10-03T11:59:59.999Z";
const OLD = "2026-09-30T12:00:00Z";
const FUTURE = "2026-10-04T12:00:00.001Z";
const SOURCE = "probe-source";

const POLICY: ProvenancePolicy = {
  ownerSource: SOURCE,
  freshnessThresholdMs: DEFAULT_FRESHNESS_THRESHOLD_MS,
};

const PRICING: Pricing = {
  price: { amount: 10, currency: "XTS" },
  compareAtPrice: null,
};

const IN_STOCK: Inventory = {
  stockOnHand: 5,
  availableToSell: 5,
  reserved: 0,
  status: "in_stock",
};

function observe<T>(value: T | null, observedAt = FRESH, source = SOURCE): FieldObservation<T> {
  return { source, observedAt, value };
}

function product(pricing: Pricing | null, inventory: Inventory | null): Product {
  return {
    id: "probe-id",
    slug: "probe-product",
    name: "Probe product",
    description: "Synthetic probe product",
    images: [],
    categoryIds: [],
    sku: null,
    uom: null,
    pricing,
    inventory,
    status: "active",
    variants: [],
  };
}

describe("field provenance rules (ADR 0007)", () => {
  it("uses a 24-hour default freshness threshold", () => {
    expect(DEFAULT_FRESHNESS_THRESHOLD_MS).toBe(86_400_000);
  });

  it("verifies a fresh, valid observation from the owning source", () => {
    expect(resolvePricingProvenance(observe(PRICING), POLICY, NOW)).toEqual({
      provenance: { state: "verified", reason: null },
      pricing: PRICING,
    });
    expect(resolveInventoryProvenance(observe(IN_STOCK), POLICY, NOW)).toEqual({
      provenance: { state: "verified", reason: null },
      inventory: IN_STOCK,
    });
  });

  it("classifies a fresh observation with no value as missing (contract value null)", () => {
    expect(resolvePricingProvenance(observe<Pricing>(null), POLICY, NOW)).toEqual({
      provenance: { state: "missing", reason: "value_absent" },
      pricing: null,
    });
    expect(resolveInventoryProvenance(observe<Inventory>(null), POLICY, NOW).inventory).toBeNull();
  });

  it.each([
    ["no observation", null, POLICY, "no_observation"],
    ["owner not yet decided", observe(PRICING), { ...POLICY, ownerSource: null }, "owner_unset"],
    ["blank source", observe(PRICING, FRESH, " "), POLICY, "source_invalid"],
    ["non-owning source", observe(PRICING, FRESH, "other-source"), POLICY, "source_mismatch"],
  ] as const)("classifies %s as unknown", (_case, observation, policy, reason) => {
    expect(resolvePricingProvenance(observation, policy, NOW)).toEqual({
      provenance: { state: "unknown", reason },
      pricing: null,
    });
  });

  it("classifies an observation older than the threshold as stale", () => {
    expect(resolvePricingProvenance(observe(PRICING, OLD), POLICY, NOW).provenance).toEqual({
      state: "stale",
      reason: "expired",
    });
  });

  it("hides a stale price and keeps purchase blocked", () => {
    const { pricing } = resolvePricingProvenance(observe(PRICING, OLD), POLICY, NOW);
    const { inventory } = resolveInventoryProvenance(observe(IN_STOCK), POLICY, NOW);

    expect(pricing).toBeNull();
    expect(evaluatePurchasability({ product: product(pricing, inventory), quantity: 1 })).toEqual({
      purchasable: false,
      reasons: ["price_missing"],
    });
  });

  it("treats any future timestamp as unknown, with no skew tolerance", () => {
    expect(resolvePricingProvenance(observe(PRICING, FUTURE), POLICY, NOW)).toEqual({
      provenance: { state: "unknown", reason: "timestamp_future" },
      pricing: null,
    });
    expect(
      resolveInventoryProvenance(observe<Inventory>(null, FUTURE), POLICY, NOW).provenance,
    ).toEqual({ state: "unknown", reason: "timestamp_future" });
  });

  it("turns a missing observation older than the threshold into unknown", () => {
    expect(resolvePricingProvenance(observe<Pricing>(null, OLD), POLICY, NOW).provenance).toEqual({
      state: "unknown",
      reason: "missing_expired",
    });
  });

  it("treats an age exactly at the threshold as fresh and one millisecond more as expired", () => {
    expect(resolvePricingProvenance(observe(PRICING, AT_THRESHOLD), POLICY, NOW).provenance.state).toBe(
      "verified",
    );
    expect(resolvePricingProvenance(observe(PRICING, JUST_EXPIRED), POLICY, NOW).provenance.state).toBe(
      "stale",
    );
    expect(
      resolvePricingProvenance(observe<Pricing>(null, AT_THRESHOLD), POLICY, NOW).provenance.state,
    ).toBe("missing");
    expect(
      resolvePricingProvenance(observe<Pricing>(null, JUST_EXPIRED), POLICY, NOW).provenance.state,
    ).toBe("unknown");
  });

  it("evaluates price and stock independently", () => {
    const stockPolicy: ProvenancePolicy = { ownerSource: "stock-source", freshnessThresholdMs: 60_000 };
    const price = resolvePricingProvenance(observe(PRICING), POLICY, NOW);
    const stock = resolveInventoryProvenance(observe(IN_STOCK), stockPolicy, NOW);
    const freshStock = resolveInventoryProvenance(
      observe(IN_STOCK, FRESH, "stock-source"),
      stockPolicy,
      NOW,
    );
    const stalePrice = resolvePricingProvenance(observe(PRICING, OLD), POLICY, NOW);

    expect(price.provenance.state).toBe("verified");
    expect(stock.provenance).toEqual({ state: "unknown", reason: "source_mismatch" });
    expect(freshStock.provenance.state).toBe("stale");
    expect(stalePrice.provenance.state).toBe("stale");
    expect(resolveInventoryProvenance(observe(IN_STOCK), POLICY, NOW).provenance.state).toBe(
      "verified",
    );
  });

  it("never lets stale stock produce a positive availability conclusion", () => {
    const { inventory, provenance } = resolveInventoryProvenance(observe(IN_STOCK, OLD), POLICY, NOW);

    expect(provenance.state).toBe("stale");
    expect(inventory).toEqual({
      stockOnHand: null,
      availableToSell: null,
      reserved: null,
      status: "unknown",
    });
    expect(
      evaluatePurchasability({ product: product(PRICING, inventory), quantity: 1 }),
    ).toEqual({ purchasable: false, reasons: ["inventory_unknown"] });
  });

  it("does not let verified stock bypass existing purchasability rules", () => {
    const outOfStock: Inventory = {
      stockOnHand: 0,
      availableToSell: 0,
      reserved: 0,
      status: "out_of_stock",
    };
    const verifiedOut = resolveInventoryProvenance(observe(outOfStock), POLICY, NOW);
    const verifiedIn = resolveInventoryProvenance(observe(IN_STOCK), POLICY, NOW);

    expect(verifiedOut.provenance.state).toBe("verified");
    expect(
      evaluatePurchasability({ product: product(PRICING, verifiedOut.inventory), quantity: 1 }),
    ).toEqual({ purchasable: false, reasons: ["out_of_stock"] });
    expect(
      evaluatePurchasability({ product: product(null, verifiedIn.inventory), quantity: 1 }),
    ).toEqual({ purchasable: false, reasons: ["price_missing"] });
    expect(
      evaluatePurchasability({ product: product(PRICING, verifiedIn.inventory), quantity: 6 }),
    ).toEqual({ purchasable: false, reasons: ["insufficient_inventory"] });
  });

  it.each([
    "2026-10-04 06:00:00Z",
    "2026-10-04T06:00:00",
    "2026-02-30T06:00:00Z",
    "2026-13-01T06:00:00Z",
    "2026-10-04T24:00:00Z",
    "not-a-date",
    "",
  ])("classifies malformed timestamp %j as unknown", (observedAt) => {
    expect(resolvePricingProvenance(observe(PRICING, observedAt), POLICY, NOW).provenance).toEqual({
      state: "unknown",
      reason: "timestamp_invalid",
    });
  });

  it.each([
    ["negative amount", { price: { amount: -1, currency: "XTS" }, compareAtPrice: null }],
    ["lowercase currency", { price: { amount: 10, currency: "xts" }, compareAtPrice: null }],
    ["compare-at below price", { price: { amount: 10, currency: "XTS" }, compareAtPrice: { amount: 5, currency: "XTS" } }],
    ["missing price", { compareAtPrice: null }],
    ["string amount", { price: { amount: "10", currency: "XTS" }, compareAtPrice: null }],
    ["not an object", "10 XTS"],
  ])("classifies malformed pricing (%s) as unknown", (_case, value) => {
    const observation = observe(value as unknown as Pricing);
    expect(resolvePricingProvenance(observation, POLICY, NOW)).toEqual({
      provenance: { state: "unknown", reason: "value_invalid" },
      pricing: null,
    });
  });

  it.each([
    ["fractional quantity", { ...IN_STOCK, availableToSell: 1.5 }],
    ["in_stock with zero available", { ...IN_STOCK, availableToSell: 0, stockOnHand: 0 }],
    ["available above on-hand", { ...IN_STOCK, availableToSell: 9 }],
    ["unsupported status", { ...IN_STOCK, status: "available" }],
    ["missing quantity field", { availableToSell: 5, reserved: 0, status: "in_stock" }],
  ])("classifies malformed inventory (%s) as unknown", (_case, value) => {
    expect(isValidInventory(value)).toBe(false);
    expect(
      resolveInventoryProvenance(observe(value as unknown as Inventory), POLICY, NOW),
    ).toEqual({ provenance: { state: "unknown", reason: "value_invalid" }, inventory: null });
  });

  it("depends only on the explicit evaluation time", () => {
    const observation = observe(PRICING, FRESH);
    const early = "2026-10-04T12:00:00Z";
    const late = "2026-10-05T06:00:00.001Z";

    expect(resolvePricingProvenance(observation, POLICY, early)).toEqual(
      resolvePricingProvenance(observation, POLICY, early),
    );
    expect(resolvePricingProvenance(observation, POLICY, early).provenance.state).toBe("verified");
    expect(resolvePricingProvenance(observation, POLICY, late).provenance.state).toBe("stale");
    expect(resolvePricingProvenance(observation, POLICY, "2026-10-04T11:30:00+05:30").provenance.state).toBe(
      "verified",
    );
  });

  it("compares offsets as instants", () => {
    expect(parseObservationTime("2026-10-04T17:30:00+05:30")).toBe(
      parseObservationTime("2026-10-04T12:00:00Z"),
    );
  });

  it.each([
    ["invalid evaluation time", POLICY, "2026-10-04"],
    ["negative threshold", { ...POLICY, freshnessThresholdMs: -1 }, NOW],
    ["fractional threshold", { ...POLICY, freshnessThresholdMs: 1.5 }, NOW],
  ] as const)("rejects an %s as a caller error", (_case, policy, evaluatedAt) => {
    expect(() =>
      evaluateFieldProvenance(observe(PRICING), policy, evaluatedAt, () => true),
    ).toThrow(RangeError);
  });
});
