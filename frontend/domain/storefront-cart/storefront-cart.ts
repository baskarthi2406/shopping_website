import { isCurrencyCode, type Money } from "@/domain/catalog";

/**
 * One sellable Zoho item in the storefront cart. Identical product + variant
 * lines merge. Different variants stay separate. `availableToSell` is null
 * when stock is unknown; it is never invented.
 */
export type StorefrontCartAttribute = {
  readonly name: string;
  readonly value: string;
};

export type StorefrontCartLine = {
  readonly productId: string;
  readonly productSlug: string;
  readonly productName: string;
  readonly variantId: string;
  readonly sku: string | null;
  readonly attributes: readonly StorefrontCartAttribute[];
  readonly variantLabel: string;
  readonly unitPrice: Money;
  readonly priceLocale: string;
  readonly quantity: number;
  readonly availableToSell: number | null;
  readonly imageSrc: string | null;
  readonly imageAlt: string | null;
};

export type StorefrontCartDraft = Omit<StorefrontCartLine, "quantity">;

export type StorefrontCart = {
  readonly lines: readonly StorefrontCartLine[];
};

export type StorefrontCartChange = {
  readonly cart: StorefrontCart;
  readonly error: string | null;
};

export const EMPTY_STOREFRONT_CART: StorefrontCart = { lines: [] };

const QUANTITY_MINIMUM_MESSAGE = "Quantity must be at least 1.";

function unchanged(cart: StorefrontCart, error: string): StorefrontCartChange {
  return { cart, error };
}

function accepted(cart: StorefrontCart): StorefrontCartChange {
  return { cart, error: null };
}

function isPositiveInteger(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 1;
}

function stockLimitMessage(availableToSell: number): string {
  return availableToSell <= 0 ? "Out of stock." : `Only ${availableToSell} available.`;
}

function sameLine(line: StorefrontCartLine, draft: StorefrontCartDraft): boolean {
  return line.productId === draft.productId && line.variantId === draft.variantId;
}

function priceError(unitPrice: Money): string | null {
  if (
    typeof unitPrice.amount !== "number" ||
    !Number.isFinite(unitPrice.amount) ||
    unitPrice.amount <= 0 ||
    !isCurrencyCode(unitPrice.currency)
  ) {
    return "Price is currently unavailable.";
  }
  return null;
}

/** Adds `quantity` of one variant. Over-stock requests leave the cart unchanged. */
export function addStorefrontItem(
  cart: StorefrontCart,
  draft: StorefrontCartDraft,
  quantity = 1,
): StorefrontCartChange {
  if (!isPositiveInteger(quantity)) {
    return unchanged(cart, QUANTITY_MINIMUM_MESSAGE);
  }
  const invalidPrice = priceError(draft.unitPrice);
  if (invalidPrice !== null) {
    return unchanged(cart, invalidPrice);
  }
  if (draft.availableToSell === 0) {
    return unchanged(cart, stockLimitMessage(0));
  }

  const existing = cart.lines.find((line) => sameLine(line, draft));
  const nextQuantity = (existing?.quantity ?? 0) + quantity;
  if (!Number.isSafeInteger(nextQuantity)) {
    return unchanged(cart, "Quantity can't be increased.");
  }
  if (draft.availableToSell !== null && nextQuantity > draft.availableToSell) {
    return unchanged(cart, stockLimitMessage(draft.availableToSell));
  }

  const line: StorefrontCartLine = { ...draft, attributes: [...draft.attributes], quantity: nextQuantity };
  if (existing === undefined) {
    return accepted({ lines: [...cart.lines, line] });
  }
  return accepted({
    lines: cart.lines.map((item) => (sameLine(item, draft) ? line : item)),
  });
}

/** Sets a line quantity. Values below 1 or above known stock do not change the cart. */
export function setStorefrontQuantity(
  cart: StorefrontCart,
  variantId: string,
  quantity: number,
): StorefrontCartChange {
  const existing = cart.lines.find((line) => line.variantId === variantId);
  if (existing === undefined) {
    return unchanged(cart, "That item is not in the cart.");
  }
  if (!isPositiveInteger(quantity)) {
    return unchanged(cart, QUANTITY_MINIMUM_MESSAGE);
  }
  if (existing.availableToSell !== null && quantity > existing.availableToSell) {
    return unchanged(cart, stockLimitMessage(existing.availableToSell));
  }
  return accepted({
    lines: cart.lines.map((line) => (line.variantId === variantId ? { ...line, quantity } : line)),
  });
}

