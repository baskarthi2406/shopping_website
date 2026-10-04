import {
  validateInventory,
  validatePricing,
  type Inventory,
  type Pricing,
} from "@/domain/catalog";

/**
 * Field provenance rules (ADR 0007). Pure and deterministic: the evaluation
 * time is always supplied by the caller. Provenance is server-side only and is
 * not part of the public catalog contract. Price and inventory are evaluated
 * independently, each with its own policy.
 */
export type ProvenanceState = "verified" | "missing" | "unknown" | "stale";

/** Why a field is not `verified`; `null` when it is. */
export type ProvenanceReason =
  | "no_observation"
  | "owner_unset"
  | "source_invalid"
  | "source_mismatch"
  | "timestamp_invalid"
  | "timestamp_future"
  | "value_invalid"
  | "value_absent"
  | "missing_expired"
  | "expired";

/** 24 hours: the owner-approved S6-T13 freshness threshold (ADR 0007). */
export const DEFAULT_FRESHNESS_THRESHOLD_MS = 24 * 60 * 60 * 1000;

/**
 * What a source reported for one field group. `value: null` means the source
 * was asked and returned no value. `observedAt` is ISO 8601 with an explicit
 * offset (`Z` or `±HH:MM`).
 */
export type FieldObservation<T> = {
  readonly source: string;
  readonly observedAt: string;
  readonly value: T | null;
};

export type ProvenancePolicy = {
  /** Expected owning source; `null` while ownership is open (field stays unknown). */
  readonly ownerSource: string | null;
  /** Inclusive maximum age in milliseconds. */
  readonly freshnessThresholdMs: number;
};

export type FieldProvenance = {
  readonly state: ProvenanceState;
  readonly reason: ProvenanceReason | null;
};

export type ResolvedPricing = {
  readonly provenance: FieldProvenance;
  /** Contract value: the observed pricing only when verified, otherwise `null`. */
  readonly pricing: Pricing | null;
};

export type ResolvedInventory = {
  readonly provenance: FieldProvenance;
  /**
   * Contract value: observed inventory when verified; for stale data, `null`
   * quantities with status `unknown`; otherwise `null`.
   */
  readonly inventory: Inventory | null;
};

const ISO_TIMESTAMP =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?(Z|[+-](\d{2}):(\d{2}))$/;

/** Epoch milliseconds for a strict ISO 8601 timestamp with offset, else `null`. */
export function parseObservationTime(value: unknown): number | null {
  if (typeof value !== "string") {
    return null;
  }
  const match = ISO_TIMESTAMP.exec(value);
  if (match === null) {
    return null;
  }
  const [, year, month, day, hour, minute, second = "0", , offsetHour, offsetMinute] = match;
  const daysInMonth = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
  if (
    Number(month) < 1 ||
    Number(month) > 12 ||
    Number(day) < 1 ||
    Number(day) > daysInMonth ||
    Number(hour) > 23 ||
    Number(minute) > 59 ||
    Number(second) > 59 ||
    (offsetHour !== undefined && (Number(offsetHour) > 23 || Number(offsetMinute) > 59))
  ) {
    return null;
  }
  const epoch = Date.parse(value);
  return Number.isFinite(epoch) ? epoch : null;
}

function requireEvaluationTime(evaluatedAt: string): number {
  const epoch = parseObservationTime(evaluatedAt);
  if (epoch === null) {
    throw new RangeError("evaluatedAt must be an ISO 8601 timestamp with an offset");
  }
  return epoch;
}

