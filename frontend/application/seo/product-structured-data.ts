export type ProductJsonLdSource = {
  readonly name: string;
  readonly description: string;
  readonly canonicalPath: string;
  readonly images: readonly { readonly src: string }[];
};

export type ProductStructuredData = {
  readonly "@context": "https://schema.org";
  readonly "@type": "Product";
  readonly name: string;
  readonly url: string;
  readonly description?: string;
  readonly image?: string;
};

/**
 * Schema.org Product JSON-LD from catalog fields that actually exist.
 * Omits offers, price, SKU, brand, availability, reviews, and category.
 */
export function buildProductStructuredData(
  source: ProductJsonLdSource | null,
  toAbsoluteUrl: (path: string) => string,
): ProductStructuredData | null {
  if (source === null) {
    return null;
  }

  const description = source.description.trim();
  const primaryImage = source.images[0];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: source.name,
    url: toAbsoluteUrl(source.canonicalPath),
    ...(description.length > 0 ? { description } : {}),
    ...(primaryImage ? { image: toAbsoluteUrl(primaryImage.src) } : {}),
  };
}
