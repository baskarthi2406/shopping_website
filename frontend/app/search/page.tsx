import type { Metadata } from "next";
import { unstable_rethrow } from "next/navigation";
import { searchStorefrontProducts, toProductCardViewModel } from "@/application/catalog";
import { CatalogUnavailable } from "@/components/storefront/catalog-unavailable";
import { SearchResults } from "@/components/storefront/search-results";
import { Container } from "@/components/ui/container";
import { catalog } from "@/config/catalog";
import { priceDisplay } from "@/config/commerce";

export const metadata: Metadata = {
  title: "Search | Mini Mystiq",
  robots: { index: false, follow: false },
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

function readQuery(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim().slice(0, 80);
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = readQuery((await searchParams).q);
  let catalogFailed = false;
  let products: ReturnType<typeof toProductCardViewModel>[] = [];

  if (query !== "") {
    try {
      const [listed, categories] = await Promise.all([
        catalog.listProducts(),
        catalog.listCategories(),
      ]);
      products = searchStorefrontProducts(listed, categories, query).map((product) =>
        toProductCardViewModel(product, priceDisplay),
      );
    } catch (error) {
      unstable_rethrow(error);
      catalogFailed = true;
    }
  }

  return (
    <Container className="min-w-0 py-6 sm:py-8 lg:py-10">
      <h1 className="font-display text-h1 font-semibold tracking-tight text-foreground">Search</h1>
      {catalogFailed ? (
        <CatalogUnavailable headingAs="h2" />
      ) : (
        <SearchResults query={query} products={products} />
      )}
    </Container>
  );
}
