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
    const tokens = readFileSync(
      path.join(import.meta.dirname, "../../app/globals.css"),
      "utf8",
    );

    expect(navigationSource).toContain("mm-mega-panel");
    expect(navigationSource).toContain("mm-mega-header");
    expect(navigationSource).toContain("Shop by category");
    expect(navigationSource).toContain("Explore the collection");
    expect(navigationSource).toContain("View all {item.label}");
    expect(navigationSource).toContain("lg:grid-cols-3");
    expect(navigationSource).toContain("auto-rows-min");
    expect(navigationSource).toContain("items-start");
    expect(navigationSource).toContain("mm-mega-link");
    expect(navigationSource).toContain("mm-mega-view-all");
    expect(navigationSource).toContain("group-open:z-50");
    expect(navigationSource).toContain("group-open:bg-surface-accent");
    expect(navigationSource).toContain("lg:flex-nowrap");
    expect(navigationSource).toContain("md:hidden");
    expect(tokens).toContain(".mm-mega-panel");
    expect(tokens).toContain(".mm-mega-header");
    expect(tokens).toContain("inset-inline: 0");
    expect(tokens).toContain("max-width: 100%");
    expect(tokens).toContain(".mm-mega-link:focus-visible");
    expect(tokens).toContain(".mm-mega-view-all:focus-visible");
    expect(tokens).toContain("outline: 2px solid var(--mm-color-focus)");
    expect(tokens).toContain("prefers-reduced-motion");
  });
});
