import type { Metadata } from "next";
import { JsonLd } from "@/app/json-ld";
import { toCatalogNavItems } from "@/application/catalog";
import { buildOrganizationStructuredData } from "@/application/seo/organization-structured-data";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { catalog } from "@/config/catalog";
import { organization } from "@/config/organization";
import { getMetadataBase, resolveSiteOrigin, toCanonicalUrl } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "Mini Mystiq",
  description: "Baby Clothes & Toys",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const categories = await catalog.listCategories();
  const navigation = toCatalogNavItems(categories);
  const origin = resolveSiteOrigin();
  const organizationStructuredData = buildOrganizationStructuredData(
    organization,
    (path) => toCanonicalUrl(origin, path),
  );

  return (
    <html lang="en">
      <body>
        {organizationStructuredData ? (
          <JsonLd data={organizationStructuredData} />
        ) : null}
        <StorefrontShell navigation={navigation}>{children}</StorefrontShell>
      </body>
    </html>
  );
}
