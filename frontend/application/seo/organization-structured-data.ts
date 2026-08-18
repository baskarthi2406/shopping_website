export type OrganizationAddressSource = {
  readonly streetAddress: string;
  readonly addressLocality: string;
  readonly addressRegion: string;
  readonly postalCode: string;
  readonly addressCountry: string;
};

export type OrganizationJsonLdSource = {
  readonly name: string;
  readonly logoPath: string;
  readonly telephone?: string;
  readonly address?: OrganizationAddressSource;
};

export type OrganizationPostalAddressStructuredData = {
  readonly "@type": "PostalAddress";
  readonly streetAddress: string;
  readonly addressLocality: string;
  readonly addressRegion: string;
  readonly postalCode: string;
  readonly addressCountry: string;
};

export type OrganizationStructuredData = {
  readonly "@context": "https://schema.org";
  readonly "@type": "Organization";
  readonly name: string;
  readonly url: string;
  readonly logo: string;
  readonly telephone?: string;
  readonly address?: OrganizationPostalAddressStructuredData;
};

/**
 * Schema.org Organization JSON-LD from confirmed public listing fields.
 * Omits legalName, sameAs, email, identifiers, reviews, and openingHours.
 */
export function buildOrganizationStructuredData(
  source: OrganizationJsonLdSource | null,
  toAbsoluteUrl: (path: string) => string,
): OrganizationStructuredData | null {
  if (source === null) {
    return null;
  }

  const telephone = source.telephone?.trim();
  const address = source.address;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: source.name,
    url: toAbsoluteUrl("/"),
    logo: toAbsoluteUrl(source.logoPath),
    ...(telephone ? { telephone } : {}),
    ...(address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: address.streetAddress,
            addressLocality: address.addressLocality,
            addressRegion: address.addressRegion,
            postalCode: address.postalCode,
            addressCountry: address.addressCountry,
          },
        }
      : {}),
  };
}
