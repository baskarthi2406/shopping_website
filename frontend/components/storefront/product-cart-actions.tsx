"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CartCandidate } from "@/application/storefront-cart/cart-candidate";
import { useStorefrontCart } from "@/application/storefront-cart/use-storefront-cart";
import type { StorefrontCartDraft } from "@/domain/storefront-cart/storefront-cart";

const primaryButton =
  "inline-flex min-h-[var(--mm-tap-min)] w-full items-center justify-center rounded-md bg-primary px-4 text-small font-semibold text-primary-foreground transition-colors duration-[var(--mm-duration)] hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto";

const secondaryButton =
  "inline-flex min-h-[var(--mm-tap-min)] w-full items-center justify-center rounded-md border border-border bg-background px-4 text-small font-semibold text-foreground transition-colors duration-[var(--mm-duration)] hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto";

function draftFrom(choice: CartCandidate): StorefrontCartDraft | null {
  if (choice.unitPrice === null || choice.priceLocale === null || !choice.canAdd) {
    return null;
  }
  return {
    productId: choice.productId,
    productSlug: choice.productSlug,
    productName: choice.productName,
    variantId: choice.variantId,
    sku: choice.sku,
    attributes: choice.attributes,
    variantLabel: choice.variantLabel,
    unitPrice: choice.unitPrice,
    priceLocale: choice.priceLocale,
    availableToSell: choice.availableToSell,
    imageSrc: choice.imageSrc,
    imageAlt: choice.imageAlt,
  };
}

function AddButtons({ draft }: { draft: StorefrontCartDraft }) {
  const router = useRouter();
  const { add } = useStorefrontCart();
  const [message, setMessage] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  function addItem(): boolean {
    const result = add(draft);
    setAdded(result.error === null);
    setMessage(result.error ?? "Added to cart.");
    return result.error === null;
  }

  return (
    <div className="mt-4 min-w-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button type="button" className={primaryButton} onClick={() => addItem()}>
          Add to cart
        </button>
        <button
          type="button"
          className={secondaryButton}
          onClick={() => {
            if (addItem()) {
              router.push("/checkout");
            }
          }}
        >
          Buy now
        </button>
      </div>
      {message !== null ? (
        <p aria-live="polite" className="mt-3 text-small text-foreground">
          {message}{" "}
          {added ? (
            <Link href="/cart" className="font-semibold text-primary hover:text-primary-hover">
              View cart
            </Link>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

export function ProductCartActions({ choice }: { choice: CartCandidate | null }) {
  if (choice === null) {
    return (
      <p className="mt-4 text-small text-foreground-secondary">
        Select a variant before adding it to the cart.
      </p>
    );
  }

  const draft = draftFrom(choice);
  if (draft === null) {
    return choice.blockMessage ? (
      <p className="mt-4 text-small font-semibold text-foreground">{choice.blockMessage}</p>
    ) : null;
  }

  return <AddButtons key={draft.variantId} draft={draft} />;
}
