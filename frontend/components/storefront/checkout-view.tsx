"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCartMoney } from "@/application/storefront-cart/cart-candidate";
import { CatalogImage } from "@/components/storefront/catalog-image";
import { STOREFRONT_TAX_NOTE } from "@/application/storefront-cart/tax-policy";
import {
  validateCheckoutDetails,
  type CheckoutDetails,
  type CheckoutFieldErrors,
} from "@/application/storefront-cart/checkout-details";
import type { StorefrontCartIssue } from "@/application/storefront-cart/validate-storefront-cart";
import { useStorefrontCart } from "@/application/storefront-cart/use-storefront-cart";
import {
  storefrontLineTotal,
  storefrontSubtotal,
  type StorefrontCart,
} from "@/domain/storefront-cart/storefront-cart";

const primaryButton =
  "inline-flex min-h-[var(--mm-tap-min)] w-full items-center justify-center rounded-md bg-primary px-4 text-small font-semibold text-primary-foreground transition-colors duration-[var(--mm-duration)] hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto";

const quietButton =
  "inline-flex min-h-[var(--mm-tap-min)] w-full items-center justify-center rounded-md border border-border bg-background px-4 text-small font-semibold text-foreground hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:w-auto";

const fieldClass =
  "mt-1 w-full min-w-0 rounded-md border border-border bg-background px-3 py-2 text-body text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

async function checkCart(cart: StorefrontCart): Promise<readonly StorefrontCartIssue[]> {
  const response = await fetch("/api/storefront-cart/validate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      lines: cart.lines.map((line) => ({
        productId: line.productId,
        productSlug: line.productSlug,
        variantId: line.variantId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      })),
    }),
  });
  if (!response.ok && response.status !== 400) {
    return [{ variantId: "", message: "The catalog could not be checked. Try again." }];
  }
  const body = (await response.json()) as { issues?: StorefrontCartIssue[] };
  return Array.isArray(body.issues) ? body.issues : [{ variantId: "", message: "The catalog could not be checked. Try again." }];
}

