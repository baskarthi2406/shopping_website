import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CATALOG_UNAVAILABLE_MESSAGE } from "@/application/catalog";

const leakPattern =
  /stack|digest|StaticProductRepository|product-records|zoho|item_id|stock_on_hand|TypeError|ECONNREFUSED/i;

describe("storefront catalog status presentation", () => {
  const unavailable = readFileSync(
    new URL("./catalog-unavailable.tsx", import.meta.url),
    "utf8",
  );
  const empty = readFileSync(
    new URL("./catalog-empty-state.tsx", import.meta.url),
    "utf8",
  );
  const loading = readFileSync(
    new URL("./catalog-loading.tsx", import.meta.url),
    "utf8",
  );

  it("shows the public catalog failure message with a retry control", () => {
    expect(unavailable).toContain('"use client"');
    expect(unavailable).toContain("{CATALOG_UNAVAILABLE_MESSAGE}");
    expect(unavailable).toContain("Try again");
    expect(unavailable).toContain("type=\"button\"");
    expect(unavailable).toContain("mm-btn-primary");
    expect(unavailable).not.toMatch(leakPattern);
    expect(unavailable).not.toContain("error.message");
    expect(unavailable).not.toContain("error.stack");
  });

  it("marks empty collections as status, not failures", () => {
    expect(empty).toContain('role="status"');
    expect(empty).not.toContain(CATALOG_UNAVAILABLE_MESSAGE);
    expect(empty).not.toMatch(leakPattern);
  });

  it("uses storefront placeholders without internals or motion", () => {
    expect(loading).toContain('role="status"');
    expect(loading).toContain("Loading catalog");
    expect(loading).toContain("bg-surface-muted");
    expect(loading).not.toContain("animate-spin");
    expect(loading).not.toMatch(leakPattern);
  });
});
