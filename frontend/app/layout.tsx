import type { Metadata } from "next";
import { JsonLd } from "@/app/json-ld";
import { cormorant, sourceSans } from "@/app/fonts";
import { toCatalogNavItems, toFooterNavViewModel } from "@/application/catalog";
import { buildOrganizationStructuredData } from "@/application/seo/organization-structured-data";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { catalogSource } from "@/config/catalog-source";
import { organization } from "@/config/organization";
import { getMetadataBase, resolveSiteOrigin, toCanonicalUrl } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "Mini Mystiq",
  description: "Baby Clothes & Toys",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const categories = await catalogSource.listCategories();
  const navigation = toCatalogNavItems(categories);
  const footerNav = toFooterNavViewModel(categories);
  const origin = resolveSiteOrigin();
  const organizationStructuredData = buildOrganizationStructuredData(
    organization,
    (path) => toCanonicalUrl(origin, path),
  );

  return (
    <html lang="en" className={`${sourceSans.variable} ${cormorant.variable}`}>
      <body>
        {organizationStructuredData ? (
          <JsonLd data={organizationStructuredData} />
        ) : null}
        <StorefrontShell
          navigation={navigation}
          footerNav={footerNav}
          contact={organization}
        >
          {children}
        </StorefrontShell>
      </body>
    </html>
  );
}
