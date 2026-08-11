import { describe, expect, it } from "vitest";
import { buildHomeMetadata } from "./home-metadata";

describe("buildHomeMetadata", () => {
  it("builds a unique homepage title, description, and canonical path", () => {
    const meta = buildHomeMetadata();

    expect(meta.title).toBe("Mini Mystiq | Baby Clothes & Toys");
    expect(meta.description).toContain("baby and children's clothing");
    expect(meta.canonicalPath).toBe("/");
    expect(meta.canonicalPath).not.toContain("?");
    expect(meta.image.src).toBe(
      "/baby-sleeveless-sets-new-collection-banner.jpg",
    );
  });
});
