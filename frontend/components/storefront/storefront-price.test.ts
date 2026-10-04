import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductCard } from "./product-card";
import { ProductCommercePanel } from "./product-commerce-panel";
import { StorefrontPrice } from "./storefront-price";

describe("storefront price typography", () => {
  it("keeps a verified amount intact and gives it readable type", () => {
    const html = renderToStaticMarkup(createElement(StorefrontPrice, { amount: "₹359.00", size: "detail" }));
    expect(html).toContain("₹359.00");
    expect(html).toContain("tabular-nums");
    expect(html).toContain("font-semibold");
    expect(html).toContain("text-foreground");
    expect(html).toContain("whitespace-nowrap");
  });

  it("uses the same price type on a product card and leaves mixed prices unchanged", () => {
    const priced = renderToStaticMarkup(
      createElement(ProductCard, {
        href: "/p/girl-coord-set",
        name: "Girl Coord set",
        description: "",
        image: null,
        price: "₹464.00",
        priceMessage: null,
      }),
    );
    expect(priced).toContain("₹464.00");
    expect(priced).toContain("tabular-nums");

    const mixed = renderToStaticMarkup(
      createElement(ProductCard, {
        href: "/p/2pc-kurti",
        name: "2pc kurti",
        description: "",
        image: null,
        price: null,
        priceMessage: "Price not available",
      }),
    );
    expect(mixed).toContain("Price not available");
    expect(mixed).not.toContain("₹");
  });

  it("renders the detail price without changing the amount", () => {
    const html = renderToStaticMarkup(
      createElement(ProductCommercePanel, {
        telephone: "090257 99377",
        commerce: {
          price: "₹359.00",
          compareAtPrice: null,
          priceMessage: null,
          availability: null,
          availabilityMessage: null,
        },
      }),
    );
    expect(html).toContain("Price: </span>₹359.00");
    expect(html).toContain("text-h2");
    expect(html).not.toContain("₹410");
  });
});
