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
    expect(meta.image.alt).toBe(
      "Sage and dusty rose baby sleeveless top and shorts sets",
    );
    expect(meta.image.src).not.toMatch(/logo|hiring|pigeon|character/);
  });

  it("does not invent promotional claims", () => {
    const meta = buildHomeMetadata();
    const combined = `${meta.title} ${meta.description}`;

    expect(combined).not.toMatch(
      /\b(best|cheap|cheapest|online|buy|premium|organic|handmade|designer|luxury|guaranteed|free delivery|COD|easy returns|lowest prices)\b/i,
    );
  });
});
