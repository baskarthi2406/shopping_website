import { describe, expect, it } from "vitest";
import { buildNotFoundMetadata } from "./page-metadata";

describe("buildNotFoundMetadata", () => {
  it("returns a not-found title and noindex robots", () => {
    const meta = buildNotFoundMetadata();

    expect(meta.title).toBe("Page not found | Mini Mystiq");
    expect(meta.description).toBe("That page does not exist.");
    expect(meta.robots).toEqual({ index: false, follow: false });
    expect(meta).not.toHaveProperty("canonicalPath");
  });
});
