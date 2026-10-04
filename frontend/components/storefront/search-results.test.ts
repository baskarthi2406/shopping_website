import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ProductCardViewModel } from "@/application/catalog";
import { SearchResults } from "./search-results";

const card: ProductCardViewModel = {
  href: "/p/inskirt-058864",
  name: "Inskirt",
  description: "",
  image: null,
  price: "₹359.00",
  priceMessage: null,
};

describe("SearchResults", () => {
  it("asks for a query before showing products", () => {
    const html = renderToStaticMarkup(createElement(SearchResults, { query: "", products: [card] }));
    expect(html).toContain("Enter a product name to search the catalog.");
    expect(html).not.toContain("/p/inskirt-058864");
  });

  it("links each match to its product page", () => {
    const html = renderToStaticMarkup(createElement(SearchResults, { query: "inskirt", products: [card] }));
    expect(html).toContain('href="/p/inskirt-058864"');
    expect(html).toContain("Inskirt");
    expect(html).toContain("₹359.00");
    expect(html).toContain("tabular-nums");
  });

  it("states when nothing matches", () => {
    const html = renderToStaticMarkup(createElement(SearchResults, { query: "triangle toy", products: [] }));
    expect(html).toContain("No products match “triangle toy”.");
    expect(html).not.toContain("<a ");
  });
});
