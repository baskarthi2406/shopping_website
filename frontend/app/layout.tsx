import type { Metadata } from "next";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Mystiq",
  description: "Baby Clothes & Toys",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <StorefrontShell>{children}</StorefrontShell>
      </body>
    </html>
  );
}
