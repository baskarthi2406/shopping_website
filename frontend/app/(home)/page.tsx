import type { Metadata } from "next";
import { unstable_rethrow } from "next/navigation";
import { toNextMetadata } from "@/app/to-next-metadata";
import { toHomePageViewModel } from "@/application/catalog";
import { buildHomeMetadata } from "@/application/seo/home-metadata";
import { CatalogDemoLink } from "@/components/storefront/catalog-demo-link";
import { CatalogUnavailable } from "@/components/storefront/catalog-unavailable";
import { HomeCategories } from "@/components/storefront/home-categories";
import { HomeHero } from "@/components/storefront/home-hero";
import { HomeIntro } from "@/components/storefront/home-intro";
import { HomeProducts } from "@/components/storefront/home-products";
import { HomePromo } from "@/components/storefront/home-promo";
import { TrustBar } from "@/components/storefront/trust-bar";
import { catalog } from "@/config/catalog";
import { isCatalogDemoEnabled } from "@/config/catalog-demo";

export async function generateMetadata(): Promise<Metadata> {
  return toNextMetadata(buildHomeMetadata());
}

const EMPTY_HOME_DATA = {
  categories: [],
  products: [],
} as const;

export default async function Home() {
  let catalogFailed = false;
  let view = toHomePageViewModel(EMPTY_HOME_DATA);

  try {
    view = toHomePageViewModel(await catalog.getHomePage());
  } catch (error) {
    unstable_rethrow(error);
    catalogFailed = true;
  }

  return (
    <>
      <HomeHero {...view.hero} />
      {catalogFailed ? (
        <CatalogUnavailable headingAs="h2" />
      ) : (
        <>
          <HomeCategories categories={view.categories} />
          <HomeProducts products={view.products} />
          {isCatalogDemoEnabled() ? <CatalogDemoLink /> : null}
        </>
      )}
      <HomePromo href={view.promo.href} image={view.promo.image} />
      <HomeIntro title={view.intro.title} body={view.intro.body} />
      <TrustBar items={view.trustItems} />
    </>
  );
}