export function OrderReview({
  cart,
  details,
  onEditDetails,
}: {
  cart: StorefrontCart;
  details: CheckoutDetails;
  onEditDetails: () => void;
}) {
  const subtotal = storefrontSubtotal(cart);

  return (
    <div className="min-w-0">
      <h1 className="font-display text-h1 font-semibold tracking-tight text-foreground">Order review</h1>
      <p className="mt-3 text-body font-semibold text-foreground">
        Order submission is not connected yet.
      </p>
      <p className="mt-2 text-small text-foreground-secondary">
        This does not place an order or take payment. Payment will be added in a later step.
      </p>

      <h2 className="mt-6 font-display text-h3 font-semibold text-foreground">Items</h2>
      <ul className="mt-3 divide-y divide-border">
        {cart.lines.map((line) => (
          <li key={line.variantId} className="flex min-w-0 gap-3 py-3">
            {line.imageSrc ? (
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-surface">
                <CatalogImage
                  src={line.imageSrc}
                  alt={line.imageAlt ?? line.productName}
                  sizes="56px"
                  className="object-contain"
                />
              </div>
            ) : null}
            <div className="min-w-0">
              <p className="break-words font-semibold text-foreground">{line.productName}</p>
              <p className="break-words text-small text-foreground-secondary">{line.variantLabel}</p>
              {line.sku ? <p className="break-words text-small text-foreground-secondary">{line.sku}</p> : null}
              <p className="text-small text-foreground">
                Quantity {line.quantity} · {formatCartMoney(storefrontLineTotal(line), line.priceLocale)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {subtotal !== null ? (
        <p className="mt-4 text-body font-semibold text-foreground">
          Subtotal: {formatCartMoney(subtotal, cart.lines[0].priceLocale)}
        </p>
      ) : null}
      <p className="mt-1 text-small text-foreground-secondary">{STOREFRONT_TAX_NOTE}</p>

      <h2 className="mt-6 font-display text-h3 font-semibold text-foreground">Customer</h2>
      <dl className="mt-3 space-y-2 text-body">
        <div>
          <dt className="text-small text-foreground-secondary">Name</dt>
          <dd className="break-words">{details.name}</dd>
        </div>
        <div>
          <dt className="text-small text-foreground-secondary">Mobile</dt>
          <dd>{details.mobile}</dd>
        </div>
        <div>
          <dt className="text-small text-foreground-secondary">Delivery address</dt>
          <dd className="break-words whitespace-pre-wrap">{details.address}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button type="button" className={quietButton} onClick={onEditDetails}>
          Edit details
        </button>
        <Link href="/cart" className={quietButton}>
          Back to cart
        </Link>
      </div>
    </div>
  );
}

export function CheckoutView() {
  const { cart } = useStorefrontCart();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<CheckoutFieldErrors>({ name: null, mobile: null, address: null });
  const [issues, setIssues] = useState<readonly StorefrontCartIssue[]>([]);
  const [checking, setChecking] = useState(false);
  const [review, setReview] = useState<CheckoutDetails | null>(null);
  const subtotal = storefrontSubtotal(cart);

  if (cart.lines.length === 0) {
    return (
      <div className="min-w-0">
        <h1 className="font-display text-h1 font-semibold tracking-tight text-foreground">Checkout</h1>
        <p className="mt-4 text-body text-foreground-secondary">Your cart is empty.</p>
        <Link href="/" className={`${primaryButton} mt-6`}>
          Continue shopping
        </Link>
      </div>
    );
  }

  if (review !== null) {
    return <OrderReview cart={cart} details={review} onEditDetails={() => setReview(null)} />;
  }

  return (
    <div className="min-w-0">
      <h1 className="font-display text-h1 font-semibold tracking-tight text-foreground">Checkout</h1>
      <p className="mt-2 text-small text-foreground-secondary">
        Subtotal {subtotal !== null ? formatCartMoney(subtotal, cart.lines[0].priceLocale) : "unavailable"}.{" "}
        {STOREFRONT_TAX_NOTE}
      </p>
      <form
        className="mt-6 max-w-xl min-w-0 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const result = validateCheckoutDetails({ name, mobile, address });
          if (!result.ok) {
            setErrors(result.errors);
            setReview(null);
            return;
          }
          setErrors({ name: null, mobile: null, address: null });
          setChecking(true);
          void checkCart(cart)
            .then((nextIssues) => {
              setIssues(nextIssues);
              if (nextIssues.length === 0) {
                setReview(result.details);
              }
            })
            .catch(() => {
              setIssues([{ variantId: "", message: "The catalog could not be checked. Try again." }]);
            })
            .finally(() => setChecking(false));
        }}
      >
        <div>
          <label htmlFor="checkout-name" className="text-small font-semibold text-foreground">
            Customer name
          </label>
          <input
            id="checkout-name"
            name="name"
            autoComplete="name"
            value={name}
            aria-invalid={errors.name !== null}
            onChange={(event) => setName(event.target.value)}
            className={fieldClass}
          />
          {errors.name ? <p className="mt-1 text-small font-semibold text-foreground">{errors.name}</p> : null}
        </div>
        <div>
          <label htmlFor="checkout-mobile" className="text-small font-semibold text-foreground">
            Mobile number
          </label>
          <input
            id="checkout-mobile"
            name="mobile"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={mobile}
            aria-invalid={errors.mobile !== null}
            onChange={(event) => setMobile(event.target.value)}
            className={fieldClass}
          />
          {errors.mobile ? <p className="mt-1 text-small font-semibold text-foreground">{errors.mobile}</p> : null}
        </div>
        <div>
          <label htmlFor="checkout-address" className="text-small font-semibold text-foreground">
            Delivery address
          </label>
          <textarea
            id="checkout-address"
            name="address"
            autoComplete="street-address"
            rows={4}
            value={address}
            aria-invalid={errors.address !== null}
            onChange={(event) => setAddress(event.target.value)}
            className={fieldClass}
          />
          {errors.address ? <p className="mt-1 text-small font-semibold text-foreground">{errors.address}</p> : null}
        </div>
        {issues.length > 0 ? (
          <ul className="space-y-1">
            {issues.map((issue) => (
              <li key={`${issue.variantId}-${issue.message}`} className="text-small font-semibold text-foreground">
                {issue.message}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button type="submit" className={primaryButton} disabled={checking}>
            Review order
          </button>
          <Link href="/cart" className={quietButton}>
            Back to cart
          </Link>
        </div>
      </form>
    </div>
  );
}
