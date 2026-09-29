import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ProductPurchaseOptions,
  type ProductPurchaseOptionsProps,
} from "./product-purchase-options";

// Synthetic view models only.
const props: ProductPurchaseOptionsProps = {
  selector: {
    groups: [
      { key: "option", label: "Option", values: ["A", "B"] },
      { key: "finish", label: "Finish", values: ["One"] },
    ],
    variants: [
      { id: "a-1", values: { option: "A", finish: "One" } },
      { id: "b-1", values: { option: "B", finish: "One" } },
    ],
  },
  commerce: {
    price: null,
    compareAtPrice: null,
    priceMessage: "Price not available",
    availability: "unconfirmed",
    availabilityMessage: "Availability not confirmed",
  },
  commerceByVariant: {
    "a-1": {
      price: "₹500.00",
      compareAtPrice: null,
      priceMessage: null,
      availability: null,
      availabilityMessage: null,
    },
  },
  telephone: "090257 99377",
};

const html = renderToStaticMarkup(createElement(ProductPurchaseOptions, props));
const source = readFileSync(new URL("./product-purchase-options.tsx", import.meta.url), "utf8");

describe("ProductPurchaseOptions", () => {
  it("renders one labelled native radio group per option", () => {
    expect(html.match(/<fieldset/g)).toHaveLength(2);
    expect(html).toContain(">Option</legend>");
    expect(html).toContain(">Finish</legend>");
    expect(html.match(/type="radio"/g)).toHaveLength(3);
    for (const match of html.matchAll(/<input id="([^"]+)"/g)) {
      expect(html).toContain(`for="${match[1]}"`);
    }
  });

  it("groups radios by option so arrow keys move within a group", () => {
    const names = [...html.matchAll(/<input [^>]*name="([^"]+)"/g)].map((m) => m[1]);
    expect(names).toHaveLength(3);
    expect(new Set(names).size).toBe(2);
    expect(names[0]).toBe(names[1]);
  });

  it("starts with no selection, a prompt, and the blocked commerce state", () => {
    expect(html).not.toMatch(/<input [^>]*checked/);
    expect(html).toContain("Select Option, Finish");
    expect(html).toContain("Price not available");
    expect(html).not.toContain("₹500.00");
    expect(html).toContain('href="tel:09025799377"');
  });

  it("announces selection and commerce changes politely", () => {
    expect(html.match(/aria-live="polite"/g)).toHaveLength(2);
  });

  it("shows selected and keyboard focus states on the visible option", () => {
    expect(source).toContain('className="peer sr-only"');
    expect(source).toContain("peer-checked:bg-primary");
    expect(source).toContain("peer-focus-visible:outline-focus");
    expect(source).toContain("min-h-[var(--mm-tap-min)]");
    expect(source).toContain("flex flex-wrap");
  });

  it("switches only between precomputed view models", () => {
    expect(source).toContain('"use client"');
    expect(source).toContain("@/application/catalog/variant-selection");
    expect(source).not.toMatch(/evaluatePurchasability|Intl\.|localStorage|sessionStorage|fetch\(/);
    expect(source).toContain("commerceByVariant[result.variantId] ?? commerce");
  });

  it("renders only for products with a selector and keeps the plain panel otherwise", () => {
    const detail = readFileSync(new URL("./product-detail.tsx", import.meta.url), "utf8");
    expect(detail).toContain("commerce && variantOptions ?");
    expect(detail).toContain("<ProductCommercePanel {...commerce} />");
    const page = readFileSync(new URL("../../app/p/[slug]/page.tsx", import.meta.url), "utf8");
    expect(page).toContain("variantOptions={selector ? { selector, commerceByVariant } : null}");
  });
});
