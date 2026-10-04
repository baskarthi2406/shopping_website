import type { Metadata } from "next";
import { CheckoutView } from "@/components/storefront/checkout-view";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Checkout | Mini Mystiq",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <Container className="min-w-0 py-6 sm:py-8 lg:py-10">
      <CheckoutView />
    </Container>
  );
}
