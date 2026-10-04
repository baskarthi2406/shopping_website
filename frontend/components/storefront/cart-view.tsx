"use client";

import { useState } from "react";
import Link from "next/link";
import { CatalogImage } from "@/components/storefront/catalog-image";
import { STOREFRONT_TAX_NOTE } from "@/application/storefront-cart/tax-policy";
import { formatCartMoney } from "@/application/storefront-cart/cart-candidate";
import { useStorefrontCart } from "@/application/storefront-cart/use-storefront-cart";
import {
  storefrontItemCount,
  storefrontLineTotal,
  storefrontSubtotal,
  type StorefrontCartLine,
} from "@/domain/storefront-cart/storefront-cart";

const primaryButton =
  "inline-flex min-h-[var(--mm-tap-min)] w-full items-center justify-center rounded-md bg-primary px-4 text-small font-semibold text-primary-foreground transition-colors duration-[var(--mm-duration)] hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:w-auto";

const quietButton =
  "inline-flex min-h-[var(--mm-tap-min)] min-w-[var(--mm-tap-min)] items-center justify-center rounded-md border border-border px-3 text-small text-foreground hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50";

function CartLineRow({
  line,
  notice,
  onSetQuantity,
  onRemove,
}: {
  line: StorefrontCartLine;
  notice: string | null;
  onSetQuantity: (variantId: string, quantity: number) => string | null;
  onRemove: (variantId: string) => void;
}) {
  return (
    <article className="min-w-0 border-b border-border py-4">
      <div className="flex min-w-0 gap-3">
        {line.imageSrc ? (
          <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-surface">
            <CatalogImage
              src={line.imageSrc}
              alt={line.imageAlt ?? line.productName}
              sizes="80px"
              className="object-contain"
            />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="break-words font-display text-h3 font-semibold text-foreground">
            <Link href={`/p/${line.productSlug}`} className="hover:text-primary">
              {line.productName}
            </Link>
          </h2>
          <p className="mt-1 break-words text-small text-foreground-secondary">{line.variantLabel}</p>
          {line.sku ? (
            <p className="mt-1 break-words text-small text-foreground-secondary">
              <span className="sr-only">SKU: </span>
              {line.sku}
            </p>
          ) : null}
          <p className="mt-2 text-small text-foreground">
            <span className="sr-only">Unit price: </span>
            {formatCartMoney(line.unitPrice, line.priceLocale)}
          </p>
          <p className="text-small font-semibold text-foreground">
            <span className="sr-only">Line total: </span>
            {formatCartMoney(storefrontLineTotal(line), line.priceLocale)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={quietButton}
              aria-label={`Decrease quantity of ${line.productName}`}
              disabled={line.quantity <= 1}
              onClick={() => onSetQuantity(line.variantId, line.quantity - 1)}
            >
              −
            </button>
            <span className="min-w-8 text-center text-small" aria-live="polite">
              <span className="sr-only">Quantity: </span>
              {line.quantity}
            </span>
            <button
              type="button"
              className={quietButton}
              aria-label={`Increase quantity of ${line.productName}`}
              onClick={() => onSetQuantity(line.variantId, line.quantity + 1)}
            >
              +
            </button>
            <button
              type="button"
              className={quietButton}
              onClick={() => onRemove(line.variantId)}
            >
              Remove
            </button>
          </div>
          {notice ? (
            <p role="alert" className="mt-2 text-small font-semibold text-foreground">
              {notice}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function CartView() {
  const { cart, setQuantity, remove, clear } = useStorefrontCart();
  const [notices, setNotices] = useState<Readonly<Record<string, string>>>({});
  const count = storefrontItemCount(cart);
  const subtotal = storefrontSubtotal(cart);

  if (cart.lines.length === 0) {
    return (
      <div className="min-w-0">
        <h1 className="font-display text-h1 font-semibold tracking-tight text-foreground">Cart</h1>
        <p className="mt-4 text-body text-foreground-secondary">Your cart is empty.</p>
        <Link href="/" className={`${primaryButton} mt-6`}>
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <h1 className="font-display text-h1 font-semibold tracking-tight text-foreground">Cart</h1>
      <p className="mt-2 text-small text-foreground-secondary">
        {count} {count === 1 ? "item" : "items"}
      </p>
      <div className="mt-4">
        {cart.lines.map((line) => (
          <CartLineRow
            key={line.variantId}
            line={line}
            notice={notices[line.variantId] ?? null}
            onSetQuantity={(variantId, quantity) => {
              const result = setQuantity(variantId, quantity);
              setNotices((current) => ({ ...current, [variantId]: result.error ?? "" }));
              return result.error;
            }}
            onRemove={(variantId) => {
              remove(variantId);
              setNotices((current) => ({ ...current, [variantId]: "" }));
            }}
          />
        ))}
      </div>
      <div className="mt-6 min-w-0">
        {subtotal !== null ? (
          <p className="text-body font-semibold text-foreground">
            Subtotal: {formatCartMoney(subtotal, cart.lines[0].priceLocale)}
          </p>
        ) : (
          <p className="text-body font-semibold text-foreground">Subtotal is unavailable.</p>
        )}
        <p className="mt-1 text-small text-foreground-secondary">{STOREFRONT_TAX_NOTE}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link href="/checkout" className={primaryButton}>
            Proceed to checkout
          </Link>
          <Link href="/" className={quietButton}>
            Continue shopping
          </Link>
          <button type="button" className={quietButton} onClick={() => clear()}>
            Clear cart
          </button>
        </div>
      </div>
    </div>
  );
}
