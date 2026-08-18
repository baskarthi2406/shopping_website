import type { IndexablePageMetadata, SeoImage } from "./page-metadata";

export type HomeMetadata = IndexablePageMetadata & {
  readonly image: SeoImage;
};

/**
 * Homepage document metadata. No invented offers, reviews, or local-business claims.
 * Site origin remains TBD.
 */
export function buildHomeMetadata(): HomeMetadata {
  return {
    title: "Mini Mystiq | Baby Clothes & Toys",
    description:
      "Mini Mystiq is a storefront for baby and children's clothing. Browse dresses, sets, and kids shirts.",
    canonicalPath: "/",
    image: {
      src: "/baby-sleeveless-sets-new-collection-banner.jpg",
      alt: "Sage and dusty rose baby sleeveless top and shorts sets",
    },
  };
}
