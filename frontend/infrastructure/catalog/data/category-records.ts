/**
 * Phase 1 static development data. Not a finalized catalog.
 * Names match Design Option 1 nav. Taxonomy completeness is TBD.
 * Images are temporary product-photo stand-ins (DESIGN_ASSETS.md).
 */
export type CategoryRecord = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: { src: string; alt: string } | null;
};

export const categoryRecords: readonly CategoryRecord[] = [
  {
    id: "baby-essentials",
    slug: "baby-essentials",
    name: "Baby Essentials",
    description: null,
    image: {
      src: "/sage-striped-baby-top-and-shorts.jpg",
      alt: "Sage striped baby top and matching shorts",
    },
  },
  {
    id: "infants",
    slug: "infants",
    name: "Infants",
    description: null,
    image: {
      src: "/cream-grey-rose-tiered-baby-dress.jpg",
      alt: "Cream, grey, and dusty rose tiered baby dress with bunny appliqué",
    },
  },
  {
    id: "kids",
    slug: "kids",
    name: "Kids",
    description: null,
    image: {
      src: "/kids-striped-shirts-burgundy-and-sage.jpg",
      alt: "Burgundy and sage striped kids shirts",
    },
  },
  {
    id: "teens",
    slug: "teens",
    name: "Teens",
    description: null,
    image: {
      src: "/dusty-blue-floral-dress.jpg",
      alt: "Dusty blue floral dress on a wooden hanger",
    },
  },
  {
    id: "women",
    slug: "women",
    name: "Women",
    description: null,
    image: {
      src: "/olive-green-patterned-dress.jpg",
      alt: "Olive green patterned dress on a wooden hanger",
    },
  },
];
