"use client";

import Link from "next/link";
import { useStorefrontCart } from "@/application/storefront-cart/use-storefront-cart";
import { storefrontItemCount } from "@/domain/storefront-cart/storefront-cart";

export function CartLink({ className = "" }: { className?: string }) {
  const { cart } = useStorefrontCart();
  const count = storefrontItemCount(cart);
  const label = count > 0 ? `Cart (${count})` : "Cart";

  return (
    <Link
      href="/cart"
      className={`inline-flex min-h-[var(--mm-tap-min)] w-full items-center rounded-md px-2 text-small font-semibold text-foreground hover:bg-surface-muted md:w-auto ${className}`.trim()}
    >
      {label}
    </Link>
  );
}
