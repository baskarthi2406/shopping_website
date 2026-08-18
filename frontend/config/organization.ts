/**
 * Public Organization facts for JSON-LD (S3-T08).
 *
 * `name` is the project storefront brand (Mini Mystiq). Legal entity and
 * trading name remain TBD — do not emit legalName. A supplied business
 * listing used “Enn2Gee Mini Mystiq”; that is not treated as a confirmed
 * legal name (`PROJECT_OVERVIEW.md`).
 *
 * telephone and address come from that same source-provided listing.
 * openingHours are omitted: they are LocalBusiness-specific and not part
 * of this Organization schema.
 */
export const ORGANIZATION_LOGO_PATH = "/mini-mystiq-logo.png";

export type OrganizationAddress = {
  readonly streetAddress: string;
  readonly addressLocality: string;
  readonly addressRegion: string;
  readonly postalCode: string;
  readonly addressCountry: string;
};

export type OrganizationProfile = {
  readonly name: string;
  readonly logoPath: string;
  readonly telephone: string;
  readonly address: OrganizationAddress;
};

export const organization: OrganizationProfile = {
  name: "Mini Mystiq",
  logoPath: ORGANIZATION_LOGO_PATH,
  telephone: "090257 99377",
  address: {
    streetAddress: "Ponnaiah Konar Complex, Avanam Road, Mudapulikkadu",
    addressLocality: "Peravurani",
    addressRegion: "Tamil Nadu",
    postalCode: "614804",
    addressCountry: "IN",
  },
};
