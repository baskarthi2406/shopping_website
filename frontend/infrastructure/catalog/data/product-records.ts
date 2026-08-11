/**
 * Phase 1 static development data. Not a finalized catalog.
 * Names and alts follow DESIGN_ASSETS.md. No invented prices, SKUs, stock, or sizes.
 * Hero banners, Pigeon, hiring, and character-print are excluded.
 * Zip shirts are included (S2-T06); age taxonomy for several dresses remains TBD.
 */
export type ProductRecord = {
  id: string;
  slug: string;
  name: string;
  description: string;
  images: readonly { src: string; alt: string }[];
  categoryIds: readonly string[];
};

export const productRecords: readonly ProductRecord[] = [
  {
    id: "navy-star-tan-bow-dress",
    slug: "navy-star-tan-bow-dress",
    name: "Navy star-print and tan bow-print dresses",
    description: "Navy star-print dress and tan bow-print dress on hangers",
    images: [
      {
        src: "/navy-star-and-tan-bow-dresses.jpg",
        alt: "Navy star-print dress and tan bow-print dress on hangers",
      },
    ],
    categoryIds: [],
  },
  {
    id: "olive-green-patterned-dress",
    slug: "olive-green-patterned-dress",
    name: "Olive green patterned dress",
    description: "Olive green patterned dress on a wooden hanger",
    images: [
      {
        src: "/olive-green-patterned-dress.jpg",
        alt: "Olive green patterned dress on a wooden hanger",
      },
    ],
    categoryIds: [],
  },
  {
    id: "beige-motif-pleated-dress",
    slug: "beige-motif-pleated-dress",
    name: "Beige motif pleated dress",
    description: "Beige motif pleated dress on a wooden hanger",
    images: [
      {
        src: "/beige-motif-pleated-dress.jpg",
        alt: "Beige motif pleated dress on a wooden hanger",
      },
    ],
    categoryIds: [],
  },
  {
    id: "pink-white-pleated-baby-dress",
    slug: "pink-white-pleated-baby-dress",
    name: "Pink and white pleated baby dress",
    description: "Pink and white pleated baby dress",
    images: [
      {
        src: "/pink-white-pleated-baby-dress.jpg",
        alt: "Pink and white pleated baby dress",
      },
    ],
    categoryIds: ["baby-essentials"],
  },
  {
    id: "sage-striped-baby-top-and-shorts",
    slug: "sage-striped-baby-top-and-shorts",
    name: "Sage striped baby top and shorts",
    description: "Sage striped baby top and matching shorts",
    images: [
      {
        src: "/sage-striped-baby-top-and-shorts.jpg",
        alt: "Sage striped baby top and matching shorts",
      },
    ],
    categoryIds: ["baby-essentials"],
  },
  {
    id: "cream-grey-rose-tiered-baby-dress",
    slug: "cream-grey-rose-tiered-baby-dress",
    name: "Cream, grey, and dusty rose tiered baby dress",
    description: "Cream, grey, and dusty rose tiered baby dress with bunny appliqué",
    images: [
      {
        src: "/cream-grey-rose-tiered-baby-dress.jpg",
        alt: "Cream, grey, and dusty rose tiered baby dress with bunny appliqué",
      },
    ],
    categoryIds: ["baby-essentials"],
  },
  {
    id: "grey-pinafore-baby-set",
    slug: "grey-pinafore-baby-set",
    name: "Grey pinafore baby set",
    description: "Grey pinafore baby dress over a white ribbed top",
    images: [
      {
        src: "/grey-pinafore-baby-set.jpg",
        alt: "Grey pinafore baby dress over a white ribbed top",
      },
    ],
    categoryIds: ["baby-essentials"],
  },
  {
    id: "dusty-blue-floral-dress",
    slug: "dusty-blue-floral-dress",
    name: "Dusty blue floral dress",
    description: "Dusty blue floral dress on a wooden hanger",
    images: [
      {
        src: "/dusty-blue-floral-dress.jpg",
        alt: "Dusty blue floral dress on a wooden hanger",
      },
    ],
    categoryIds: [],
  },
  {
    id: "cream-tiered-shirt-dress",
    slug: "cream-tiered-shirt-dress",
    name: "Cream tiered shirt-dress",
    description: "Cream tiered shirt-dress on a wooden hanger",
    images: [
      {
        src: "/cream-tiered-shirt-dress.jpg",
        alt: "Cream tiered shirt-dress on a wooden hanger",
      },
    ],
    categoryIds: [],
  },
  {
    id: "kids-striped-shirts-burgundy-and-sage",
    slug: "kids-striped-shirts-burgundy-and-sage",
    name: "Burgundy and sage striped kids shirts",
    description: "Burgundy and sage striped kids shirts",
    images: [
      {
        src: "/kids-striped-shirts-burgundy-and-sage.jpg",
        alt: "Burgundy and sage striped kids shirts",
      },
    ],
    categoryIds: ["kids"],
  },
  {
    id: "kids-button-down-shirts-rose-and-burgundy",
    slug: "kids-button-down-shirts-rose-and-burgundy",
    name: "Dusty rose and burgundy kids button-down shirts",
    description: "Dusty rose and burgundy kids button-down shirts",
    images: [
      {
        src: "/kids-button-down-shirts-rose-and-burgundy.jpg",
        alt: "Dusty rose and burgundy kids button-down shirts",
      },
    ],
    categoryIds: ["kids"],
  },
  {
    id: "kids-linen-shirts-brown-and-sage",
    slug: "kids-linen-shirts-brown-and-sage",
    name: "Brown and sage textured kids shirts",
    description: "Brown and sage textured kids shirts",
    images: [
      {
        src: "/kids-linen-shirts-brown-and-sage.jpg",
        alt: "Brown and sage textured kids shirts",
      },
    ],
    categoryIds: ["kids"],
  },
];
