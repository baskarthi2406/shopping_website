import {
  EMPTY_STOREFRONT_CART,
  parseStoredStorefrontCart,
  type StorefrontCart,
} from "@/domain/storefront-cart/storefront-cart";

/** Device-local storefront cart. Separate from the frozen demo cart. */
export const STOREFRONT_CART_STORAGE_KEY = "mini-mystiq-storefront-cart";

type CartStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function readStoredStorefrontCart(storage: Pick<CartStorage, "getItem">): StorefrontCart {
  let raw: string | null;
  try {
    raw = storage.getItem(STOREFRONT_CART_STORAGE_KEY);
  } catch {
    return EMPTY_STOREFRONT_CART;
  }
  if (raw === null || raw === "") {
    return EMPTY_STOREFRONT_CART;
  }
  try {
    return parseStoredStorefrontCart(JSON.parse(raw));
  } catch {
    return EMPTY_STOREFRONT_CART;
  }
}

export function writeStoredStorefrontCart(storage: Pick<CartStorage, "setItem">, cart: StorefrontCart): void {
  storage.setItem(STOREFRONT_CART_STORAGE_KEY, JSON.stringify(cart));
}
