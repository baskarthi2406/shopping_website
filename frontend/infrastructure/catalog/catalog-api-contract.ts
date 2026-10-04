import { isDeepStrictEqual } from "node:util";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_PRODUCT_PAGE,
  DEFAULT_PRODUCT_PAGE_SIZE,
} from "@/application/catalog";
import { isCatalogSlug, validateProduct, type Product } from "@/domain/catalog";
import type { CatalogApiDispatch } from "./catalog-api-client";

/**
 * Reusable conformance checks for any `CatalogApiDispatch` implementation.
 * They assert the public catalog envelopes in
 * `docs/architecture/STOREFRONT_CONTRACTS.md` and what `catalog-api-client`
 * and the HTTP repositories rely on, never specific catalog content. Each check
 * returns violation messages; an empty array means the check passed.
 */
export type CatalogContractCheck = {
  readonly id: string;
  readonly name: string;
  readonly run: (dispatch: CatalogApiDispatch) => Promise<readonly string[]>;
};

type Issues = string[];
type JsonRecord = Record<string, unknown>;

type ApiResult = {
  readonly status: number;
  readonly contentType: string;
  readonly body: unknown;
  readonly parsed: boolean;
};

const ORIGIN = "http://catalog.local";
const SECOND_PAGE_SIZE = 5;
const MISSING_SLUG_PROBE = "contract-probe-missing-product";

const CATEGORY_KEYS = [
  "id",
  "slug",
  "name",
  "parentId",
  "children",
  "visibility",
  "showInMenu",
  "description",
  "image",
] as const;
const SUMMARY_KEYS = [
  "id",
  "slug",
  "name",
  "description",
  "images",
  "categoryIds",
  "sku",
  "uom",
  "pricing",
  "inventory",
  "status",
] as const;
const PRODUCT_KEYS = [...SUMMARY_KEYS, "variants"] as const;
const VARIANT_KEYS = [
  "id",
  "sku",
  "attributes",
  "pricing",
  "inventory",
  "status",
] as const;
const PAGINATION_KEYS = ["page", "pageSize", "total", "hasNext"] as const;

const INVALID_PRODUCT_QUERIES = [
  "page=0",
  "page=-1",
  "page=1.5",
  "page=abc",
  "page=",
  "pageSize=0",
  "pageSize=abc",
  "page=9007199254740993",
  "page=1&page=2",
  "pageSize=5&pageSize=5",
  "category=kids",
  "sort=name",
  "q=dress",
] as const;
const INVALID_SLUGS = [
  "Not-A-Slug",
  "UPPERCASE",
  "under_score",
  "double--hyphen",
  "-leading",
  "trailing-",
  "space slug",
] as const;

async function call(
  dispatch: CatalogApiDispatch,
  pathAndQuery: string,
): Promise<ApiResult> {
  const response = await dispatch(new URL(pathAndQuery, ORIGIN));
  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();
  try {
    return { status: response.status, contentType, body: JSON.parse(text), parsed: true };
  } catch {
    return { status: response.status, contentType, body: undefined, parsed: false };
  }
}