function requirePolicy(policy: ProvenancePolicy): void {
  if (!Number.isSafeInteger(policy.freshnessThresholdMs) || policy.freshnessThresholdMs < 0) {
    throw new RangeError("freshnessThresholdMs must be a non-negative integer");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMoneyShape(value: unknown): boolean {
  return isRecord(value) && typeof value.amount === "number" && typeof value.currency === "string";
}

function isNullableQuantity(value: unknown): boolean {
  return value === null || typeof value === "number";
}

/** Structurally a `Pricing` and valid under the existing contract rules. */
export function isValidPricing(value: unknown): value is Pricing {
  return (
    isRecord(value) &&
    isMoneyShape(value.price) &&
    (value.compareAtPrice === null || isMoneyShape(value.compareAtPrice)) &&
    validatePricing(value as Pricing).length === 0
  );
}

/** Structurally an `Inventory` and valid under the existing contract rules. */
export function isValidInventory(value: unknown): value is Inventory {
  return (
    isRecord(value) &&
    isNullableQuantity(value.stockOnHand) &&
    isNullableQuantity(value.availableToSell) &&
    isNullableQuantity(value.reserved) &&
    (value.status === "unknown" || value.status === "in_stock" || value.status === "out_of_stock") &&
    validateInventory(value as Inventory).length === 0
  );
}

function state(state: ProvenanceState, reason: ProvenanceReason | null): FieldProvenance {
  return { state, reason };
}

/**
 * Classifies one observation. Order: missing evidence or an unreliable source
 * or timestamp (including any future timestamp) → `unknown`; no value →
 * `missing`, or `unknown` once older than the threshold; invalid value →
 * `unknown`; older than the threshold → `stale`; otherwise `verified`. An age
 * exactly equal to the threshold is still fresh.
 */
export function evaluateFieldProvenance(
  observation: FieldObservation<unknown> | null | undefined,
  policy: ProvenancePolicy,
  evaluatedAt: string,
  isValidValue: (value: unknown) => boolean,
): FieldProvenance {
  const now = requireEvaluationTime(evaluatedAt);
  requirePolicy(policy);

  if (observation === null || observation === undefined) {
    return state("unknown", "no_observation");
  }
  if (policy.ownerSource === null) {
    return state("unknown", "owner_unset");
  }
  if (typeof observation.source !== "string" || observation.source.trim() === "") {
    return state("unknown", "source_invalid");
  }
  if (observation.source !== policy.ownerSource) {
    return state("unknown", "source_mismatch");
  }
  const observedAt = parseObservationTime(observation.observedAt);
  if (observedAt === null) {
    return state("unknown", "timestamp_invalid");
  }
  if (observedAt > now) {
    return state("unknown", "timestamp_future");
  }

  const expired = now - observedAt > policy.freshnessThresholdMs;
  if (observation.value === null) {
    return expired ? state("unknown", "missing_expired") : state("missing", "value_absent");
  }
  if (!isValidValue(observation.value)) {
    return state("unknown", "value_invalid");
  }
  return expired ? state("stale", "expired") : state("verified", null);
}

/** Price is exposed only when verified; stale, missing, and unknown hide it. */
export function resolvePricingProvenance(
  observation: FieldObservation<Pricing> | null | undefined,
  policy: ProvenancePolicy,
  evaluatedAt: string,
): ResolvedPricing {
  const provenance = evaluateFieldProvenance(observation, policy, evaluatedAt, isValidPricing);
  return {
    provenance,
    pricing: provenance.state === "verified" ? (observation?.value ?? null) : null,
  };
}

const STALE_INVENTORY: Inventory = {
  stockOnHand: null,
  availableToSell: null,
  reserved: null,
  status: "unknown",
};

/** Stale stock never implies availability: quantities `null`, status `unknown`. */
export function resolveInventoryProvenance(
  observation: FieldObservation<Inventory> | null | undefined,
  policy: ProvenancePolicy,
  evaluatedAt: string,
): ResolvedInventory {
  const provenance = evaluateFieldProvenance(observation, policy, evaluatedAt, isValidInventory);
  const inventory =
    provenance.state === "verified"
      ? (observation?.value ?? null)
      : provenance.state === "stale"
        ? STALE_INVENTORY
        : null;
  return { provenance, inventory };
}
