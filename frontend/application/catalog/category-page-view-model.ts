import type { Category, Pricing, Product, ProductVariant } from "@/domain/catalog";
import type { BreadcrumbItemViewModel } from "./breadcrumb-view-model";
import {
  NOT_CURRENTLY_AVAILABLE_MESSAGE,
  OUT_OF_STOCK_MESSAGE,
  PRICE_NOT_AVAILABLE_MESSAGE,
} from "./catalog-messages";
import type { PriceDisplayConfig } from "./product-commerce-view-model";

export type ProductCardViewModel = {
  readonly href: string;
  readonly name: string;
  readonly description: string;
  readonly image: { readonly src: string; readonly alt: string } | null;
  /**
   * Present only when a price display config is approved. A single price is
   * shown only when every variant has that same verified price.
   */
  readonly price?: string | null;
  readonly priceMessage?: string | null;
  /** Set only for a confirmed whole-product state, never "in stock". */
  readonly availabilityMessage?: string | null;
};

export type SubcategoryLinkViewModel = {
  readonly name: string;
  readonly href: string;
};

export type CategoryPageViewModel = {
  readonly slug: string;
  readonly name: string;
  readonly description: string | null;
  readonly canonicalPath: string;
  readonly productCount: number;
  readonly products: readonly ProductCardViewModel[];
  /** Visible direct subcategories, in category order. */
  readonly subcategories: readonly SubcategoryLinkViewModel[];
  readonly breadcrumb: readonly BreadcrumbItemViewModel[];
};

export function toProductCardViewModel(
  product: Product,
  priceDisplay: PriceDisplayConfig | null = null,
): ProductCardViewModel {
  const image = product.images[0];
  const card: ProductCardViewModel = {
    href: `/p/${product.slug}`,
    name: product.name,
    description: product.description,
    image: image ? { src: image.src, alt: image.alt } : null,
  };
  if (priceDisplay === null) {
    return card;
  }
  const listing = listingCommerce(product, priceDisplay);
  return { ...card, ...listing };
}

function listingCommerce(
  product: Product,
  priceDisplay: PriceDisplayConfig,
): Pick<ProductCardViewModel, "price" | "priceMessage" | "availabilityMessage"> {
  const variants = product.variants;
  const prices = (variants.length > 0 ? variants.map((variant) => variant.pricing) : [product.pricing]).map(
    (pricing) => priceKey(pricing, priceDisplay),
  );
  const first = prices[0];
  const uniform = first !== null && prices.every((price) => price === first);
  const price = uniform && first !== null ? formatListingPrice(first, priceDisplay) : null;

  return {
    price,
    priceMessage: price === null ? PRICE_NOT_AVAILABLE_MESSAGE : null,
    availabilityMessage: listingAvailability(variants.length > 0 ? variants : null, product),
  };
}

function priceKey(pricing: Pricing | null, config: PriceDisplayConfig): string | null {
  const money = pricing?.price;
  if (
    money === undefined ||
    !config.currencies.includes(money.currency) ||
    !Number.isFinite(money.amount) ||
    money.amount <= 0
  ) {
    return null;
  }
  return `${money.currency}:${money.amount}`;
}

function formatListingPrice(key: string, config: PriceDisplayConfig): string | null {
  const [currency, amount] = key.split(":");
  if (currency === undefined || amount === undefined) {
    return null;
  }
  try {
    return new Intl.NumberFormat(config.locale, { style: "currency", currency }).format(Number(amount));
  } catch {
    return null;
  }
}

function listingAvailability(
  variants: readonly ProductVariant[] | null,
  product: Product,
): string | null {
  if (variants !== null) {
    if (variants.every((variant) => variant.status === "inactive")) {
      return NOT_CURRENTLY_AVAILABLE_MESSAGE;
    }
    if (variants.every((variant) => variant.inventory?.status === "out_of_stock")) {
      return OUT_OF_STOCK_MESSAGE;
    }
    return null;
  }
  if (product.status === "inactive") {
    return NOT_CURRENTLY_AVAILABLE_MESSAGE;
  }
  return product.inventory?.status === "out_of_stock" ? OUT_OF_STOCK_MESSAGE : null;
}

/**
 * Category page view. Products are the category's own placements (no
 * aggregation from subcategories); subcategories link one level down.
 * `ancestors` (root first) prefix the breadcrumb.
 */
export function toCategoryPageViewModel(
  category: Category,
  products: readonly Product[],
  ancestors: readonly Category[] = [],
  priceDisplay: PriceDisplayConfig | null = null,
): CategoryPageViewModel {
  return {
    slug: category.slug,
    name: category.name,
    description: category.description,
    canonicalPath: `/c/${category.slug}`,
    productCount: products.length,
    products: products.map((product) => toProductCardViewModel(product, priceDisplay)),
    subcategories: category.children
      .filter((child) => child.visibility === "visible")
      .map((child) => ({ name: child.name, href: `/c/${child.slug}` })),
    breadcrumb: [
      { label: "Home", href: "/" },
      ...ancestors.map((ancestor) => ({
        label: ancestor.name,
        href: `/c/${ancestor.slug}`,
      })),
      { label: category.name, href: null },
    ],
  };
}
