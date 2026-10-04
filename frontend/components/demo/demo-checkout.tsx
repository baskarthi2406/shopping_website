"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import {
  createDemoOrderReference,
  DEMO_PAYMENT_LABEL,
  DEMO_PAYMENT_METHOD,
  TAX_TREATMENT_NOTICE,
  validateDemoCustomer,
  type CheckoutField,
} from "@/application/checkout/demo-order";
import { cartSubtotal } from "@/domain/cart/cart";
import { useDemoCart } from "@/components/demo/demo-cart-store";
import {
  formatDemoMoney,
  headingClass,
  primaryButton,
  secondaryButton,
} from "@/components/demo/demo-ui";

/** One reference per checkout attempt; reused on retry so the server dedupes. */
const REFERENCE_KEY = "mini-mystiq-demo-checkout-reference";

type Confirmation = { reference: string; orderNumber: string; customerName: string };
type FieldErrors = Partial<Record<CheckoutField, string>>;

function checkoutReference(): string {
  const stored = window.sessionStorage.getItem(REFERENCE_KEY);
  if (stored !== null) return stored;
  const reference = createDemoOrderReference((length) =>
    window.crypto.getRandomValues(new Uint8Array(length)),
  );
  window.sessionStorage.setItem(REFERENCE_KEY, reference);
  return reference;
}

const inputClass =
  "mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-body text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export function DemoCheckout({ providerLabel }: { providerLabel: string }) {
  const { cart, clear } = useDemoCart();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const inFlight = useRef(false);
  const subtotal = cartSubtotal(cart);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = new FormData(event.currentTarget);
    const input = {
      name: form.get("name"),
      mobile: form.get("mobile"),
      address: form.get("address"),
    };
    const { customer, errors: found } = validateDemoCustomer(input);
    setErrors(found);
    if (customer === null || cart.lines.length === 0) return;

    inFlight.current = true;
    setSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch("/api/demo/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: checkoutReference(),
          customer,
          paymentMethod: DEMO_PAYMENT_METHOD,
          lines: cart.lines.map((line) => ({
            variantId: line.variantId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
          })),
        }),
      });
      const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      if (response.status === 201) {
        setConfirmation(body as Confirmation);
        window.sessionStorage.removeItem(REFERENCE_KEY);
        clear();
        return;
      }
      if (response.status === 400) {
        setErrors((body.fields as FieldErrors) ?? {});
        setMessage("Please check the highlighted details.");
      } else if (response.status === 409) {
        setMessage(
          `An item's price or stock changed in ${providerLabel}. Please return to the products page and review your cart.`,
        );
      } else if (body.error === "order_not_confirmed") {
        setMessage(
          `The order could not be confirmed with ${providerLabel}. Do not retry; check ${providerLabel} for reference ${String(body.reference)}.`,
        );
      } else {
        setMessage(`${providerLabel} is currently unavailable. Please try again shortly.`);
      }
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  if (confirmation !== null) {
    return (
      <section className="space-y-3 rounded-md border border-border bg-surface p-6" aria-live="polite">
        <h1 className={headingClass}>Demo Order placed successfully</h1>
        <p className="text-body text-foreground">Mini Mystiq demo reference: {confirmation.reference}</p>
        <p className="text-body text-foreground">
          {providerLabel} Order: {confirmation.orderNumber}
        </p>
        <p className="text-body text-foreground">Customer: {confirmation.customerName}</p>
        <p className="text-small text-foreground-secondary">
          Payment: {DEMO_PAYMENT_LABEL}. No payment was collected.
        </p>
        <Link href="/demo" className={secondaryButton}>
          Back to products
        </Link>
      </section>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <section className="space-y-4">
        <h1 className={headingClass}>Checkout</h1>
        <p className="text-body text-foreground-secondary">Your cart is empty.</p>
        <Link href="/demo" className={secondaryButton}>
          Back to products
        </Link>
      </section>
    );
  }

  return (
    <section className="grid gap-8 md:grid-cols-[1fr_20rem]">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <h1 className={headingClass}>Checkout</h1>
        <div>
          <label htmlFor="name" className="text-small font-semibold text-foreground">
            Customer name
          </label>
          <input id="name" name="name" autoComplete="name" className={inputClass} aria-invalid={Boolean(errors.name)} />
          {errors.name ? <p className="mt-1 text-small text-error">{errors.name}</p> : null}
        </div>
        <div>
          <label htmlFor="mobile" className="text-small font-semibold text-foreground">
            Mobile number
          </label>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className={inputClass}
            aria-invalid={Boolean(errors.mobile)}
          />
          {errors.mobile ? <p className="mt-1 text-small text-error">{errors.mobile}</p> : null}
        </div>
        <div>
          <label htmlFor="address" className="text-small font-semibold text-foreground">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            autoComplete="street-address"
            className={inputClass}
            aria-invalid={Boolean(errors.address)}
          />
          {errors.address ? <p className="mt-1 text-small text-error">{errors.address}</p> : null}
        </div>
        <fieldset>
          <legend className="text-small font-semibold text-foreground">Payment method</legend>
          <label className="mt-2 flex items-center gap-2 text-body text-foreground">
            <input type="radio" name="paymentMethod" value={DEMO_PAYMENT_METHOD} defaultChecked />
            {DEMO_PAYMENT_LABEL}
          </label>
          <p className="mt-1 text-small text-foreground-secondary">No card or payment details are collected.</p>
        </fieldset>
        <button type="submit" className={primaryButton} disabled={submitting}>
          {submitting ? "Placing demo order…" : "Place Demo Order"}
        </button>
        <p aria-live="polite" className="min-h-[1.25rem] text-small text-error">
          {message ?? ""}
        </p>
      </form>

      <aside className="h-fit space-y-3 rounded-md border border-border bg-surface p-4">
        <h2 className="font-semibold text-foreground">Order summary</h2>
        <ul className="space-y-2">
          {cart.lines.map((line) => (
            <li key={line.variantId} className="text-small text-foreground">
              {line.productName} · {line.variantLabel} × {line.quantity} —{" "}
              {formatDemoMoney({ ...line.unitPrice, amount: line.unitPrice.amount * line.quantity })}
            </li>
          ))}
        </ul>
        <p className="font-semibold text-foreground">
          Subtotal: {subtotal === null ? "Unavailable" : formatDemoMoney(subtotal)}
        </p>
        <p className="text-small text-foreground-secondary">{TAX_TREATMENT_NOTICE}</p>
      </aside>
    </section>
  );
}
