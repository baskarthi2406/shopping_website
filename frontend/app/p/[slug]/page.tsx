import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { toNextMetadata, toNextNotFoundMetadata } from "@/app/to-next-metadata";
import { toProductPageViewModel } from "@/application/catalog";
import { buildNotFoundMetadata } from "@/application/seo/page-metadata";
import { buildProductMetadata } from "@/application/seo/product-metadata";
import { ProductDetail } from "@/components/storefront/product-detail";
import { Container } from "@/components/ui/container";
import { catalog } from "@/config/catalog";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

const loadProductPage = cache((slug: string) => catalog.getProductPage(slug));

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadProductPage(slug);

  if (data === null) {
    return toNextNotFoundMetadata(buildNotFoundMetadata());
  }

  return toNextMetadata(buildProductMetadata(data.product));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const data = await loadProductPage(slug);

  if (data === null) {
    notFound();
  }

  const view = toProductPageViewModel(data.product, data.categories);

  return (
    <Container className="py-6 sm:py-8 lg:py-10">
      <ProductDetail product={view} />
    </Container>
  );
}
