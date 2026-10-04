"use client";

import { useSyncExternalStore } from "react";
import {
  addToCart,
  EMPTY_CART,
  parseStoredCart,
  removeFromCart,
  setCartQuantity,
  type Cart,
  type CartLine,
} from "@/domain/cart/cart";

/** Device-local demo cart (localStorage); no server-side persistence. */
const STORAGE_KEY = "mini-mystiq-demo-cart";
const listeners = new Set<() => void>();
let snapshot: { raw: string | null; cart: Cart } = { raw: null, cart: EMPTY_CART };

function readCart(): Cart {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY_CART;
  }
  if (raw !== snapshot.raw) {
    let parsed: unknown = null;
    try {
      parsed = raw === null ? null : JSON.parse(raw);
    } catch {
      parsed = null;
    }
    snapshot = { raw, cart: parseStoredCart(parsed) };
  }
  return snapshot.cart;
}

function writeCart(cart: Cart): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Storage unavailable (private mode/quota): the cart stays unchanged.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function useDemoCart() {
  const cart = useSyncExternalStore(subscribe, readCart, () => EMPTY_CART);
  return {
    cart,
    add: (line: Omit<CartLine, "quantity">) => writeCart(addToCart(readCart(), line)),
    setQuantity: (variantId: string, quantity: number) =>
      writeCart(setCartQuantity(readCart(), variantId, quantity)),
    remove: (variantId: string) => writeCart(removeFromCart(readCart(), variantId)),
    clear: () => writeCart(EMPTY_CART),
  };
}
