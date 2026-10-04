"use client";

import Link from "next/link";
import { TAX_TREATMENT_NOTICE } from "@/application/checkout/demo-order";
import { cartSubtotal, MAX_LINE_QUANTITY } from "@/domain/cart/cart";
import { useDemoCart } from "@/components/demo/demo-cart-store";
import {
  formatDemoMoney,
  headingClass,
  primaryButton,
  secondaryButton,
} from "@/components/demo/demo-ui";

export function DemoCartView() {
  const { cart, setQuantity, remove } = useDemoCart();
  const subtotal = cartSubtotal(cart);

  if (cart.lines.length === 0) {
    return (
      <section className="space-y-4">
        <h1 className={headingClass}>Cart</h1>
        <p className="text-body text-foreground-secondary">Your cart is empty.</p>
        <Link href="/demo" className={secondaryButton}>
          Back to products
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className={headingClass}>Cart</h1>
      <ul className="divide-y divide-border rounded-md border border-border bg-surface">
        {cart.lines.map((line) => {
          const max = Math.min(MAX_LINE_QUANTITY, line.maxQuantity);
          return (
            <li key={line.variantId} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{line.productName}</p>
                <p className="text-small text-foreground-secondary">
                  {line.variantLabel}
                  {line.sku ? ` · SKU ${line.sku}` : ""}
                </p>
                <p className="text-small text-foreground">{formatDemoMoney(line.unitPrice)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={secondaryButton}
                  aria-label={`Decrease quantity of ${line.productName} ${line.variantLabel}`}
                  onClick={() => setQuantity(line.variantId, line.quantity - 1)}
                >
                  −
                </button>
                <span aria-live="polite" className="min-w-8 text-center text-body">
                  {line.quantity}
                </span>
                <button
                  type="button"
                  className={secondaryButton}
                  aria-label={`Increase quantity of ${line.productName} ${line.variantLabel}`}
                  disabled={line.quantity >= max}
                  onClick={() => setQuantity(line.variantId, line.quantity + 1)}
                >
                  +
                </button>
              </div>
              <button type="button" className={secondaryButton} onClick={() => remove(line.variantId)}>
                Remove
              </button>
            </li>
          );
        })}
      </ul>
      <div className="space-y-1">
        <p className="text-body font-semibold text-foreground">
          Subtotal: {subtotal === null ? "Unavailable" : formatDemoMoney(subtotal)}
        </p>
        <p className="text-small text-foreground-secondary">{TAX_TREATMENT_NOTICE}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/demo/checkout" className={primaryButton}>
          Proceed to checkout
        </Link>
        <Link href="/demo" className={secondaryButton}>
          Continue shopping
        </Link>
      </div>
    </section>
  );
}
