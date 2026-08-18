import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import robots from "./robots";
import { resolveSiteOrigin, toCanonicalUrl } from "@/config/site";

describe("robots", () => {
  it("uses site origin config and does not import catalog data", () => {
    const source = readFileSync(new URL("./robots.ts", import.meta.url), "utf8");

    expect(source).toContain("@/config/site");
    expect(source).not.toMatch(/config\/catalog|product-records|category-records/);
    expect(source).not.toMatch(/minimystiq\.com|example\.com|localhost:3000/);
    expect(source).not.toMatch(/\/cart|\/checkout|\/admin/);
    expect(source).not.toMatch(/\?sort=|\?filter=/);
  });

  it("allows the public storefront and references /sitemap.xml", () => {
    const origin = resolveSiteOrigin();
    const policy = robots();
    const rules = Array.isArray(policy.rules) ? policy.rules[0] : policy.rules;

    expect(rules.userAgent).toBe("*");
    expect(rules.allow).toBe("/");
    expect(rules).not.toHaveProperty("disallow");
    expect(policy.sitemap).toBe(toCanonicalUrl(origin, "/sitemap.xml"));
    expect(policy.sitemap).toBe(`${origin.href}/sitemap.xml`);
    expect(String(policy.sitemap)).toMatch(/\/sitemap\.xml$/);
    expect(String(policy.sitemap)).not.toMatch(/\/c\/|\/p\//);
    expect(policy).not.toHaveProperty("host");
  });
});
