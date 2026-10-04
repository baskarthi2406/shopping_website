import { describe, expect, it } from "vitest";
import type { Category, Product } from "@/domain/catalog";
import type { CatalogApiDispatch } from "./catalog-api-client";
import {
  catalogApiContractChecks,
  describeCatalogApiContract,
} from "./catalog-api-contract";

/*
 * Synthetic contract-probe data, not Mini Mystiq catalog content. The one
 * price uses XTS, the ISO 4217 code reserved for testing; the inventory
 * quantities are arbitrary. Neither represents real pricing or stock.
 */
function category(
  id: string,
  parentId: string | null,
  children: Category[] = [],
  overrides: Partial<Category> = {},
): Category {
  return {
    id,
    slug: id,
    name: `Probe ${id}`,
    parentId,
    children,
    visibility: "visible",
    showInMenu: true,
    description: null,
    image: null,
    ...overrides,
  };
}

const CATEGORY_TREE: Category[] = [
  category("probe-root-a", null, [
    category("probe-child-a1", "probe-root-a", [], {
      visibility: "hidden",
      showInMenu: false,
      description: "Hidden probe category",
    }),
  ]),
  category("probe-root-b", null, [], {
    image: { src: "/probe-root-b.jpg", alt: "Probe category image" },
  }),
];

function product(index: number, overrides: Partial<Product> = {}): Product {
  return {
    id: `probe-id-${index}`,
    slug: `probe-product-${index}`,
    name: `Probe product ${index}`,
    description: `Synthetic probe product ${index}`,
    images: [],
    categoryIds: index % 2 === 0 ? ["probe-root-a"] : [],
    sku: null,
    uom: null,
    pricing: null,
    inventory: null,
    status: "active",
    variants: [],
    ...overrides,
  };
}

const PRODUCTS: Product[] = [
  product(1),
  product(2, {
    sku: "PROBE-SKU-2",
    uom: { code: "probe-unit", label: "Probe unit" },
    pricing: {
      price: { amount: 10, currency: "XTS" },
      compareAtPrice: null,
    },
  }),
  product(3, {
    inventory: { stockOnHand: null, availableToSell: null, reserved: null, status: "unknown" },
  }),
  product(4, {
    inventory: { stockOnHand: 3, availableToSell: 2, reserved: 1, status: "in_stock" },
  }),
  product(5, {
    variants: [
      {
        id: "probe-variant-5a",
        sku: null,
        attributes: [{ name: "Probe option", value: "A" }],
        pricing: null,
        inventory: null,
        status: "active",
      },
    ],
  }),
  product(6, { status: "inactive" }),
  product(7, { images: [{ src: "/probe-7.jpg", alt: "Probe product image" }] }),
];

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function error(code: string, status: number): Response {
  return Response.json({ error: { code, message: `Probe ${code}` } }, { status });
}

function summary(item: Product): Omit<Product, "variants"> {
  const rest: Record<string, unknown> = { ...item };
  delete rest.variants;
  return rest as Omit<Product, "variants">;
}

function positiveInteger(params: URLSearchParams, name: string, fallback: number) {
  const values = params.getAll(name);
  if (values.length === 0) {
    return fallback;
  }
  const value = Number(values[0]);
  return values.length === 1 && /^[1-9]\d*$/.test(values[0] ?? "") && Number.isSafeInteger(value)
    ? value
    : null;
}

/** Independent, minimal implementation of the documented contract. */
const conformingDispatch: CatalogApiDispatch = async (url) => {
  if (url.pathname === "/api/categories") {
    return Response.json({ data: CATEGORY_TREE });
  }
  if (url.pathname === "/api/products") {
    const params = url.searchParams;
    if ([...params.keys()].some((key) => key !== "page" && key !== "pageSize")) {
      return error("invalid_request", 400);
    }
    const page = positiveInteger(params, "page", 1);
    const pageSize = positiveInteger(params, "pageSize", 12);
    if (page === null || pageSize === null) {
      return error("invalid_request", 400);
    }
    const start = (page - 1) * pageSize;
    return Response.json({
      data: PRODUCTS.slice(start, start + pageSize).map(summary),
      pagination: {
        page,
        pageSize,
        total: PRODUCTS.length,
        hasNext: page * pageSize < PRODUCTS.length,
      },
    });
  }
  const match = /^\/api\/products\/([^/]+)$/.exec(url.pathname);
  if (match?.[1] !== undefined) {
    const slug = decodeURIComponent(match[1]);
    if ([...url.searchParams.keys()].length > 0 || !SLUG.test(slug)) {
      return error("invalid_request", 400);
    }
    const found = PRODUCTS.find((item) => item.slug === slug);
    return found ? Response.json({ data: found }) : error("not_found", 404);
  }
  return error("not_found", 404);
};

