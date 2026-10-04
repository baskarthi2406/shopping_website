"use client";

import { useSyncExternalStore } from "react";
import {
  readStoredStorefrontCart,
  STOREFRONT_CART_STORAGE_KEY,
  writeStoredStorefrontCart,
} from "@/application/storefront-cart/browser-cart-store";
import {
  addStorefrontItem,
  clearStorefrontCart,
  EMPTY_STOREFRONT_CART,
  removeStorefrontItem,
  setStorefrontQuantity,
  type StorefrontCart,
  type StorefrontCartChange,
  type StorefrontCartDraft,
} from "@/domain/storefront-cart/storefront-cart";

const listeners = new Set<() => void>();
let cache: { raw: string | null; cart: StorefrontCart } = {
  raw: null,
  cart: EMPTY_STOREFRONT_CART,
};

function readCart(): StorefrontCart {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STOREFRONT_CART_STORAGE_KEY);
  } catch {
    return EMPTY_STOREFRONT_CART;
  }
  if (raw !== cache.raw) {
    cache = { raw, cart: readStoredStorefrontCart(window.localStorage) };
  }
  return cache.cart;
}

function commit(cart: StorefrontCart): void {
  const raw = JSON.stringify(cart);
  try {
    writeStoredStorefrontCart(window.localStorage, cart);
  } catch {
    // Storage can be blocked. Keep the cart for this page session.
  }
  cache = { raw, cart };
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function useStorefrontCart() {
  const cart = useSyncExternalStore(subscribe, readCart, () => EMPTY_STOREFRONT_CART);
  return {
    cart,
    add(draft: StorefrontCartDraft, quantity = 1): StorefrontCartChange {
      const result = addStorefrontItem(readCart(), draft, quantity);
      if (result.error === null) {
        commit(result.cart);
      }
      return result;
    },
    setQuantity(variantId: string, quantity: number): StorefrontCartChange {
      const result = setStorefrontQuantity(readCart(), variantId, quantity);
      if (result.error === null) {
        commit(result.cart);
      }
      return result;
    },
    remove(variantId: string): void {
      commit(removeStorefrontItem(readCart(), variantId));
    },
    clear(): void {
      commit(clearStorefrontCart());
    },
  };
}
