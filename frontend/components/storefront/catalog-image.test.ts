import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: (props: { alt?: string; className?: string }) =>
    createElement("img", { alt: props.alt, className: props.className }),
}));

import { CatalogImage } from "./catalog-image";

describe("CatalogImage", () => {
  it("renders the catalog image with its aspect class", () => {
    const html = renderToStaticMarkup(
      createElement(CatalogImage, {
        src: "/api/catalog-images/11/9001",
        alt: "Girl Coord set",
        sizes: "50vw",
        className: "object-contain",
      }),
    );
    expect(html).toContain('alt="Girl Coord set"');
    expect(html).toContain("object-contain");
    expect(html).not.toMatch(/authorization|access_token|refresh_token|client_secret/i);
  });

  it("drops a failed image instead of showing a provider error", () => {
    const source = readFileSync(new URL("./catalog-image.tsx", import.meta.url), "utf8");
    expect(source).toContain("onError={() => setFailedSrc(src)}");
    expect(source).toContain("return null");
    expect(source).not.toMatch(/zoho|stack|secret/i);
  });
});
