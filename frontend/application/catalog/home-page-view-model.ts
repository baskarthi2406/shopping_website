import type { Category, Product } from "@/domain/catalog";
import type { ProductCardViewModel } from "./category-page-view-model";
import { toProductCardViewModel } from "./category-page-view-model";
import type { HomePageData } from "./get-home-page";

/** Approved homepage assets and Option 1 copy. See DESIGN_ASSETS.md and DESIGN_OPTION_1.md. */
const HOME_HERO_IMAGE = {
  src: "/baby-sleeveless-sets-new-collection-banner.jpg",
  alt: "Sage and dusty rose baby sleeveless top and shorts sets",
} as const;

const HOME_PROMO_IMAGE = {
  src: "/baby-dress-bloomer-sets-new-collection-banner.jpg",
  alt: "Lavender and dusty rose baby dresses with matching bloomers",
} as const;

export type HomeHeroViewModel = {
  readonly headline: string;
  readonly subhead: string;
  readonly ctaLabel: string | null;
  readonly ctaHref: string | null;
  readonly image: { readonly src: string; readonly alt: string };
};

export type HomePromoViewModel = {
  readonly href: string | null;
  readonly image: { readonly src: string; readonly alt: string };
};

export type HomeCategoryTileViewModel = {
  readonly name: string;
  readonly href: string;
  readonly image: { readonly src: string; readonly alt: string } | null;
};

export type HomeTrustItemViewModel = {
  readonly title: string;
  readonly detail: string;
};

export type HomePageViewModel = {
  readonly hero: HomeHeroViewModel;
  readonly categories: readonly HomeCategoryTileViewModel[];
  readonly products: readonly ProductCardViewModel[];
  readonly promo: HomePromoViewModel;
  readonly intro: { readonly title: string; readonly body: string };
  readonly trustItems: readonly HomeTrustItemViewModel[];
};

function firstCatalogHref(
  categories: readonly Category[],
  products: readonly Product[],
): string | null {
  const withProducts = categories.find((category) =>
    products.some((product) => product.categoryIds.includes(category.id)),
  );
  const target = withProducts ?? categories[0];
  return target ? `/c/${target.slug}` : null;
}

export function toHomePageViewModel(data: HomePageData): HomePageViewModel {
  const shopHref = firstCatalogHref(data.categories, data.products);

  return {
    hero: {
      headline: "Dress them cute, see them shine!",
      subhead: "Stylish, Comfortable & Perfect for Every Moment.",
      ctaLabel: shopHref ? "Shop Now" : null,
      ctaHref: shopHref,
      image: HOME_HERO_IMAGE,
    },
    categories: data.categories.map((category) => ({
      name: category.name,
      href: `/c/${category.slug}`,
      image: category.image
        ? { src: category.image.src, alt: category.image.alt }
        : null,
    })),
    products: data.products.map(toProductCardViewModel),
    promo: {
      href: shopHref,
      image: HOME_PROMO_IMAGE,
    },
    intro: {
      title: "Baby clothes at Mini Mystiq",
      body: "Mini Mystiq is a storefront for baby and children's clothing. Browse categories to see dresses, sets, and shirts in the current catalog.",
    },
    trustItems: [
      { title: "Free Shipping", detail: "On orders above ₹999" },
      { title: "Easy Returns", detail: "Hassle free returns" },
      { title: "Secure Payment", detail: "100% secure checkout" },
      { title: "24/7 Support", detail: "We are here to help" },
    ],
  };
}
