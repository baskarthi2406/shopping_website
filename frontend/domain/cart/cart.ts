import type { Money } from "@/domain/catalog";

/**
 * Device-local cart line. `unitPrice` is the price shown when the line was
 * added; checkout re-validates it against the provider before ordering.
 * `maxQuantity` is the available-to-sell quantity known at that time.
 */
export type CartLine = {
  readonly productId: string;
  readonly variantId: string;
  readonly productName: string;
  readonly variantLabel: string;
  readonly sku: string | null;
  readonly unitPrice: Money;
  readonly quantity: number;
  readonly maxQuantity: number;
};

export type Cart = {
  readonly lines: readonly CartLine[];
};

export const EMPTY_CART: Cart = { lines: [] };

/** Upper bound per line regardless of stock; keeps demo orders small. */
export const MAX_LINE_QUANTITY = 10;

function clampQuantity(quantity: number, maxQuantity: number): number {
  const cap = Math.min(MAX_LINE_QUANTITY, Math.max(0, Math.floor(maxQuantity)));
  if (!Number.isFinite(quantity)) {
    return 0;
  }
  return Math.max(0, Math.min(cap, Math.floor(quantity)));
}

/** Adds `quantity` of a variant, merging with an existing line. */
export function addToCart(
  cart: Cart,
  line: Omit<CartLine, "quantity">,
  quantity = 1,
): Cart {
  const existing = cart.lines.find((item) => item.variantId === line.variantId);
  if (existing === undefined) {
    const next = clampQuantity(quantity, line.maxQuantity);
    return next === 0 ? cart : { lines: [...cart.lines, { ...line, quantity: next }] };
  }
  return setCartQuantity(
    { lines: cart.lines.map((item) => (item === existing ? { ...item, ...line } : item)) },
    line.variantId,
    existing.quantity + quantity,
  );
}

/** Sets a line's quantity; zero or less removes it. */
export function setCartQuantity(cart: Cart, variantId: string, quantity: number): Cart {
  const lines: CartLine[] = [];
  for (const line of cart.lines) {
    if (line.variantId !== variantId) {
      lines.push(line);
      continue;
    }
    const next = clampQuantity(quantity, line.maxQuantity);
    if (next > 0) {
      lines.push({ ...line, quantity: next });
    }
  }
  return { lines };
}

export function removeFromCart(cart: Cart, variantId: string): Cart {
  return { lines: cart.lines.filter((line) => line.variantId !== variantId) };
}

export function cartItemCount(cart: Cart): number {
  return cart.lines.reduce((total, line) => total + line.quantity, 0);
}

/**
 * Sum of unit price × quantity in minor units to avoid float drift. Returns
 * `null` for an empty cart or mixed currencies. No tax or shipping.
 */
export function cartSubtotal(cart: Cart): Money | null {
  if (cart.lines.length === 0) {
    return null;
  }
  const currency = cart.lines[0].unitPrice.currency;
  if (cart.lines.some((line) => line.unitPrice.currency !== currency)) {
    return null;
  }
  const minor = cart.lines.reduce(
    (total, line) => total + Math.round(line.unitPrice.amount * 100) * line.quantity,
    0,
  );
  return { amount: minor / 100, currency };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMoney(value: unknown): value is Money {
  return (
    isRecord(value) &&
    typeof value.amount === "number" &&
    Number.isFinite(value.amount) &&
    value.amount > 0 &&
    typeof value.currency === "string" &&
    /^[A-Z]{3}$/.test(value.currency)
  );
}

/** Restores a cart from untrusted storage, dropping malformed lines. */
export function parseStoredCart(value: unknown): Cart {
  if (!isRecord(value) || !Array.isArray(value.lines)) {
    return EMPTY_CART;
  }
  let cart = EMPTY_CART;
  for (const raw of value.lines) {
    if (
      !isRecord(raw) ||
      typeof raw.productId !== "string" ||
      typeof raw.variantId !== "string" ||
      raw.variantId === "" ||
      typeof raw.productName !== "string" ||
      typeof raw.variantLabel !== "string" ||
      !(raw.sku === null || typeof raw.sku === "string") ||
      !isMoney(raw.unitPrice) ||
      typeof raw.quantity !== "number" ||
      typeof raw.maxQuantity !== "number"
    ) {
      continue;
    }
    cart = addToCart(
      cart,
      {
        productId: raw.productId,
        variantId: raw.variantId,
        productName: raw.productName,
        variantLabel: raw.variantLabel,
        sku: raw.sku,
        unitPrice: raw.unitPrice,
        maxQuantity: raw.maxQuantity,
      },
      raw.quantity,
    );
  }
  return cart;
}