// Rewrites mutate arbitrary JSON to simulate broken implementations.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rewrite = (url: URL, status: number, body: any) => { status: number; body: unknown } | void;

/** Wraps the conforming fake and rewrites selected JSON responses. */
function broken(rewrite: Rewrite): CatalogApiDispatch {
  return async (url) => {
    const response = await conformingDispatch(url);
    const body = await response.json();
    const changed = rewrite(url, response.status, body);
    return Response.json(changed ? changed.body : body, {
      status: changed ? changed.status : response.status,
    });
  };
}

const isList = (url: URL) => url.pathname === "/api/products";
const isDetail = (url: URL) => url.pathname.startsWith("/api/products/");

let reads = 0;

const NON_CONFORMING: ReadonlyArray<{
  readonly defect: string;
  readonly check: string;
  readonly expected: string;
  readonly dispatch: CatalogApiDispatch;
}> = [
  {
    defect: "list items include variants",
    check: "products.pages",
    expected: "unexpected field(s) variants",
    dispatch: broken((url, status, body) => {
      if (isList(url) && status === 200) {
        body.data = body.data.map((item: object) => ({ ...item, variants: [] }));
      }
    }),
  },
  {
    defect: "nullable pricing omitted instead of null",
    check: "products.pages",
    expected: "missing field(s) pricing",
    dispatch: broken((url, status, body) => {
      if (isList(url) && status === 200) {
        body.data.forEach((item: Record<string, unknown>) => delete item.pricing);
      }
    }),
  },
  {
    defect: "invalid money currency",
    check: "products.pages",
    expected: "pricing.price.currency: must be a three-letter uppercase code",
    dispatch: broken((url, status, body) => {
      if (isList(url) && status === 200) {
        body.data.forEach((item: { pricing: { price: { currency: string } } | null }) => {
          if (item.pricing) item.pricing.price.currency = "xts";
        });
      }
    }),
  },
  {
    defect: "hasNext always true",
    check: "products.pages",
    expected: "pagination.hasNext must be false",
    dispatch: broken((url, status, body) => {
      if (isList(url) && status === 200) body.pagination.hasNext = true;
    }),
  },
  {
    defect: "provider field leaks into list items",
    check: "products.pages",
    expected: "unexpected field(s) item_id",
    dispatch: broken((url, status, body) => {
      if (isList(url) && status === 200) {
        body.data = body.data.map((item: object) => ({ ...item, item_id: "x" }));
      }
    }),
  },
  {
    defect: "default pageSize is 20",
    check: "products.defaults",
    expected: "defaults must be page 1 and pageSize 12",
    dispatch: (url) => {
      if (isList(url) && !url.searchParams.has("pageSize") && url.search === "") {
        return conformingDispatch(new URL("/api/products?page=1&pageSize=20", url));
      }
      return conformingDispatch(url);
    },
  },
  {
    defect: "page beyond the end returns 404",
    check: "products.beyond-end",
    expected: "expected HTTP 200, got 404",
    dispatch: broken((url, status, body) => {
      if (isList(url) && status === 200 && body.data.length === 0) {
        return { status: 404, body: { error: { code: "not_found", message: "x" } } };
      }
    }),
  },
  {
    defect: "unsupported filter parameter accepted",
    check: "products.invalid-query",
    expected: "/api/products?category=kids: expected HTTP 400, got 200",
    dispatch: (url) =>
      conformingDispatch(
        url.searchParams.has("category") ? new URL("/api/products", url) : url,
      ),
  },
  {
    defect: "error envelope without a code",
    check: "products.invalid-query",
    expected: "missing field(s) code",
    dispatch: broken((_url, status) => {
      if (status === 400) return { status, body: { error: { message: "Bad request" } } };
    }),
  },
  {
    defect: "list order changes between reads",
    check: "products.deterministic",
    expected: "repeated reads returned different content or order",
    dispatch: broken((url, status, body) => {
      reads += 1;
      if (isList(url) && status === 200 && reads % 2 === 0) body.data.reverse();
    }),
  },
  {
    defect: "detail disagrees with its list summary",
    check: "detail.listed",
    expected: "differs from its list summary in name",
    dispatch: broken((url, status, body) => {
      if (isDetail(url) && status === 200) body.data.name = "Renamed";
    }),
  },
  {
    defect: "detail omits variants",
    check: "detail.listed",
    expected: "missing field(s) variants",
    dispatch: broken((url, status, body) => {
      if (isDetail(url) && status === 200) delete body.data.variants;
    }),
  },
  {
    defect: "unknown slug returns 200 with null data",
    check: "detail.unknown",
    expected: "expected HTTP 404, got 200",
    dispatch: broken((url, status) => {
      if (isDetail(url) && status === 404) return { status: 200, body: { data: null } };
    }),
  },
  {
    defect: "invalid slug treated as not found",
    check: "detail.invalid-slug",
    expected: "expected error code invalid_request, got not_found",
    dispatch: broken((url, status) => {
      if (isDetail(url) && status === 400 && url.search === "") {
        return { status: 400, body: { error: { code: "not_found", message: "x" } } };
      }
    }),
  },
  {
    defect: "detail ignores query parameters",
    check: "detail.unsupported-query",
    expected: "expected HTTP 400, got 200",
    dispatch: (url) => conformingDispatch(isDetail(url) ? new URL(url.pathname, url) : url),
  },
  {
    defect: "child category has the wrong parentId",
    check: "categories.tree",
    expected: "children[0].parentId: expected probe-root-a, got probe-root-b",
    dispatch: broken((url, _status, body) => {
      if (url.pathname === "/api/categories") body.data[0].children[0].parentId = "probe-root-b";
    }),
  },
  {
    defect: "category order changes between reads",
    check: "categories.deterministic",
    expected: "repeated reads returned different content or order",
    dispatch: broken((url, _status, body) => {
      reads += 1;
      if (url.pathname === "/api/categories" && reads % 2 === 0) body.data.reverse();
    }),
  },
  {
    defect: "duplicate category slug",
    check: "categories.tree",
    expected: "duplicate slug probe-root-a",
    dispatch: broken((url, _status, body) => {
      if (url.pathname === "/api/categories") body.data[1].slug = "probe-root-a";
    }),
  },
  {
    defect: "empty catalog",
    check: "catalog.non-empty",
    expected: "expected at least one product",
    dispatch: broken((url, status, body) => {
      if (isList(url) && status === 200) {
        return {
          status,
          body: { data: [], pagination: { ...body.pagination, total: 0, hasNext: false } },
        };
      }
    }),
  },
];

describeCatalogApiContract("synthetic conforming fake", () => conformingDispatch);

describe("catalog API contract checks detect non-conforming implementations", () => {
  it("has at least one non-conforming case per check", () => {
    const covered = new Set(NON_CONFORMING.map((entry) => entry.check));
    const uncovered = catalogApiContractChecks
      .map((check) => check.id)
      .filter((id) => !covered.has(id));

    expect(uncovered).toEqual([]);
  });

  it.each(NON_CONFORMING.map((entry) => [entry.defect, entry] as const))(
    "reports: %s",
    async (_defect, entry) => {
      const check = catalogApiContractChecks.find((item) => item.id === entry.check);
      if (check === undefined) {
        throw new Error(`Unknown check ${entry.check}`);
      }
      reads = 0;
      const issues = await check.run(entry.dispatch);

      expect(issues.some((issue) => issue.includes(entry.expected)), issues.join("\n")).toBe(
        true,
      );
    },
  );
});
