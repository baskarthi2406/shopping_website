import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { toNextMetadata, toNextNotFoundMetadata } from "@/app/to-next-metadata";
import { toCategoryPageViewModel } from "@/application/catalog";
import { buildCategoryMetadata } from "@/application/seo/category-metadata";
import { buildNotFoundMetadata } from "@/application/seo/page-metadata";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import { ProductCard } from "@/components/storefront/product-card";
import { Container } from "@/components/ui/container";
import { catalog } from "@/config/catalog";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

const loadCategoryPage = cache((slug: string) => catalog.getCategoryPage(slug));

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadCategoryPage(slug);

  if (data === null) {
    return toNextNotFoundMetadata(buildNotFoundMetadata());
  }

  return toNextMetadata(buildCategoryMetadata(data.category));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const data = await loadCategoryPage(slug);

  if (data === null) {
    notFound();
  }

  const view = toCategoryPageViewModel(data.category, data.products);
  const productCountLabel =
    view.productCount === 1 ? "1 product" : `${view.productCount} products`;

  return (
    <Container className="py-6 sm:py-8 lg:py-10">
      <Breadcrumbs items={view.breadcrumb} />

      <header className="mt-4">
        <h1 className="text-h1 font-semibold tracking-tight text-foreground">
          {view.name}
        </h1>
        {view.description ? (
          <p className="mt-2 text-body text-foreground-secondary">
            {view.description}
          </p>
        ) : null}
        <p className="mt-3 text-small text-foreground-muted">
          {productCountLabel}
        </p>
      </header>

      {view.products.length === 0 ? (
        <p className="mt-8 text-body text-foreground-secondary">
          No products in this category yet.
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {view.products.map((product) => (
            <li key={product.href}>
              <ProductCard {...product} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
