import type { Inventory } from "./inventory";
import type { Money, Pricing } from "./pricing";
import type { Product } from "./product";
import type { ProductVariant } from "./product-variant";
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

function validateMoney(
  money: Money,
  path: string,
  issues: ContractViolation[],
): void {
  if (!Number.isFinite(money.amount) || money.amount < 0) {
    add(issues, `${path}.amount`, "must be a finite, non-negative number");
  }

  if (!CURRENCY_CODE_PATTERN.test(money.currency)) {
    add(issues, `${path}.currency`, "must be a three-letter uppercase code");
  }
}

export function validatePricing(
  pricing: Pricing,
  path = "pricing",
): readonly ContractViolation[] {
  const issues: ContractViolation[] = [];
  validateMoney(pricing.price, `${path}.price`, issues);

  if (pricing.compareAtPrice !== null) {
    validateMoney(pricing.compareAtPrice, `${path}.compareAtPrice`, issues);
    if (pricing.compareAtPrice.currency !== pricing.price.currency) {
      add(
        issues,
        `${path}.compareAtPrice.currency`,
        "must match the current price currency",
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
    if (value !== null && (!Number.isFinite(value) || value < 0)) {
      add(
        issues,
        `${path}.${name}`,
        "must be null or a finite, non-negative number",
      );
    }
  }

  return issues;
}

function validateVariant(
  variant: ProductVariant,
  path: string,
): readonly ContractViolation[] {
  const issues: ContractViolation[] = [];

  if (!isPresent(variant.id)) {
    add(issues, `${path}.id`, "must be non-empty");
  }
  validateOptionalIdentifier(variant.sku, `${path}.sku`, issues);

  const attributeNames = new Set<string>();
  variant.attributes.forEach((attribute, index) => {
    const attributePath = `${path}.attributes[${index}]`;
    const normalizedName = attribute.name.trim().toLowerCase();

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
  product.variants.forEach((variant, index) => {
    const variantPath = `${path}.variants[${index}]`;
    if (variantIds.has(variant.id)) {
      add(issues, `${variantPath}.id`, "must be unique within the product");
    } else {
      variantIds.add(variant.id);
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
