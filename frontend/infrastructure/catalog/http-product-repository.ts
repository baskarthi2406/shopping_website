import type { ProductRepository } from "@/application/catalog";
import type { Product, ProductSummary } from "@/domain/catalog";
import type { CatalogApiClient } from "./catalog-api-client";
import { flattenCategoryTree } from "./http-category-repository";

function toProduct(summary: ProductSummary): Product {
  return {
    ...summary,
    variants: [],
  };
}

export class HttpProductRepository implements ProductRepository {
  constructor(private readonly api: CatalogApiClient) {}

  async getById(id: string): Promise<Product | null> {
    const listed = await this.list();
    const summary = listed.find((product) => product.id === id);
    if (summary === undefined) {
      return null;
    }

    return this.api.getProductBySlug(summary.slug);
  }

  async getBySlug(slug: string): Promise<Product | null> {
    return this.api.getProductBySlug(slug);
  }

  async list(): Promise<readonly Product[]> {
    const products: Product[] = [];
    let page = 1;

    while (true) {
      const result = await this.api.getProductCollection({ page });
      products.push(...result.data.map(toProduct));
      if (!result.pagination.hasNext) {
        break;
      }
      page += 1;
    }

    return products;
  }

  async listByCategorySlug(slug: string): Promise<readonly Product[]> {
    const category = flattenCategoryTree(await this.api.getCategoryTree()).find(
      (item) => item.slug === slug,
    );
    if (category === undefined) {
      return [];
    }

    return (await this.list()).filter((product) =>
      product.categoryIds.includes(category.id),
    );
  }

  async listFeatured(): Promise<readonly Product[]> {
    return [];
  }
}
