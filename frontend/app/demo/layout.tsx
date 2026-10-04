import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoCartLink } from "@/components/demo/demo-cart-link";
import { Container } from "@/components/ui/container";
import { demoStore } from "@/config/demo-store";

export const metadata: Metadata = {
  title: "Demo | Mini Mystiq",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function DemoLayout({ children }: { children: ReactNode }) {
  if (!demoStore.isEnabled()) {
    notFound();
  }
  return (
    <Container className="py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-warning bg-surface-warm px-4 py-3">
        <p className="text-small text-foreground">
          <strong>Training demo.</strong> Products, prices and stock come live from{" "}
          {demoStore.providerLabel}. Orders are demo sales orders (Demo / COD) — not fulfilled.
        </p>
        <div className="flex gap-2">
          <Link href="/demo" className="text-small font-semibold text-foreground underline">
            Products
          </Link>
          <DemoCartLink />
        </div>
      </div>
      {children}
    </Container>
  );
}
