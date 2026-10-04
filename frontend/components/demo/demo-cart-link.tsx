"use client";

import Link from "next/link";
import { cartItemCount } from "@/domain/cart/cart";
import { useDemoCart } from "@/components/demo/demo-cart-store";
import { secondaryButton } from "@/components/demo/demo-ui";

export function DemoCartLink() {
  const { cart } = useDemoCart();
  return (
    <Link href="/demo/cart" className={secondaryButton}>
      Cart ({cartItemCount(cart)})
    </Link>
  );
}
