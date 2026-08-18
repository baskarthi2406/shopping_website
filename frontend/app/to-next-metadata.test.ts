import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { toNextMetadata, toNextNotFoundMetadata } from "@/app/to-next-metadata";
import { buildCategoryMetadata } from "@/application/seo/category-metadata";
import { buildHomeMetadata } from "@/application/seo/home-metadata";
import { buildNotFoundMetadata } from "@/application/seo/page-metadata";
import { buildProductMetadata } from "@/application/seo/product-metadata";
import type { Category, Product } from "@/domain/catalog";
import {
  resolveSiteOrigin,
  toAbsoluteSiteUrl,
  toCanonicalUrl,
} from "@/config/site";

const publicDir = path.resolve(import.meta.dirname, "../public");
const productionOrigin = resolveSiteOrigin({
  NEXT_PUBLIC_SITE_URL: "https://store.example",
});

function category(
  overrides: Partial<Category> & Pick<Category, "id" | "slug" | "name">,
): Category {
  return {
    description: null,
    image: null,
    ...overrides,
  };
}

function product(
  overrides: Partial<Product> & Pick<Product, "id" | "slug" | "name">,
): Product {
  return {
    description: "In-memory test product",
    images: [],
    categoryIds: [],
    variants: [{ id: `${overrides.id}-default` }],
    uomCode: null,
    inventoryStatus: "unknown",
    ...overrides,
  };
}

function ogImages(mapped: ReturnType<typeof toNextMetadata>) {
  return mapped.openGraph && "images" in mapped.openGraph
    ? mapped.openGraph.images
    : undefined;
}

describe("toNextMetadata OpenGraph mapping", () => {
  it("maps homepage OG fields from existing metadata helpers", () => {
    const meta = buildHomeMetadata();
    const mapped = toNextMetadata(meta);
    const imageFile = meta.image.src.replace(/^\//, "");

    expect(mapped.title).toBe(meta.title);
    expect(mapped.description).toBe(meta.description);
    expect(mapped.alternates?.canonical).toBe(meta.canonicalPath);
    expect(mapped.openGraph).toMatchObject({
      type: "website",
      title: meta.title,
      description: meta.description,
      url: meta.canonicalPath,
    });
    expect(mapped.openGraph?.url).toBe(mapped.alternates?.canonical);
    expect(ogImages(mapped)).toEqual([
      { url: meta.image.src, alt: meta.image.alt },
    ]);
    expect(meta.image.src).toBe(
      "/baby-sleeveless-sets-new-collection-banner.jpg",
    );
    expect(meta.image.src).not.toBe("/mini-mystiq-logo.png");
    expect(existsSync(path.join(publicDir, imageFile))).toBe(true);
  });

  it("maps category OG fields including the documented stand-in image", () => {
    const meta = buildCategoryMetadata(
      category({
        id: "kids",
        slug: "kids",
        name: "Kids",
        image: {
          src: "/kids-striped-shirts-burgundy-and-sage.jpg",
          alt: "Burgundy and sage striped kids shirts",
        },
      }),
    );
    const mapped = toNextMetadata(meta);

    expect(mapped.openGraph).toMatchObject({
      type: "website",
      title: "Kids | Mini Mystiq",
      description: meta.description,
      url: "/c/kids",
    });
    expect(mapped.openGraph?.url).toBe(mapped.alternates?.canonical);
    expect(ogImages(mapped)).toEqual([
      {
        url: "/kids-striped-shirts-burgundy-and-sage.jpg",
        alt: "Burgundy and sage striped kids shirts",
      },
    ]);
  });

  it("maps product OG fields including an uncategorized product image", () => {
    const meta = buildProductMetadata(
      product({
        id: "olive-green-patterned-dress",
        slug: "olive-green-patterned-dress",
        name: "Olive green patterned dress",
        description: "Olive green patterned dress on a wooden hanger",
        categoryIds: [],
        images: [
          {
            src: "/olive-green-patterned-dress.jpg",
            alt: "Olive green patterned dress on a wooden hanger",
          },
        ],
      }),
    );
    const mapped = toNextMetadata(meta);

    expect(meta.canonicalPath).toBe("/p/olive-green-patterned-dress");
    expect(meta.canonicalPath).not.toContain("/c/");
    expect(mapped.openGraph).toMatchObject({
      type: "website",
      title: meta.title,
      description: meta.description,
      url: meta.canonicalPath,
    });
    expect(mapped.openGraph?.url).toBe(mapped.alternates?.canonical);
    expect(ogImages(mapped)).toEqual([
      {
        url: "/olive-green-patterned-dress.jpg",
        alt: "Olive green patterned dress on a wooden hanger",
      },
    ]);
  });

  it("resolves canonical and OG URLs against the configured production origin", () => {
    const home = buildHomeMetadata();
    const mapped = toNextMetadata(home);
    const canonical = toCanonicalUrl(productionOrigin, home.canonicalPath);
    const ogUrl = toCanonicalUrl(
      productionOrigin,
      String(mapped.openGraph?.url),
    );
    const ogImage = toAbsoluteSiteUrl(productionOrigin, home.image.src);

    expect(canonical).toBe("https://store.example");
    expect(ogUrl).toBe(canonical);
    expect(ogImage).toBe(
      "https://store.example/baby-sleeveless-sets-new-collection-banner.jpg",
    );
    expect(canonical).not.toContain("localhost");
    expect(ogUrl).not.toContain("localhost");
    expect(ogImage).not.toContain("localhost");
    expect(canonical).not.toContain("?");
  });

  it("keeps application paths path-only; origin comes from config/site.ts", () => {
    const mapped = toNextMetadata(buildHomeMetadata());
    const json = JSON.stringify(mapped);

    expect(mapped.openGraph?.url).toBe("/");
    expect(String(mapped.openGraph?.url)).not.toMatch(/^https?:\/\//);
    expect(json).not.toContain("localhost");
    expect(json).not.toContain("process.env");
  });

  it("omits OpenGraph images when the page has no documented image", () => {
    const mapped = toNextMetadata(
      buildCategoryMetadata(
        category({ id: "empty", slug: "empty", name: "Empty" }),
      ),
    );

    expect(ogImages(mapped)).toBeUndefined();
  });

  it("does not add business, social, or invented marketing fields", () => {
    const mapped = toNextMetadata(buildHomeMetadata());
    const json = JSON.stringify(mapped);

    expect(mapped.openGraph).not.toHaveProperty("emails");
    expect(mapped.openGraph).not.toHaveProperty("phoneNumbers");
    expect(json).not.toMatch(/legalName|sameAs|telephone|090257/);
    expect(json).not.toMatch(
      /\b(best|cheapest|premium|guaranteed|free delivery|COD|easy returns)\b/i,
    );
  });
});

describe("toNextNotFoundMetadata", () => {
  it("keeps invalid pages noindex without canonical or OpenGraph", () => {
    const mapped = toNextNotFoundMetadata(buildNotFoundMetadata());

    expect(mapped.robots).toEqual({ index: false, follow: false });
    expect(mapped).not.toHaveProperty("alternates");
    expect(mapped).not.toHaveProperty("openGraph");
    expect(mapped.title).toBe("Page not found | Mini Mystiq");
  });
});
