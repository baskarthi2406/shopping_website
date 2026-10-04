"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Storefront catalog image. A failed or missing response leaves the parent's
 * empty frame in place and does not surface provider errors.
 */
export function CatalogImage({
  src,
  alt,
  sizes,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (failedSrc === src) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailedSrc(src)}
    />
  );
}
