import { describe, expect, it } from "vitest";
import { CATALOG_UNAVAILABLE_MESSAGE } from "./catalog-messages";

describe("catalog messages", () => {
  it("exposes a public catalog failure message without internals", () => {
    expect(CATALOG_UNAVAILABLE_MESSAGE).toBe(
      "Catalog is temporarily unavailable",
    );
    expect(CATALOG_UNAVAILABLE_MESSAGE).not.toMatch(
      /stack|repository|zoho|path/i,
    );
  });
});
