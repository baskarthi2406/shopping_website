import type { Inventory } from "./inventory";
import type { Money, Pricing } from "./pricing";
import type { Product } from "./product";
import type { ProductVariant, VariantAttribute } from "./product-variant";
import { isCatalogSlug } from "./slug";

export type ContractViolation = {
  readonly path: string;
  readonly message: string;
};

const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

function add(
  issues: ContractViolation[],
  path: string,
  message: string,
): void {
  issues.push({ path, message });
}

function isPresent(value: string): boolean {
  return value.trim().length > 0;
}

function validateOptionalIdentifier(
  value: string | null,
  path: string,
  issues: ContractViolation[],
): void {
  if (value !== null && !isPresent(value)) {
    add(issues, path, "must be null or a non-empty value");
  }
}

export function validateMoney(
  money: Money,
  path = "money",
): readonly ContractViolation[] {
  const issues: ContractViolation[] = [];

  if (!Number.isFinite(money.amount) || money.amount < 0) {
    add(issues, `${path}.amount`, "must be a finite, non-negative number");
  }

  if (!CURRENCY_CODE_PATTERN.test(money.currency)) {
    add(issues, `${path}.currency`, "must be a three-letter uppercase code");
  }

  return issues;
}

export function validatePricing(
  pricing: Pricing,
  path = "pricing",
): readonly ContractViolation[] {
  const issues: ContractViolation[] = [];
  issues.push(...validateMoney(pricing.price, `${path}.price`));

  if (pricing.compareAtPrice !== null) {
    issues.push(
      ...validateMoney(pricing.compareAtPrice, `${path}.compareAtPrice`),
    );
    if (pricing.compareAtPrice.currency !== pricing.price.currency) {
      add(
        issues,
        `${path}.compareAtPrice.currency`,
        "must match the current price currency",
      );
    }
    if (
      Number.isFinite(pricing.price.amount) &&
      pricing.price.amount >= 0 &&
      Number.isFinite(pricing.compareAtPrice.amount) &&
      pricing.compareAtPrice.amount >= 0 &&
      pricing.compareAtPrice.amount < pricing.price.amount
    ) {
      add(
        issues,
        `${path}.compareAtPrice.amount`,
        "must not be less than the current price",
      );
    }
  }

  return issues;
}

export function validateInventory(
  inventory: Inventory,
  path = "inventory",
): readonly ContractViolation[] {
  const issues: ContractViolation[] = [];
  const quantities = [
    ["stockOnHand", inventory.stockOnHand],
    ["availableToSell", inventory.availableToSell],
    ["reserved", inventory.reserved],
  ] as const;

  for (const [name, value] of quantities) {
    if (value !== null && (!Number.isInteger(value) || value < 0)) {
      add(
        issues,
        `${path}.${name}`,
        "must be null or a finite, non-negative integer",
      );
    }
  }

  const { stockOnHand, availableToSell, reserved } = inventory;
  const knownQuantitiesAreValid =
    (stockOnHand === null || (Number.isInteger(stockOnHand) && stockOnHand >= 0)) &&
    (availableToSell === null ||
      (Number.isInteger(availableToSell) && availableToSell >= 0)) &&
    (reserved === null || (Number.isInteger(reserved) && reserved >= 0));

  if (knownQuantitiesAreValid) {
    if (reserved !== null && stockOnHand !== null && reserved > stockOnHand) {
      add(issues, `${path}.reserved`, "must not exceed stockOnHand");
    }
    if (
      availableToSell !== null &&
      stockOnHand !== null &&
      availableToSell > stockOnHand
    ) {
      add(issues, `${path}.availableToSell`, "must not exceed stockOnHand");
    }
    if (
      availableToSell !== null &&
      reserved !== null &&
      stockOnHand !== null &&
      availableToSell + reserved > stockOnHand
    ) {
      add(
        issues,
        `${path}.availableToSell`,
        "plus reserved must not exceed stockOnHand",
      );
    }

    const knownSellable = availableToSell ?? stockOnHand;
    if (knownSellable === 0 && inventory.status === "in_stock") {
      add(
        issues,
        `${path}.status`,
        "must not be in_stock when available quantity is 0",
      );
    }
    if (knownSellable !== null && knownSellable > 0 && inventory.status === "out_of_stock") {
      add(
        issues,
        `${path}.status`,
        "must not be out_of_stock when available quantity is greater than 0",
      );
    }
  }

  return issues;
}