export function removeStorefrontItem(cart: StorefrontCart, variantId: string): StorefrontCart {
  return { lines: cart.lines.filter((line) => line.variantId !== variantId) };
}

export function clearStorefrontCart(): StorefrontCart {
  return EMPTY_STOREFRONT_CART;
}

export function storefrontItemCount(cart: StorefrontCart): number {
  return cart.lines.reduce((total, line) => total + line.quantity, 0);
}

export function storefrontLineTotal(line: StorefrontCartLine): Money {
  const minor = Math.round(line.unitPrice.amount * 100) * line.quantity;
  return { amount: minor / 100, currency: line.unitPrice.currency };
}

/** Sum of unit price × quantity. Null when the cart is empty or currencies differ. No tax or shipping. */
export function storefrontSubtotal(cart: StorefrontCart): Money | null {
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
    isCurrencyCode(value.currency)
  );
}

function isAttributes(value: unknown): value is StorefrontCartAttribute[] {
  return (
    Array.isArray(value) &&
    value.every(
      (attribute) =>
        isRecord(attribute) &&
        typeof attribute.name === "string" &&
        attribute.name.trim() !== "" &&
        typeof attribute.value === "string" &&
        attribute.value.trim() !== "",
    )
  );
}

function isOptionalText(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isKnownStock(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isSafeInteger(value) && value >= 0);
}

function lineFromStorage(raw: Record<string, unknown>): StorefrontCartLine | null {
  if (
    typeof raw.productId !== "string" ||
    raw.productId === "" ||
    typeof raw.productSlug !== "string" ||
    raw.productSlug === "" ||
    typeof raw.productName !== "string" ||
    raw.productName.trim() === "" ||
    typeof raw.variantId !== "string" ||
    raw.variantId === "" ||
    !isOptionalText(raw.sku) ||
    !isAttributes(raw.attributes) ||
    typeof raw.variantLabel !== "string" ||
    !isMoney(raw.unitPrice) ||
    typeof raw.priceLocale !== "string" ||
    raw.priceLocale.trim() === "" ||
    typeof raw.quantity !== "number" ||
    !isPositiveInteger(raw.quantity) ||
    !isKnownStock(raw.availableToSell) ||
    !isOptionalText(raw.imageSrc) ||
    !isOptionalText(raw.imageAlt)
  ) {
    return null;
  }

  return {
    productId: raw.productId,
    productSlug: raw.productSlug,
    productName: raw.productName,
    variantId: raw.variantId,
    sku: raw.sku,
    attributes: raw.attributes.map((attribute) => ({ name: attribute.name, value: attribute.value })),
    variantLabel: raw.variantLabel,
    unitPrice: { amount: raw.unitPrice.amount, currency: raw.unitPrice.currency },
    priceLocale: raw.priceLocale,
    quantity: raw.quantity,
    availableToSell: raw.availableToSell,
    imageSrc: raw.imageSrc,
    imageAlt: raw.imageAlt,
  };
}

/** Restores a cart from untrusted storage. Invalid payloads become an empty cart. */
export function parseStoredStorefrontCart(value: unknown): StorefrontCart {
  if (!isRecord(value) || !Array.isArray(value.lines)) {
    return EMPTY_STOREFRONT_CART;
  }

  const lines: StorefrontCartLine[] = [];
  for (const raw of value.lines) {
    if (!isRecord(raw)) {
      continue;
    }
    const line = lineFromStorage(raw);
    if (line === null) {
      continue;
    }
    const existing = lines.find((item) => item.productId === line.productId && item.variantId === line.variantId);
    if (existing === undefined) {
      lines.push(line);
      continue;
    }
    const quantity = existing.quantity + line.quantity;
    if (!Number.isSafeInteger(quantity)) {
      continue;
    }
    lines[lines.indexOf(existing)] = { ...existing, quantity };
  }
  return { lines };
}
