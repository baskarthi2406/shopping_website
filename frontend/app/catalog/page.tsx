import type { Metadata } from "next";
import { notFound, unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { toCatalogDemoViewModel } from "@/application/catalog";
import { CatalogDemoGroups } from "@/components/storefront/catalog-demo-groups";
import { CatalogUnavailable } from "@/components/storefront/catalog-unavailable";
import { Container } from "@/components/ui/container";
import { catalog } from "@/config/catalog";
import { priceDisplay } from "@/config/commerce";
import { getCatalogSourceCategories, isCatalogDemoEnabled } from "@/config/catalog-demo";

export const metadata: Metadata = {
  title: "Full catalog (demo)",
  robots: { index: false, follow: false },
};

export default async function CatalogDemoPage() {
  await connection();
  if (!isCatalogDemoEnabled()) {
    notFound();
  }

  let view;
  try {
    const [{ products }, sourceCategories] = await Promise.all([
      catalog.getHomePage(),
      getCatalogSourceCategories(),
    ]);
    view = toCatalogDemoViewModel(products, sourceCategories, priceDisplay);
  } catch (error) {
    unstable_rethrow(error);
    return <CatalogUnavailable headingAs="h1" />;
  }

  return (
    <Container className="py-6 sm:py-8 lg:py-10">
      <header>
        <h1 className="font-display text-h1 font-semibold tracking-tight text-foreground">
          Full catalog (demo)
        </h1>
        <p className="mt-2 max-w-prose text-body text-foreground-secondary">
          Every product in the current inventory catalog, grouped by the
          inventory system&apos;s own category labels. These labels are not the
          Mini Mystiq storefront categories; products marked as not yet placed
          do not appear in any storefront category.
        </p>
        <p className="mt-3 text-small text-foreground-muted">
          {view.productCount} products: {view.placedCount} placed,{" "}
          {view.unplacedCount} not yet placed
        </p>
      </header>
      <CatalogDemoGroups groups={view.groups} />
    </Container>
  );
}
