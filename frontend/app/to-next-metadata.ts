import type { Metadata } from "next";
import type {
  IndexablePageMetadata,
  NotFoundPageMetadata,
} from "@/application/seo/page-metadata";

/**
 * Maps application SEO fields to the Next.js Metadata API.
 * Canonicals and OpenGraph URLs stay as paths; layout metadataBase
 * (config/site.ts) supplies the site origin.
 */
export function toNextMetadata(meta: IndexablePageMetadata): Metadata {
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: meta.canonicalPath,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: meta.canonicalPath,
      type: "website",
      ...(meta.image
        ? {
            images: [
              {
                url: meta.image.src,
                alt: meta.image.alt,
              },
            ],
          }
        : {}),
    },
  };
}

export function toNextNotFoundMetadata(meta: NotFoundPageMetadata): Metadata {
  return {
    title: meta.title,
    description: meta.description,
    robots: meta.robots,
  };
}
