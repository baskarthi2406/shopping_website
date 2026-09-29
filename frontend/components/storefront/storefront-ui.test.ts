import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const cardSource = readFileSync(
  path.join(import.meta.dirname, "product-card.tsx"),
  "utf8",
);
const tokens = readFileSync(
  path.join(import.meta.dirname, "../../app/globals.css"),
  "utf8",
);
const fonts = readFileSync(
  path.join(import.meta.dirname, "../../app/fonts.ts"),
  "utf8",
);

describe("classic-modern storefront presentation", () => {
  it("extends tokens without scattering hex in product cards", () => {
    expect(tokens).toContain("--mm-color-secondary");
    expect(tokens).toContain("--mm-color-accent");
    expect(tokens).toContain("--mm-type-display");
    expect(tokens).toContain("--mm-duration: 180ms");
    expect(tokens).toContain(".mm-btn-primary");
    expect(tokens).toContain("prefers-reduced-motion");
    expect(cardSource).not.toMatch(/#[0-9a-fA-F]{3,8}/);
  });

  it("self-hosts display and UI fonts through Next.js", () => {
    expect(fonts).toContain("next/font/google");
    expect(fonts).toContain("Source_Sans_3");
    expect(fonts).toContain("Cormorant_Garamond");
    expect(fonts).toContain('display: "swap"');
  });

  it("does not invent commerce data on product cards", () => {
    expect(cardSource).not.toMatch(/\b(price|sku|inventory|stock|₹|INR)\b/i);
    expect(cardSource).toContain("mm-hover-zoom");
  });
});
