import type { CategoryVisibility } from "@/domain/catalog/category";

/**
 * Static customer-reference category data for S4-T02.
 *
 * Records stay flat so a future API can provide parent ids directly. The
 * infrastructure mapper derives recursive `children`. Categories may exist
 * without products or dedicated imagery.
 */
export type CategoryRecord = {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
  visibility: CategoryVisibility;
  showInMenu: boolean;
  description: string | null;
  image: { src: string; alt: string } | null;
};

function menuCategory(
  id: string,
  name: string,
  parentId: string | null,
  image: CategoryRecord["image"] = null,
): CategoryRecord {
  return {
    id,
    slug: id,
    name,
    parentId,
    visibility: "visible",
    showInMenu: true,
    description: null,
    image,
  };
}

export const categoryRecords: readonly CategoryRecord[] = [
  menuCategory("baby-essentials", "Baby Essentials", null, {
    src: "/sage-striped-baby-top-and-shorts.jpg",
    alt: "Sage striped baby top and matching shorts",
  }),
  menuCategory("infants", "Infants", null, {
    src: "/cream-grey-rose-tiered-baby-dress.jpg",
    alt: "Cream, grey, and dusty rose tiered baby dress with bunny appliqué",
  }),
  menuCategory("kids", "Kids", null, {
    src: "/kids-striped-shirts-burgundy-and-sage.jpg",
    alt: "Burgundy and sage striped kids shirts",
  }),
  menuCategory("teens", "Teens", null, {
    src: "/dusty-blue-floral-dress.jpg",
    alt: "Dusty blue floral dress on a wooden hanger",
  }),
  menuCategory("women", "Women", null, {
    src: "/olive-green-patterned-dress.jpg",
    alt: "Olive green patterned dress on a wooden hanger",
  }),
  menuCategory("kids-wear", "Kid's Wear", null),
  menuCategory("boys-wear", "Boy's Wear", null),
  menuCategory("girls-wear", "Girl's Wear", null),
  menuCategory("boutique", "Boutique", null),

  menuCategory("baby-essentials-feeding", "Feeding", "baby-essentials"),
  menuCategory("baby-essentials-shampoo", "Shampoo", "baby-essentials"),
  menuCategory("baby-essentials-soap", "Soap", "baby-essentials"),
  menuCategory("baby-essentials-body-lotion", "Body Lotion", "baby-essentials"),
  menuCategory("baby-essentials-body-wash", "Body Wash", "baby-essentials"),
  menuCategory("baby-essentials-cleansers", "Cleansers", "baby-essentials"),
  menuCategory("baby-essentials-wet-wipes", "Wet Wipes", "baby-essentials"),
  menuCategory("baby-essentials-mattress", "Mattress", "baby-essentials"),
  menuCategory("baby-essentials-baby-booties", "Baby Booties", "baby-essentials"),
  menuCategory("baby-essentials-grooming", "Grooming", "baby-essentials"),
  menuCategory(
    "baby-essentials-bottles-zippers",
    "Bottles & Zippers",
    "baby-essentials",
  ),
  menuCategory(
    "baby-essentials-bed-protector-mat",
    "Bed Protector Mat",
    "baby-essentials",
  ),

  menuCategory("infants-baby-girl", "Baby Girl", "infants"),
  menuCategory("infants-baby-boy", "Baby Boy", "infants"),
  menuCategory("infants-baby-girl-frock", "Frock", "infants-baby-girl"),
  menuCategory(
    "infants-baby-girl-pant-top",
    "Pant & Top",
    "infants-baby-girl",
  ),
  menuCategory(
    "infants-baby-girl-co-ord-set",
    "Co-Ord Set",
    "infants-baby-girl",
  ),
  menuCategory("infants-baby-girl-t-shirts", "T-Shirts", "infants-baby-girl"),
  menuCategory(
    "infants-baby-girl-skirt-top",
    "Skirt & Top",
    "infants-baby-girl",
  ),
  menuCategory(
    "infants-baby-girl-party-wear",
    "Party Wear",
    "infants-baby-girl",
  ),
  menuCategory("infants-baby-girl-jeans", "Jeans", "infants-baby-girl"),
  menuCategory(
    "infants-baby-girl-inner-wear",
    "Inner Wear",
    "infants-baby-girl",
  ),
  menuCategory(
    "infants-baby-girl-ethnic-wear",
    "Ethnic Wear",
    "infants-baby-girl",
  ),
  menuCategory("infants-baby-boy-t-shirt", "T-Shirt", "infants-baby-boy"),
  menuCategory(
    "infants-baby-boy-co-ord-set",
    "Co-Ord Set",
    "infants-baby-boy",
  ),
  menuCategory("infants-baby-boy-jeans", "Jeans", "infants-baby-boy"),
  menuCategory(
    "infants-baby-boy-ethnic-wear",
    "Ethnic Wear",
    "infants-baby-boy",
  ),
  menuCategory("infants-baby-boy-shirts", "Shirts", "infants-baby-boy"),
  menuCategory("infants-baby-boy-pants", "Pants", "infants-baby-boy"),
  menuCategory("infants-baby-boy-trousers", "Trousers", "infants-baby-boy"),
  menuCategory(
    "infants-baby-boy-inner-wear",
    "Inner Wear",
    "infants-baby-boy",
  ),

  // The customer list repeats “Nighties”; one category record avoids duplicate URLs.
  menuCategory("women-feeding", "Feeding", "women"),
  menuCategory("women-nighties", "Nighties", "women"),
  menuCategory("women-kurtis", "Kurtis", "women"),
  menuCategory("women-co-ord-set", "Co-Ord Set", "women"),
  menuCategory("women-churidhar", "Churidhar", "women"),
  menuCategory("women-tops", "Tops", "women"),
  menuCategory("women-short-tops", "Short tops", "women"),
  menuCategory("women-sarees", "Sarees", "women"),
  menuCategory("women-inner-wears", "Inner Wears", "women"),
  menuCategory("women-in-skirt", "In skirt", "women"),
  menuCategory("women-blouse-materials", "Blouse Materials", "women"),
  menuCategory(
    "women-churidhar-materials",
    "Churidhar Materials",
    "women",
  ),
  menuCategory("women-leggings", "Leggings", "women"),
  menuCategory("women-straight-cut-pants", "Straight Cut Pants", "women"),
];
