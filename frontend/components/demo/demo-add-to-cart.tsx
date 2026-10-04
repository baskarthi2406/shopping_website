"use client";

import { useState } from "react";
import type { DemoVariantViewModel } from "@/application/checkout/demo-catalog-view-model";
import { useDemoCart } from "@/components/demo/demo-cart-store";
import { primaryButton } from "@/components/demo/demo-ui";

export function DemoAddToCart({ variant }: { variant: DemoVariantViewModel }) {
  const { add } = useDemoCart();
  const [added, setAdded] = useState(false);
  const unitPrice = variant.unitPrice;
  const disabled = !variant.purchasable || unitPrice === null;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className={primaryButton}
        disabled={disabled}
        onClick={() => {
          if (unitPrice === null) return;
          add({
            productId: variant.productId,
            variantId: variant.variantId,
            productName: variant.productName,
            variantLabel: variant.label,
            sku: variant.sku,
            unitPrice,
            maxQuantity: variant.availableToSell,
          });
          setAdded(true);
        }}
      >
        Add to cart
      </button>
      <span aria-live="polite" className="text-small text-success">
        {added ? "Added" : ""}
      </span>
    </div>
  );
}
