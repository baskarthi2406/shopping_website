import type { Money } from "@/domain/catalog";

/** The only payment method the demo supports; no payment is collected. */
export const DEMO_PAYMENT_METHOD = "demo_cod";
export const DEMO_PAYMENT_LABEL = "Demo / COD";
export const DEMO_ORDER_LABEL = "MINI MYSTIQ DEMO - DO NOT FULFILL";
export const TAX_TREATMENT_NOTICE = "Tax treatment: to be confirmed before production checkout.";

export const MAX_ORDER_LINES = 10;
export const MAX_ORDER_LINE_QUANTITY = 10;
const NAME_MAX = 80;
const ADDRESS_MIN = 10;
const ADDRESS_MAX = 300;

/** Client-generated idempotency reference, reused for retries of one checkout. */
const REFERENCE_PATTERN = /^MMDEMO-[A-Z0-9]{10}$/;

export type DemoCustomer = {
  readonly name: string;
  /** Ten-digit Indian mobile number without country code. */
  readonly mobile: string;
  readonly address: string;
};

export type DemoOrderLine = {
  readonly variantId: string;
  readonly quantity: number;
  /** Price the shopper saw; must still match the provider price. */
  readonly unitPrice: Money;
};

export type PlaceDemoOrderRequest = {
  readonly reference: string;
  readonly customer: DemoCustomer;
  readonly paymentMethod: typeof DEMO_PAYMENT_METHOD;
  readonly lines: readonly DemoOrderLine[];
};

export type CheckoutField = "reference" | "name" | "mobile" | "address" | "paymentMethod" | "lines";

export type CheckoutValidation =
  | { readonly ok: true; readonly value: PlaceDemoOrderRequest }
  | { readonly ok: false; readonly errors: Partial<Record<CheckoutField, string>> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim() : "";
}

/** Accepts 10 digits starting 6–9, optionally prefixed with +91/91/0 and spaces or dashes. */
export function normalizeIndianMobile(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const digits = value.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

/** Customer fields only; shared by the checkout form and the server. */
export function validateDemoCustomer(
  input: unknown,
): { customer: DemoCustomer | null; errors: Partial<Record<CheckoutField, string>> } {
  const record = isRecord(input) ? input : {};
  const errors: Partial<Record<CheckoutField, string>> = {};
  const name = cleanText(record.name);
  const mobile = normalizeIndianMobile(record.mobile);
  const address = cleanText(record.address);
  if (name.length < 2 || name.length > NAME_MAX) {
    errors.name = `Enter a name (2–${NAME_MAX} characters).`;
  }
  if (mobile === null) {
    errors.mobile = "Enter a valid 10-digit mobile number.";
  }
  if (address.length < ADDRESS_MIN || address.length > ADDRESS_MAX) {
    errors.address = `Enter an address (${ADDRESS_MIN}–${ADDRESS_MAX} characters).`;
  }
  return {
    customer: Object.keys(errors).length === 0 ? { name, mobile: mobile!, address } : null,
    errors,
  };
}

function parseLine(raw: unknown): DemoOrderLine | null {
  if (!isRecord(raw) || !isRecord(raw.unitPrice)) {
    return null;
  }
  const { variantId, quantity } = raw;
  const { amount, currency } = raw.unitPrice;
  if (
    typeof variantId !== "string" ||
    !/^[A-Za-z0-9_-]{1,64}$/.test(variantId) ||
    typeof quantity !== "number" ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_ORDER_LINE_QUANTITY ||
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    typeof currency !== "string" ||
    !/^[A-Z]{3}$/.test(currency)
  ) {
    return null;
  }
  return { variantId, quantity, unitPrice: { amount, currency } };
}

/** Validates an untrusted place-order body. */
export function parsePlaceDemoOrderRequest(body: unknown): CheckoutValidation {
  const record = isRecord(body) ? body : {};
  const { customer, errors } = validateDemoCustomer(record.customer);

  const reference = typeof record.reference === "string" ? record.reference : "";
  if (!REFERENCE_PATTERN.test(reference)) {
    errors.reference = "Invalid order reference.";
  }
  if (record.paymentMethod !== DEMO_PAYMENT_METHOD) {
    errors.paymentMethod = `Select ${DEMO_PAYMENT_LABEL}.`;
  }

  const rawLines = Array.isArray(record.lines) ? record.lines : [];
  const lines = rawLines.map(parseLine);
  const variantIds = new Set(lines.flatMap((line) => (line === null ? [] : [line.variantId])));
  if (
    rawLines.length === 0 ||
    rawLines.length > MAX_ORDER_LINES ||
    lines.some((line) => line === null) ||
    variantIds.size !== lines.length
  ) {
    errors.lines = "The cart is empty or contains an invalid item.";
  }

  if (Object.keys(errors).length > 0 || customer === null) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    value: {
      reference,
      customer,
      paymentMethod: DEMO_PAYMENT_METHOD,
      lines: lines as DemoOrderLine[],
    },
  };
}

/** Generates a checkout reference (`MMDEMO-` + 10 base-32 characters). */
export function createDemoOrderReference(randomValues: (length: number) => Uint8Array): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomValues(10);
  return `MMDEMO-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")}`;
}
