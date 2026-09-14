import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const navigationSource = readFileSync(
  path.join(import.meta.dirname, "catalog-navigation.tsx"),
  "utf8",
);
const shellSource = readFileSync(
  path.join(import.meta.dirname, "storefront-shell.tsx"),
  "utf8",
);

describe("catalog navigation presentation contract", () => {
  it("renders separate mobile and tablet/desktop navigation treatments", () => {
    expect(navigationSource).toContain("md:hidden");
    expect(navigationSource).toContain("hidden min-h-13 w-full");
    expect(navigationSource).toContain("md:flex");
    expect(shellSource).toContain("<MobileCatalogNavigation");
    expect(shellSource).toContain("<DesktopCatalogNavigation");
  });

  it("uses semantic disclosures, links, and Escape close behavior", () => {
    expect(navigationSource).toContain("<nav");
    expect(navigationSource).toContain("<details");
    expect(navigationSource).toContain("<summary");
    expect(navigationSource).toContain('event.key !== "Escape"');
    expect(navigationSource).toContain("details.open = false");
    expect(navigationSource).toContain("<Link");
  });

  it("does not hardcode customer category names in presentation", () => {
    const taxonomyLabels = [
      "Baby Essentials",
      "Infants",
      "Baby Girl",
      "Baby Boy",
      "Frock",
      "Women",
      "Boutique",
    ];

    for (const label of taxonomyLabels) {
      expect(navigationSource).not.toContain(label);
      expect(shellSource).not.toContain(label);
    }
  });

  it("labels non-functional store tools without creating fake routes", () => {
    expect(navigationSource).toContain('aria-disabled="true"');
    expect(navigationSource).toContain("(coming soon)");
    expect(navigationSource).not.toContain('href="/cart"');
    expect(navigationSource).not.toContain('href="/account"');
    expect(navigationSource).not.toContain('href="/track');
  });

  it("refines mega-menu panels without hardcoding taxonomy", () => {
    expect(navigationSource).toContain("absolute inset-x-0 top-full");
    expect(navigationSource).toContain("Explore the collection");
    expect(navigationSource).toContain("View all {item.label}");
    expect(navigationSource).toContain("lg:grid-cols-3");
    expect(navigationSource).toContain("duration-[var(--mm-duration)]");
  });
});
