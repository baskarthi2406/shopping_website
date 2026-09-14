import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { organization } from "@/config/organization";
import { STOREFRONT_SERVICE_CLAIMS } from "./storefront-service-claims";
import { toTelHref } from "./to-tel-href";

const footerSource = readFileSync(
  path.join(import.meta.dirname, "storefront-footer.tsx"),
  "utf8",
);
const shellSource = readFileSync(
  path.join(import.meta.dirname, "storefront-shell.tsx"),
  "utf8",
);
const layoutSource = readFileSync(
  path.join(import.meta.dirname, "../../app/layout.tsx"),
  "utf8",
);

describe("storefront footer", () => {
  it("builds a tel: link from the configured phone number", () => {
    expect(toTelHref(organization.telephone)).toBe("tel:09025799377");
    expect(footerSource).toContain("toTelHref");
    expect(footerSource).toContain("href={telephoneHref}");
    expect(footerSource).toContain("{contact.telephone}");
  });

  it("renders category columns from supplied props rather than hardcoded taxonomy", () => {
    const taxonomyLabels = [
      "Baby Essentials",
      "Infants",
      "Kids",
      "Teens",
      "Women",
      "Kid's Wear",
      "Boy's Wear",
      "Girl's Wear",
      "Boutique",
    ];

    for (const label of taxonomyLabels) {
      expect(footerSource).not.toContain(label);
    }

    expect(layoutSource).toContain("toFooterNavViewModel");
    expect(layoutSource).toContain("@/config/catalog-source");
    expect(shellSource).toContain("<StorefrontFooter");
  });

  it("reuses existing service claims and verified contact fields", () => {
    expect(footerSource).toContain("STOREFRONT_SERVICE_CLAIMS");
    expect(STOREFRONT_SERVICE_CLAIMS).toEqual([
      "Free Shipping on Orders above ₹999",
      "Easy Returns",
      "COD Available",
    ]);
    expect(footerSource).toContain("streetAddress");
    expect(footerSource).toContain("lg:grid-cols-4");
    expect(footerSource).toContain("min-h-[var(--mm-tap-min)]");
  });

  it("keeps semantic footer structure without fake routes or invented contact channels", () => {
    expect(footerSource).toContain("<footer");
    expect(footerSource).toContain('<nav aria-label="Shop">');
    expect(footerSource).toContain('<nav aria-label="Collections">');
    expect(footerSource).toContain("<address");
    expect(footerSource).toContain("<h2");
    expect(footerSource).not.toContain('href="/faq"');
    expect(footerSource).not.toContain('href="/returns"');
    expect(footerSource).not.toContain('href="/shipping"');
    expect(footerSource).not.toContain('href="/privacy"');
    expect(footerSource).not.toContain('href="/terms"');
    expect(footerSource).not.toContain('href="/contact"');
    expect(footerSource).not.toContain('href="/track');
    expect(footerSource).not.toContain("mailto:");
    expect(footerSource).not.toContain("facebook.com");
    expect(footerSource).not.toContain("instagram.com");
  });
});
