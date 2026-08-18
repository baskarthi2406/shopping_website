export type SeoImage = {
  readonly src: string;
  readonly alt: string;
};

export type IndexablePageMetadata = {
  readonly title: string;
  readonly description: string;
  readonly canonicalPath: string;
  readonly image: SeoImage | null;
};

export type NotFoundPageMetadata = {
  readonly title: string;
  readonly description: string;
  readonly robots: { readonly index: false; readonly follow: false };
};

/**
 * Shared 404 document metadata. No canonical, no invented catalog page.
 */
export function buildNotFoundMetadata(): NotFoundPageMetadata {
  return {
    title: "Page not found | Mini Mystiq",
    description: "That page does not exist.",
    robots: { index: false, follow: false },
  };
}