function productPath(slug: string, query = ""): string {
  return `/api/products/${encodeURIComponent(slug)}${query}`;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isInteger(value: unknown, minimum: number): value is number {
  return Number.isSafeInteger(value) && (value as number) >= minimum;
}

/** Contract shapes are closed: missing and unexpected fields are violations. */
function hasExactKeys(
  value: unknown,
  keys: readonly string[],
  path: string,
  issues: Issues,
): value is JsonRecord {
  if (!isRecord(value)) {
    issues.push(`${path}: expected an object`);
    return false;
  }
  const expected = new Set(keys);
  const missing = keys.filter((key) => !(key in value));
  const extra = Object.keys(value).filter((key) => !expected.has(key));
  if (missing.length > 0) {
    issues.push(`${path}: missing field(s) ${missing.join(", ")}`);
  }
  if (extra.length > 0) {
    issues.push(`${path}: unexpected field(s) ${extra.join(", ")}`);
  }
  return missing.length === 0;
}

function requireType(
  ok: boolean,
  path: string,
  expectation: string,
  issues: Issues,
): boolean {
  if (!ok) {
    issues.push(`${path}: must be ${expectation}`);
  }
  return ok;
}

function isSuccess(result: ApiResult, path: string, issues: Issues): boolean {
  const before = issues.length;
  if (result.status !== 200) {
    issues.push(`${path}: expected HTTP 200, got ${result.status}`);
  }
  if (!result.contentType.includes("application/json")) {
    issues.push(`${path}: expected a JSON content type`);
  }
  if (!result.parsed) {
    issues.push(`${path}: body is not JSON`);
  }
  return issues.length === before;
}

function checkError(
  result: ApiResult,
  path: string,
  status: number,
  code: string,
  issues: Issues,
): void {
  if (result.status !== status) {
    issues.push(`${path}: expected HTTP ${status}, got ${result.status}`);
  }
  if (!result.contentType.includes("application/json")) {
    issues.push(`${path}: expected a JSON content type`);
  }
  if (
    !hasExactKeys(result.body, ["error"], `${path} body`, issues) ||
    !hasExactKeys(result.body.error, ["code", "message"], `${path} error`, issues)
  ) {
    return;
  }
  if (result.body.error.code !== code) {
    issues.push(
      `${path}: expected error code ${code}, got ${String(result.body.error.code)}`,
    );
  }
  requireType(
    isNonEmptyString(result.body.error.message),
    `${path} error.message`,
    "a non-empty string",
    issues,
  );
}

function checkImage(value: unknown, path: string, issues: Issues): boolean {
  return (
    hasExactKeys(value, ["src", "alt"], path, issues) &&
    requireType(isNonEmptyString(value.src), `${path}.src`, "a non-empty string", issues) &&
    requireType(isNonEmptyString(value.alt), `${path}.alt`, "a non-empty string", issues)
  );
}

function checkNullable(
  value: unknown,
  path: string,
  issues: Issues,
  check: (value: unknown, path: string, issues: Issues) => boolean,
): boolean {
  return value === null || check(value, path, issues);
}

function checkMoney(value: unknown, path: string, issues: Issues): boolean {
  return (
    hasExactKeys(value, ["amount", "currency"], path, issues) &&
    requireType(typeof value.amount === "number", `${path}.amount`, "a number", issues) &&
    requireType(typeof value.currency === "string", `${path}.currency`, "a string", issues)
  );
}

function checkPricing(value: unknown, path: string, issues: Issues): boolean {
  return (
    hasExactKeys(value, ["price", "compareAtPrice"], path, issues) &&
    checkMoney(value.price, `${path}.price`, issues) &&
    checkNullable(value.compareAtPrice, `${path}.compareAtPrice`, issues, checkMoney)
  );
}

function checkInventory(value: unknown, path: string, issues: Issues): boolean {
  if (
    !hasExactKeys(
      value,
      ["stockOnHand", "availableToSell", "reserved", "status"],
      path,
      issues,
    )
  ) {
    return false;
  }
  let ok = true;
  for (const name of ["stockOnHand", "availableToSell", "reserved"] as const) {
    ok =
      requireType(
        value[name] === null || typeof value[name] === "number",
        `${path}.${name}`,
        "null or a number",
        issues,
      ) && ok;
  }
  return (
    requireType(
      value.status === "unknown" ||
        value.status === "in_stock" ||
        value.status === "out_of_stock",
      `${path}.status`,
      "unknown, in_stock, or out_of_stock",
      issues,
    ) && ok
  );
}

function checkUom(value: unknown, path: string, issues: Issues): boolean {
  return (
    hasExactKeys(value, ["code", "label"], path, issues) &&
    requireType(typeof value.code === "string", `${path}.code`, "a string", issues) &&
    requireType(typeof value.label === "string", `${path}.label`, "a string", issues)
  );
}

function checkStatus(value: unknown, path: string, issues: Issues): boolean {
  return requireType(
    value === "active" || value === "inactive",
    path,
    "active or inactive",
    issues,
  );
}

function checkSummaryFields(value: JsonRecord, path: string, issues: Issues): boolean {
  const results = [
    requireType(typeof value.id === "string", `${path}.id`, "a string", issues),
    requireType(typeof value.slug === "string", `${path}.slug`, "a string", issues),
    requireType(typeof value.name === "string", `${path}.name`, "a string", issues),
    requireType(
      typeof value.description === "string",
      `${path}.description`,
      "a string",
      issues,
    ),
    requireType(Array.isArray(value.images), `${path}.images`, "an array", issues) &&
      (value.images as unknown[]).every((image, index) =>
        checkImage(image, `${path}.images[${index}]`, issues),
      ),
    requireType(
      Array.isArray(value.categoryIds) &&
        value.categoryIds.every((id) => typeof id === "string"),
      `${path}.categoryIds`,
      "an array of strings",
      issues,
    ),
    requireType(
      value.sku === null || typeof value.sku === "string",
      `${path}.sku`,
      "null or a string",
      issues,
    ),
    checkNullable(value.uom, `${path}.uom`, issues, checkUom),
    checkNullable(value.pricing, `${path}.pricing`, issues, checkPricing),
    checkNullable(value.inventory, `${path}.inventory`, issues, checkInventory),
    checkStatus(value.status, `${path}.status`, issues),
  ];
  return results.every(Boolean);
}

function checkVariant(value: unknown, path: string, issues: Issues): boolean {
  if (!hasExactKeys(value, VARIANT_KEYS, path, issues)) {
    return false;
  }
  const results = [
    requireType(typeof value.id === "string", `${path}.id`, "a string", issues),
    requireType(
      value.sku === null || typeof value.sku === "string",
      `${path}.sku`,
      "null or a string",
      issues,
    ),
    requireType(
      Array.isArray(value.attributes) &&
        value.attributes.every(
          (attribute) =>
            isRecord(attribute) &&
            Object.keys(attribute).length === 2 &&
            typeof attribute.name === "string" &&
            typeof attribute.value === "string",
        ),
      `${path}.attributes`,
      "an array of { name, value } strings",
      issues,
    ),
    checkNullable(value.pricing, `${path}.pricing`, issues, checkPricing),
    checkNullable(value.inventory, `${path}.inventory`, issues, checkInventory),
    checkStatus(value.status, `${path}.status`, issues),
  ];
  return results.every(Boolean);
}

function addDomainViolations(product: Product, path: string, issues: Issues): void {
  for (const violation of validateProduct(product, path)) {
    issues.push(`${violation.path}: ${violation.message}`);
  }
}

/** Product list items: summary fields only (never `variants`). */
function checkSummary(value: unknown, path: string, issues: Issues): boolean {
  if (!hasExactKeys(value, SUMMARY_KEYS, path, issues)) {
    return false;
  }
  if (!checkSummaryFields(value, path, issues)) {
    return false;
  }
  addDomainViolations({ ...(value as Omit<Product, "variants">), variants: [] }, path, issues);
  return true;
}

function checkProduct(value: unknown, path: string, issues: Issues): boolean {
  if (!hasExactKeys(value, PRODUCT_KEYS, path, issues)) {
    return false;
  }
  const fieldsOk = checkSummaryFields(value, path, issues);
  const variantsOk =
    requireType(Array.isArray(value.variants), `${path}.variants`, "an array", issues) &&
    (value.variants as unknown[]).every((variant, index) =>
      checkVariant(variant, `${path}.variants[${index}]`, issues),
    );
  if (!fieldsOk || !variantsOk) {
    return false;
  }
  addDomainViolations(value as Product, path, issues);
  return true;
}

function checkCategoryTree(data: unknown, path: string, issues: Issues): void {
  if (!Array.isArray(data)) {
    issues.push(`${path}: must be an array`);
    return;
  }
  const ids = new Set<string>();
  const slugs = new Set<string>();

  function visit(node: unknown, nodePath: string, parentId: string | null): void {
    if (!hasExactKeys(node, CATEGORY_KEYS, nodePath, issues)) {
      return;
    }
    if (requireType(isNonEmptyString(node.id), `${nodePath}.id`, "a non-empty string", issues)) {
      if (ids.has(node.id as string)) {
        issues.push(`${nodePath}.id: duplicate id ${String(node.id)}`);
      }
      ids.add(node.id as string);
    }
    if (
      requireType(
        typeof node.slug === "string" && isCatalogSlug(node.slug),
        `${nodePath}.slug`,
        "a valid catalog slug",
        issues,
      )
    ) {
      if (slugs.has(node.slug as string)) {
        issues.push(`${nodePath}.slug: duplicate slug ${String(node.slug)}`);
      }
      slugs.add(node.slug as string);
    }
    requireType(isNonEmptyString(node.name), `${nodePath}.name`, "a non-empty string", issues);
    if (node.parentId !== parentId) {
      issues.push(
        `${nodePath}.parentId: expected ${String(parentId)}, got ${String(node.parentId)}`,
      );
    }
    requireType(
      node.visibility === "visible" || node.visibility === "hidden",
      `${nodePath}.visibility`,
      "visible or hidden",
      issues,
    );
    requireType(
      typeof node.showInMenu === "boolean",
      `${nodePath}.showInMenu`,
      "a boolean",
      issues,
    );
    requireType(
      node.description === null || typeof node.description === "string",
      `${nodePath}.description`,
      "null or a string",
      issues,
    );
    checkNullable(node.image, `${nodePath}.image`, issues, checkImage);
    if (requireType(Array.isArray(node.children), `${nodePath}.children`, "an array", issues)) {
      (node.children as unknown[]).forEach((child, index) =>
        visit(
          child,
          `${nodePath}.children[${index}]`,
          typeof node.id === "string" ? node.id : null,
        ),
      );
    }
  }

  data.forEach((root, index) => visit(root, `${path}[${index}]`, null));
}

function checkPagination(
  value: unknown,
  path: string,
  issues: Issues,
): { page: number; pageSize: number; total: number; hasNext: boolean } | null {
  if (!hasExactKeys(value, PAGINATION_KEYS, path, issues)) {
    return null;
  }
  const results = [
    requireType(isInteger(value.page, 1), `${path}.page`, "a positive integer", issues),
    requireType(
      isInteger(value.pageSize, 1),
      `${path}.pageSize`,
      "a positive integer",
      issues,
    ),
    requireType(
      isInteger(value.total, 0),
      `${path}.total`,
      "a non-negative integer",
      issues,
    ),
    requireType(typeof value.hasNext === "boolean", `${path}.hasNext`, "a boolean", issues),
  ];
  return results.every(Boolean)
    ? (value as { page: number; pageSize: number; total: number; hasNext: boolean })
    : null;
}

type ProductListing = {
  readonly summaries: readonly JsonRecord[];
  readonly total: number | null;
};

/**
 * Reads every page at one page size. The loop stops at the page count implied
 * by `total`, so a wrong `hasNext` is reported instead of looping forever.
 */
async function readAllProducts(
  dispatch: CatalogApiDispatch,
  pageSize: number,
  issues: Issues,
): Promise<ProductListing> {
  const summaries: JsonRecord[] = [];
  let total: number | null = null;

  for (let page = DEFAULT_PRODUCT_PAGE; ; page += 1) {
    const path = `/api/products?page=${page}&pageSize=${pageSize}`;
    const result = await call(dispatch, path);
    if (
      !isSuccess(result, path, issues) ||
      !hasExactKeys(result.body, ["data", "pagination"], `${path} body`, issues)
    ) {
      return { summaries, total };
    }
    const pagination = checkPagination(
      result.body.pagination,
      `${path} pagination`,
      issues,
    );
    if (pagination === null) {
      return { summaries, total };
    }
    if (pagination.page !== page) {
      issues.push(`${path}: pagination.page is ${pagination.page}, expected ${page}`);
    }
    if (pagination.pageSize !== pageSize) {
      issues.push(
        `${path}: pagination.pageSize is ${pagination.pageSize}, expected ${pageSize}`,
      );
    }
    if (total === null) {
      total = pagination.total;
    } else if (pagination.total !== total) {
      issues.push(`${path}: pagination.total changed from ${total} to ${pagination.total}`);
    }
    const expectedHasNext = page * pageSize < total;
    if (pagination.hasNext !== expectedHasNext) {
      issues.push(`${path}: pagination.hasNext must be ${expectedHasNext}`);
    }
    const data = result.body.data;
    if (!Array.isArray(data)) {
      issues.push(`${path} data: must be an array`);
      return { summaries, total };
    }
    const expectedLength = Math.max(0, Math.min(pageSize, total - (page - 1) * pageSize));
    if (data.length !== expectedLength) {
      issues.push(`${path}: expected ${expectedLength} item(s), got ${data.length}`);
    }
    data.forEach((item: unknown, index: number) => {
      checkSummary(item, `${path} data[${index}]`, issues);
      if (isRecord(item)) {
        summaries.push(item);
      }
    });

    if (page >= Math.max(1, Math.ceil(total / pageSize))) {
      return { summaries, total };
    }
  }
}

function listedSlugs(listing: ProductListing): string[] {
  return listing.summaries
    .map((summary) => summary.slug)
    .filter((slug): slug is string => typeof slug === "string");
}

async function checkNonEmpty(dispatch: CatalogApiDispatch): Promise<Issues> {
  const issues: Issues = [];
  const categories = await call(dispatch, "/api/categories");
  if (
    isSuccess(categories, "/api/categories", issues) &&
    isRecord(categories.body) &&
    (!Array.isArray(categories.body.data) || categories.body.data.length === 0)
  ) {
    issues.push("/api/categories: expected at least one category");
  }
  const listing = await readAllProducts(dispatch, DEFAULT_PRODUCT_PAGE_SIZE, []);
  if (listing.summaries.length === 0) {
    issues.push("/api/products: expected at least one product");
  }
  return issues;
}

async function checkCategories(dispatch: CatalogApiDispatch): Promise<Issues> {
  const issues: Issues = [];
  const path = "/api/categories";
  const result = await call(dispatch, path);
  if (
    isSuccess(result, path, issues) &&
    hasExactKeys(result.body, ["data"], `${path} body`, issues)
  ) {
    checkCategoryTree(result.body.data, `${path} data`, issues);
  }
  return issues;
}

async function checkDeterministic(
  dispatch: CatalogApiDispatch,
  path: string,
): Promise<Issues> {
  const issues: Issues = [];
  const first = await call(dispatch, path);
  const second = await call(dispatch, path);
  if (
    isSuccess(first, path, issues) &&
    isSuccess(second, path, issues) &&
    !isDeepStrictEqual(first.body, second.body)
  ) {
    issues.push(`${path}: repeated reads returned different content or order`);
  }
  return issues;
}

async function checkProductDefaults(dispatch: CatalogApiDispatch): Promise<Issues> {
  const issues: Issues = [];
  const implicit = await call(dispatch, "/api/products");
  const explicitPath = `/api/products?page=${DEFAULT_PRODUCT_PAGE}&pageSize=${DEFAULT_PRODUCT_PAGE_SIZE}`;
  const explicit = await call(dispatch, explicitPath);
  if (
    !isSuccess(implicit, "/api/products", issues) ||
    !isSuccess(explicit, explicitPath, issues)
  ) {
    return issues;
  }
  const pagination = isRecord(implicit.body) ? implicit.body.pagination : undefined;
  if (
    !isRecord(pagination) ||
    pagination.page !== DEFAULT_PRODUCT_PAGE ||
    pagination.pageSize !== DEFAULT_PRODUCT_PAGE_SIZE
  ) {
    issues.push(
      `/api/products: defaults must be page ${DEFAULT_PRODUCT_PAGE} and pageSize ${DEFAULT_PRODUCT_PAGE_SIZE}`,
    );
  }
  if (!isDeepStrictEqual(implicit.body, explicit.body)) {
    issues.push(`/api/products: must equal ${explicitPath}`);
  }
  return issues;
}

async function checkProductPages(dispatch: CatalogApiDispatch): Promise<Issues> {
  const issues: Issues = [];
  const primary = await readAllProducts(dispatch, DEFAULT_PRODUCT_PAGE_SIZE, issues);
  const secondary = await readAllProducts(dispatch, SECOND_PAGE_SIZE, issues);

  if (primary.total !== null && primary.summaries.length !== primary.total) {
    issues.push(
      `/api/products: read ${primary.summaries.length} product(s) but total is ${primary.total}`,
    );
  }
  for (const field of ["id", "slug"] as const) {
    const values = primary.summaries.map((summary) => summary[field]);
    if (new Set(values).size !== values.length) {
      issues.push(`/api/products: product ${field} values must be unique across pages`);
    }
  }
  if (!isDeepStrictEqual(primary.summaries, secondary.summaries)) {
    issues.push(
      `/api/products: pageSize ${DEFAULT_PRODUCT_PAGE_SIZE} and pageSize ${SECOND_PAGE_SIZE} must yield the same products in the same order`,
    );
  }
  return issues;
}

async function checkBeyondEnd(dispatch: CatalogApiDispatch): Promise<Issues> {
  const issues: Issues = [];
  const first = await call(dispatch, "/api/products");
  const total =
    isRecord(first.body) && isRecord(first.body.pagination)
      ? first.body.pagination.total
      : undefined;
  if (!isInteger(total, 0)) {
    issues.push("/api/products: cannot determine total");
    return issues;
  }
  const page = Math.ceil(total / DEFAULT_PRODUCT_PAGE_SIZE) + 1;
  const path = `/api/products?page=${page}&pageSize=${DEFAULT_PRODUCT_PAGE_SIZE}`;
  const result = await call(dispatch, path);
  const expected = {
    data: [],
    pagination: { page, pageSize: DEFAULT_PRODUCT_PAGE_SIZE, total, hasNext: false },
  };
  if (isSuccess(result, path, issues) && !isDeepStrictEqual(result.body, expected)) {
    issues.push(`${path}: expected ${JSON.stringify(expected)}`);
  }
  return issues;
}

async function checkInvalidProductQueries(dispatch: CatalogApiDispatch): Promise<Issues> {
  const issues: Issues = [];
  for (const query of INVALID_PRODUCT_QUERIES) {
    const path = `/api/products?${query}`;
    checkError(await call(dispatch, path), path, 400, "invalid_request", issues);
  }
  return issues;
}

async function checkListedDetails(dispatch: CatalogApiDispatch): Promise<Issues> {
  const issues: Issues = [];
  const listing = await readAllProducts(dispatch, DEFAULT_PRODUCT_PAGE_SIZE, []);

  for (const summary of listing.summaries) {
    if (typeof summary.slug !== "string") {
      continue;
    }
    const path = productPath(summary.slug);
    const result = await call(dispatch, path);
    if (
      !isSuccess(result, path, issues) ||
      !hasExactKeys(result.body, ["data"], `${path} body`, issues) ||
      !checkProduct(result.body.data, `${path} data`, issues)
    ) {
      continue;
    }
    const detailFields = { ...(result.body.data as JsonRecord) };
    delete detailFields.variants;
    const differing = SUMMARY_KEYS.filter(
      (key) => !isDeepStrictEqual(detailFields[key], summary[key]),
    );
    if (differing.length > 0) {
      issues.push(`${path}: differs from its list summary in ${differing.join(", ")}`);
    }
  }
  return issues;
}

async function checkUnknownSlug(dispatch: CatalogApiDispatch): Promise<Issues> {
  const issues: Issues = [];
  const slugs = new Set(
    listedSlugs(await readAllProducts(dispatch, DEFAULT_PRODUCT_PAGE_SIZE, [])),
  );
  let probe = MISSING_SLUG_PROBE;
  while (slugs.has(probe)) {
    probe = `${probe}-x`;
  }
  const path = productPath(probe);
  checkError(await call(dispatch, path), path, 404, "not_found", issues);
  return issues;
}

async function checkInvalidSlugs(dispatch: CatalogApiDispatch): Promise<Issues> {
  const issues: Issues = [];
  for (const slug of INVALID_SLUGS) {
    const path = productPath(slug);
    checkError(await call(dispatch, path), path, 400, "invalid_request", issues);
  }
  return issues;
}

async function checkDetailQuery(dispatch: CatalogApiDispatch): Promise<Issues> {
  const issues: Issues = [];
  const [slug] = listedSlugs(
    await readAllProducts(dispatch, DEFAULT_PRODUCT_PAGE_SIZE, []),
  );
  if (slug === undefined) {
    return issues;
  }
  for (const query of ["?page=1", "?include=variants"]) {
    const path = productPath(slug, query);
    checkError(await call(dispatch, path), path, 400, "invalid_request", issues);
  }
  return issues;
}

export const catalogApiContractChecks: readonly CatalogContractCheck[] = [
  {
    id: "catalog.non-empty",
    name: "exposes at least one category and one product (precondition for detail checks)",
    run: checkNonEmpty,
  },
  {
    id: "categories.tree",
    name: "GET /api/categories returns 200 { data } with valid, uniquely identified recursive roots",
    run: checkCategories,
  },
  {
    id: "categories.deterministic",
    name: "GET /api/categories returns the same tree in the same order on repeated reads",
    run: (dispatch) => checkDeterministic(dispatch, "/api/categories"),
  },
  {
    id: "products.defaults",
    name: "GET /api/products defaults to page 1 and pageSize 12",
    run: checkProductDefaults,
  },
  {
    id: "products.pages",
    name: "GET /api/products pages carry valid summaries (no variants) and consistent pagination at any page size",
    run: checkProductPages,
  },
  {
    id: "products.beyond-end",
    name: "GET /api/products beyond the last page is an empty 200 with hasNext false",
    run: checkBeyondEnd,
  },
  {
    id: "products.invalid-query",
    name: "GET /api/products rejects malformed, duplicate, unsafe, and unsupported parameters with 400 invalid_request",
    run: checkInvalidProductQueries,
  },
  {
    id: "products.deterministic",
    name: "GET /api/products returns the same page content and order on repeated reads",
    run: (dispatch) =>
      checkDeterministic(
        dispatch,
        `/api/products?page=${DEFAULT_PRODUCT_PAGE}&pageSize=${SECOND_PAGE_SIZE}`,
      ),
  },
  {
    id: "detail.listed",
    name: "GET /api/products/{slug} returns 200 { data: Product } for every listed slug, matching its summary",
    run: checkListedDetails,
  },
  {
    id: "detail.unknown",
    name: "GET /api/products/{slug} returns 404 not_found for a well-formed unknown slug",
    run: checkUnknownSlug,
  },
  {
    id: "detail.invalid-slug",
    name: "GET /api/products/{slug} returns 400 invalid_request for invalid slug syntax",
    run: checkInvalidSlugs,
  },
  {
    id: "detail.unsupported-query",
    name: "GET /api/products/{slug} returns 400 invalid_request for any query parameter",
    run: checkDetailQuery,
  },
];

/** Registers one Vitest test per contract check for the supplied dispatch. */
export function describeCatalogApiContract(
  label: string,
  getDispatch: () => CatalogApiDispatch,
): void {
  describe(`catalog API contract: ${label}`, () => {
    for (const check of catalogApiContractChecks) {
      it(check.name, async () => {
        expect(await check.run(getDispatch())).toEqual([]);
      });
    }
  });
}
