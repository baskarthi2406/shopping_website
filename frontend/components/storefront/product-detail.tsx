"use client";

import { useState } from "react";
import Link from "next/link";
import { CatalogImage } from "@/components/storefront/catalog-image";
import { imageForVariant } from "@/application/catalog/variant-selection";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import {
  ProductCommercePanel,
  type ProductCommercePanelProps,
} from "@/components/storefront/product-commerce-panel";
import type { CartCandidate } from "@/application/storefront-cart/cart-candidate";
import { ProductCartActions } from "@/components/storefront/product-cart-actions";
import {
  ProductPurchaseOptions,
  type ProductPurchaseOptionsProps,
} from "@/components/storefront/product-purchase-options";

export type ProductDetailProps = {
  product: {
    name: string;
    description: string;
    images: readonly { src: string; alt: string }[];
    categories: readonly { name: string; href: string }[];
    breadcrumb: readonly { label: string; href: string | null }[];
  };
  commerce?: ProductCommercePanelProps;
  /** Present only for products with safely selectable variants. */
  variantOptions?: Omit<ProductPurchaseOptionsProps, "commerce" | "telephone" | "cartChoices"> | null;
  cartChoices?: readonly CartCandidate[];
};

export function ProductDetail({ product, commerce, variantOptions, cartChoices }: ProductDetailProps) {
  const [variantId, setVariantId] = useState<string | null>(null);
  const selectedImage = variantId === null ? undefined : imageForVariant(product.images, variantId);
  const primaryImage = selectedImage ?? product.images[0] ?? null;
  const additionalImages = product.images.filter((image) => image.src !== primaryImage?.src);

  return (
    <>
      <Breadcrumbs items={product.breadcrumb} />

      <article className="mt-4 grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-10">
        <div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-border bg-surface">
            {primaryImage ? (
              <CatalogImage
                src={primaryImage.src}
                alt={primaryImage.alt}
                priority
                sizes="(max-width: 1023px) 100vw, 50vw"
                className="object-contain p-4"
              />
            ) : null}
          </div>
          {additionalImages.length > 0 ? (
            <ul className="mt-3 grid grid-cols-2 gap-3">
              {additionalImages.map((image) => (
                <li
                  key={image.src}
                  className="relative aspect-[3/4] overflow-hidden rounded-md bg-surface-muted"
                >
                  <CatalogImage
                    src={image.src}
                    alt={image.alt}
                    sizes="(max-width: 1023px) 50vw, 25vw"
                    className="object-contain p-2"
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <h1 className="font-display text-h1 font-semibold tracking-tight text-foreground">
            {product.name}
          </h1>
          {product.description ? (
            <p className="mt-3 text-body text-foreground-secondary">
              {product.description}
            </p>
          ) : null}
          {commerce && variantOptions ? (
            <ProductPurchaseOptions
              {...variantOptions}
              {...commerce}
              cartChoices={cartChoices}
              onResolvedVariantId={setVariantId}
            />
          ) : commerce ? (
            <>
              <ProductCommercePanel {...commerce} />
              {cartChoices ? <ProductCartActions choice={cartChoices[0] ?? null} /> : null}
            </>
          ) : null}
          {product.categories.length > 0 ? (
            <p className="mt-6 text-small text-foreground-secondary">
              {product.categories.map((category, index) => (
                <span key={category.href}>
                  {index > 0 ? ", " : null}
                  <Link
                    href={category.href}
                    className="inline-flex min-h-[var(--mm-tap-min)] items-center text-primary hover:text-primary-hover"
                  >
                    {category.name}
                  </Link>
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </article>
    </>
  );
}
