import type { Metadata } from "next";
import { toCatalogNavItems } from "@/application/catalog";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { catalog } from "@/config/catalog";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Mystiq",
  description: "Baby Clothes & Toys",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const categories = await catalog.listCategories();
  const navigation = toCatalogNavItems(categories);

  return (
    <html lang="en">
      <body>
        <StorefrontShell navigation={navigation}>{children}</StorefrontShell>
      </body>
    </html>
  );
}
