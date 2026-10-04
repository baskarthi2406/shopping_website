import { describe, expect, it } from "vitest";
import type { Product, ProductVariant } from "@/domain/catalog";
import { toDemoProductViewModels } from "./demo-catalog-view-model";

const DISPLAY = { locale: "en-US", currencies: ["XTS"] };

function variant(id: string, overrides: Partial<ProductVariant> = {}): ProductVariant {
  return {
    id,
    sku: `SKU-${id}`,
    attributes: [
      { name: "size", value: "M" },
      { name: "color", value: id },
    ],
    pricing: { price: { amount: 464, currency: "XTS" }, compareAtPrice: null },
    inventory: { stockOnHand: 2, availableToSell: 2, reserved: 0, status: "in_stock" },
    status: "active",
    ...overrides,
  };
}

function product(variants: ProductVariant[]): Product {
  return {
    id: "g1",
    slug: "group-g1",
    name: "Group",
    description: "",
    images: [],
    categoryIds: [],
    sku: null,
    uom: null,
    pricing: null,
    inventory: null,
    status: "active",
    variants,
  };
}

describe("toDemoProductViewModels", () => {
  it("maps each variant with label, SKU, formatted price and stock", () => {
    const [vm] = toDemoProductViewModels([product([variant("Pink")])], DISPLAY);
    expect(vm.name).toBe("Group");
    expect(vm.variants[0]).toMatchObject({
      productId: "g1",
      variantId: "Pink",
      label: "M / Pink",
      sku: "SKU-Pink",
      unitPrice: { amount: 464, currency: "XTS" },
      stockLabel: "In stock (2 available)",
      availableToSell: 2,
      purchasable: true,
    });
    expect(vm.variants[0].price).toContain("464");
  });

  it("blocks out-of-stock, unknown-stock and unpriced variants", () => {
    const [vm] = toDemoProductViewModels(
      [
        product([
          variant("a", { inventory: { stockOnHand: 0, availableToSell: 0, reserved: 0, status: "out_of_stock" } }),
          variant("b", { inventory: { stockOnHand: null, availableToSell: null, reserved: null, status: "unknown" } }),
          variant("c", { pricing: null }),
        ]),
      ],
      DISPLAY,
    );
    expect(vm.variants.map((item) => [item.stockLabel, item.purchasable, item.price])).toEqual([
      ["Out of stock", false, expect.any(String)],
      ["Stock not confirmed", false, expect.any(String)],
      ["In stock (2 available)", false, null],
    ]);
  });

  it("never renders a compare-at price", () => {
    const [vm] = toDemoProductViewModels(
      [product([variant("a", { pricing: { price: { amount: 464, currency: "XTS" }, compareAtPrice: { amount: 490, currency: "XTS" } } })])],
      DISPLAY,
    );
    expect(JSON.stringify(vm)).not.toContain("490");
  });
});
