/**
 * Image reference as data (SEO filename path). Not a Next.js/React concern.
 * `src` uses the public path form, e.g. `/olive-green-patterned-dress.jpg`.
 * `alt` describes the image; it must not be the filename.
 */
export type CatalogImage = {
  readonly src: string;
  readonly alt: string;
};
