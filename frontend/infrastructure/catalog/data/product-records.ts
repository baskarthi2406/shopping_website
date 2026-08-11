/**
 * Phase 1 static development data. Not a finalized catalog.
 * Names and alts follow DESIGN_ASSETS.md. No invented prices, SKUs, stock, or sizes.
 * Zip-extracted shirts, hero banners, Pigeon, hiring, and character-print are excluded.
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
];
