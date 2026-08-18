import type { Metadata } from "next";
import { toNextMetadata } from "@/app/to-next-metadata";
import { toHomePageViewModel } from "@/application/catalog";
import { buildHomeMetadata } from "@/application/seo/home-metadata";
import { HomeCategories } from "@/components/storefront/home-categories";
import { HomeHero } from "@/components/storefront/home-hero";
import { HomeIntro } from "@/components/storefront/home-intro";
import { HomeProducts } from "@/components/storefront/home-products";
import { HomePromo } from "@/components/storefront/home-promo";
import { TrustBar } from "@/components/storefront/trust-bar";
import { catalog } from "@/config/catalog";

export async function generateMetadata(): Promise<Metadata> {
  return toNextMetadata(buildHomeMetadata());
}

export default async function Home() {
  const data = await catalog.getHomePage();
  const view = toHomePageViewModel(data);

  return (
    <>
      <HomeHero {...view.hero} />
      <HomeCategories categories={view.categories} />
      <HomeProducts products={view.products} />
      <HomePromo href={view.promo.href} image={view.promo.image} />
      <HomeIntro title={view.intro.title} body={view.intro.body} />
      <TrustBar items={view.trustItems} />
    </>
  );
}
