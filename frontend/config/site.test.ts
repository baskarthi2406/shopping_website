import { describe, expect, it } from "vitest";
import {
  getMetadataBase,
  parseSiteOrigin,
  resolveSiteOrigin,
  toAbsoluteSiteUrl,
} from "./site";

describe("parseSiteOrigin", () => {
  it("accepts an absolute https origin and strips a trailing slash", () => {
    expect(parseSiteOrigin("https://store.example:8443/").origin).toBe(
      "https://store.example:8443",
    );
  });

  it("rejects relative values, queries, paths, and non-http schemes", () => {
    expect(() => parseSiteOrigin("store.example")).toThrow(/absolute URL/);
    expect(() => parseSiteOrigin("https://store.example/?ref=1")).toThrow(
      /query or hash/,
    );
    expect(() => parseSiteOrigin("https://store.example/shop")).toThrow(
      /must not include a path/,
    );
    expect(() => parseSiteOrigin("ftp://store.example")).toThrow(/http or https/);
  });
});

describe("resolveSiteOrigin", () => {
  it("uses NEXT_PUBLIC_SITE_URL when set", () => {
    const origin = resolveSiteOrigin({
      NEXT_PUBLIC_SITE_URL: "https://store.example/",
    });

    expect(origin.href).toBe("https://store.example");
    expect(origin.fromEnv).toBe(true);
    expect(origin.href).not.toContain("localhost");
  });

  it("falls back to localhost only when the env is unset and this is not hosted production", () => {
    const origin = resolveSiteOrigin({ NODE_ENV: "development" });

    expect(origin.href).toBe("http://localhost:3000");
    expect(origin.fromEnv).toBe(false);
  });

  it("allows a localhost fallback during a local production build", () => {
    const origin = resolveSiteOrigin({ NODE_ENV: "production" });

    expect(origin.fromEnv).toBe(false);
    expect(origin.href).toBe("http://localhost:3000");
  });

  it("treats a blank env value as unset", () => {
    const origin = resolveSiteOrigin({ NEXT_PUBLIC_SITE_URL: "  " });

    expect(origin.fromEnv).toBe(false);
    expect(origin.href).toBe("http://localhost:3000");
  });

  it("refuses localhost as the origin on hosted production", () => {
    expect(() =>
      resolveSiteOrigin({
        VERCEL_ENV: "production",
        NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      }),
    ).toThrow(/must not be localhost/);
  });

  it("requires the env on hosted production when missing", () => {
    expect(() =>
      resolveSiteOrigin({
        VERCEL_ENV: "production",
      }),
    ).toThrow(/must be set/);
  });
});

describe("toAbsoluteSiteUrl", () => {
  const origin = resolveSiteOrigin({
    NEXT_PUBLIC_SITE_URL: "https://store.example",
  });

  it("joins homepage, category, and product paths without query parameters", () => {
    expect(toAbsoluteSiteUrl(origin, "/")).toBe("https://store.example/");
    expect(toAbsoluteSiteUrl(origin, "/c/baby-essentials")).toBe(
      "https://store.example/c/baby-essentials",
    );
    expect(toAbsoluteSiteUrl(origin, "/p/pink-white-pleated-baby-dress")).toBe(
      "https://store.example/p/pink-white-pleated-baby-dress",
    );
  });

  it("joins OpenGraph image paths against the configured origin", () => {
    expect(
      toAbsoluteSiteUrl(
        origin,
        "/baby-sleeveless-sets-new-collection-banner.jpg",
      ),
    ).toBe(
      "https://store.example/baby-sleeveless-sets-new-collection-banner.jpg",
    );
    expect(
      toAbsoluteSiteUrl(origin, "/kids-striped-shirts-burgundy-and-sage.jpg"),
    ).toBe("https://store.example/kids-striped-shirts-burgundy-and-sage.jpg");
    expect(
      toAbsoluteSiteUrl(origin, "/pink-white-pleated-baby-dress.jpg"),
    ).toBe("https://store.example/pink-white-pleated-baby-dress.jpg");
  });

  it("rejects query parameters in canonical paths", () => {
    expect(() => toAbsoluteSiteUrl(origin, "/c/kids?sort=name")).toThrow(
      /query or hash/,
    );
  });
});

describe("getMetadataBase", () => {
  it("returns the same origin used for canonical URLs", () => {
    const env = { NEXT_PUBLIC_SITE_URL: "https://store.example" };

    expect(getMetadataBase(env).href).toBe("https://store.example/");
    expect(getMetadataBase(env).origin).toBe(resolveSiteOrigin(env).href);
  });
});
