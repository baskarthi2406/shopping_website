export type CheckoutDetails = {
  readonly name: string;
  readonly mobile: string;
  readonly address: string;
};

export type CheckoutField = "name" | "mobile" | "address";

export type CheckoutFieldErrors = Readonly<Record<CheckoutField, string | null>>;

const EMPTY_ERRORS: CheckoutFieldErrors = { name: null, mobile: null, address: null };

/** Keeps a customer mobile as 10 digits beginning 6–9, or null when it is not one. */
export function normalizeMobile(value: string): string | null {
  const compact = value.replace(/[\s()-]/g, "");
  const local = compact.replace(/^\+91/, "").replace(/^91(?=\d{10}$)/, "").replace(/^0(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(local) ? local : null;
}

export function validateCheckoutDetails(input: {
  readonly name: string;
  readonly mobile: string;
  readonly address: string;
}): { readonly ok: true; readonly details: CheckoutDetails } | { readonly ok: false; readonly errors: CheckoutFieldErrors } {
  const name = input.name.trim().replace(/\s+/g, " ");
  const address = input.address.trim().replace(/[ \t]+/g, " ");
  const mobile = normalizeMobile(input.mobile);
  const errors: Record<CheckoutField, string | null> = { ...EMPTY_ERRORS };

  if (name.length < 2 || name.length > 80 || !/\p{L}/u.test(name)) {
    errors.name = "Enter the customer name.";
  }
  if (mobile === null) {
    errors.mobile = "Enter a valid 10-digit mobile number.";
  }
  if (address.length === 0) {
    errors.address = "Enter a delivery address.";
  } else if (address.length < 8 || address.length > 400) {
    errors.address = "Enter a more complete delivery address.";
  }

  if (errors.name !== null || errors.mobile !== null || errors.address !== null || mobile === null) {
    return { ok: false, errors };
  }
  return { ok: true, details: { name, mobile, address } };
}
