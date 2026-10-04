import type { Metadata } from "next";
import { CartView } from "@/components/storefront/cart-view";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Cart | Mini Mystiq",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <Container className="min-w-0 py-6 sm:py-8 lg:py-10">
      <CartView />
    </Container>
  );
}
