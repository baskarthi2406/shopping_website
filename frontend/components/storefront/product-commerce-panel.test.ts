import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ProductCommercePanel,
  type ProductCommercePanelProps,
} from "./product-commerce-panel";

// Synthetic view models only.
const TELEPHONE = "090257 99377";

const render = (commerce: ProductCommercePanelProps["commerce"]) =>
  renderToStaticMarkup(createElement(ProductCommercePanel, { commerce, telephone: TELEPHONE }));

const unpriced: ProductCommercePanelProps["commerce"] = {
  price: null,
  compareAtPrice: null,
  priceMessage: "Price not available",
  availability: "unconfirmed",
  availabilityMessage: "Availability not confirmed",
};

describe("ProductCommercePanel", () => {
  it("renders the missing-price state without amounts or purchase controls", () => {
    const html = render(unpriced);
    expect(html).toContain("Price not available");
    expect(html).toContain("Availability not confirmed");
    expect(html).not.toMatch(/₹|\b0(\.00)?\b|free|in stock/i);
    expect(html).not.toMatch(/<button|<form|add to cart|buy now|checkout/i);
  });

  it("links to the verified store phone with an accessible name", () => {
    const html = render(unpriced);
    expect(html).toContain('href="tel:09025799377"');
    expect(html).toMatch(/<a [^>]*href="tel:09025799377"[^>]*>Call 090257 99377<\/a>/);
  });

  it("labels the section and announces price context to screen readers", () => {
    const html = render({
      price: "₹1,299.00",
      compareAtPrice: "₹1,599.00",
      priceMessage: null,
      availability: null,
      availabilityMessage: null,
    });
    expect(html).toContain('aria-labelledby="product-commerce-heading"');
    expect(html).toContain('id="product-commerce-heading"');
    expect(html).toContain("Price: </span>₹1,299.00");
    expect(html).toContain("Original price: </span>₹1,599.00");
  });

  it("shows no unavailable message for a purchasable product", () => {
    const html = render({
      price: "₹1,299.00",
      compareAtPrice: null,
      priceMessage: null,
      availability: null,
      availabilityMessage: null,
    });
    expect(html).not.toMatch(/not available|not confirmed|out of stock/i);
  });

  it("shows an explicit out-of-stock message", () => {
    const html = render({ ...unpriced, availability: "out_of_stock", availabilityMessage: "Out of stock" });
    expect(html).toContain("Out of stock");
  });

  it("stays mobile-first with tap-sized contact and no client code", () => {
    const source = readFileSync(new URL("./product-commerce-panel.tsx", import.meta.url), "utf8");
    expect(source).not.toContain("use client");
    expect(source).toContain("min-h-[var(--mm-tap-min)]");
    expect(source).toMatch(/px-4 py-4 sm:px-5/);
    expect(source).not.toMatch(/@\/application|@\/config|@\/infrastructure/);
  });

  it("is wired into the PDP without changing product structured data", () => {
    const page = readFileSync(new URL("../../app/p/[slug]/page.tsx", import.meta.url), "utf8");
    expect(page).toContain("toProductCommerceViewModel(data.product, { priceDisplay })");
    expect(page).toContain("telephone: organization.telephone");
    expect(page).toContain("buildProductStructuredData(view, toAbsoluteUrl)");
    const detail = readFileSync(new URL("./product-detail.tsx", import.meta.url), "utf8");
    expect(detail).toContain("<ProductCommercePanel {...commerce} />");
  });
});