function normalizeAttributeName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Stable signature for a variant's option set. Attribute order does not matter;
 * names are compared case-insensitively after trim.
 */
export function variantAttributeSignature(
  attributes: readonly VariantAttribute[],
): string {
  return attributes
    .map(
      (attribute) =>
        `${normalizeAttributeName(attribute.name)}=${attribute.value.trim()}`,
    )
    .sort()
    .join("|");
}

export function validateVariant(
  variant: ProductVariant,
  path = "variant",
): readonly ContractViolation[] {
  const issues: ContractViolation[] = [];

  if (!isPresent(variant.id)) {
    add(issues, `${path}.id`, "must be non-empty");
  }
  validateOptionalIdentifier(variant.sku, `${path}.sku`, issues);

  const attributeNames = new Set<string>();
  variant.attributes.forEach((attribute, index) => {
    const attributePath = `${path}.attributes[${index}]`;
    const normalizedName = normalizeAttributeName(attribute.name);

    if (!isPresent(attribute.name)) {
      add(issues, `${attributePath}.name`, "must be non-empty");
    } else if (attributeNames.has(normalizedName)) {
      add(issues, `${attributePath}.name`, "must be unique within the variant");
    } else {
      attributeNames.add(normalizedName);
    }

    if (!isPresent(attribute.value)) {
      add(issues, `${attributePath}.value`, "must be non-empty");
    }
  });

  if (variant.pricing !== null) {
    issues.push(...validatePricing(variant.pricing, `${path}.pricing`));
  }
  if (variant.inventory !== null) {
    issues.push(...validateInventory(variant.inventory, `${path}.inventory`));
  }

  return issues;
}

export function validateProduct(
  product: Product,
  path = "product",
): readonly ContractViolation[] {
  const issues: ContractViolation[] = [];

  if (!isPresent(product.id)) {
    add(issues, `${path}.id`, "must be non-empty");
  }
  if (!isCatalogSlug(product.slug)) {
    add(issues, `${path}.slug`, "must be a valid catalog slug");
  }
  if (!isPresent(product.name)) {
    add(issues, `${path}.name`, "must be non-empty");
  }

  validateOptionalIdentifier(product.sku, `${path}.sku`, issues);

  const categoryIds = new Set<string>();
  product.categoryIds.forEach((categoryId, index) => {
    if (!isPresent(categoryId)) {
      add(issues, `${path}.categoryIds[${index}]`, "must be non-empty");
    } else if (categoryIds.has(categoryId)) {
      add(issues, `${path}.categoryIds[${index}]`, "must be unique");
    } else {
      categoryIds.add(categoryId);
    }
  });

  if (product.uom !== null) {
    if (!isPresent(product.uom.code)) {
      add(issues, `${path}.uom.code`, "must be non-empty");
    }
    if (!isPresent(product.uom.label)) {
      add(issues, `${path}.uom.label`, "must be non-empty");
    }
  }
  if (product.pricing !== null) {
    issues.push(...validatePricing(product.pricing, `${path}.pricing`));
  }
  if (product.inventory !== null) {
    issues.push(...validateInventory(product.inventory, `${path}.inventory`));
  }

  const variantIds = new Set<string>();
  const combinationKeys = new Set<string>();
  product.variants.forEach((variant, index) => {
    const variantPath = `${path}.variants[${index}]`;
    if (variantIds.has(variant.id)) {
      add(issues, `${variantPath}.id`, "must be unique within the product");
    } else {
      variantIds.add(variant.id);
    }

    const signature = variantAttributeSignature(variant.attributes);
    if (combinationKeys.has(signature)) {
      add(
        issues,
        `${variantPath}.attributes`,
        "must be a unique attribute combination within the product",
      );
    } else {
      combinationKeys.add(signature);
    }

    issues.push(...validateVariant(variant, variantPath));
  });

  return issues;
}

export function validateProductCatalog(
  products: readonly Product[],
): readonly ContractViolation[] {
  const issues: ContractViolation[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();

  products.forEach((product, index) => {
    const path = `products[${index}]`;
    if (ids.has(product.id)) {
      add(issues, `${path}.id`, "must be unique within the catalog");
    } else {
      ids.add(product.id);
    }
    if (slugs.has(product.slug)) {
      add(issues, `${path}.slug`, "must be unique within the catalog");
    } else {
      slugs.add(product.slug);
    }
    issues.push(...validateProduct(product, path));
  });

  return issues;
}
