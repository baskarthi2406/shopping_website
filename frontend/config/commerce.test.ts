import { describe, expect, it } from "vitest";
import { priceDisplayFor } from "./commerce";
import { ZOHO_CATALOG_DEMO_PRICE_DISPLAY } from "./zoho-catalog";

describe("priceDisplayFor", () => {
  it("shows the verified INR selling price for the normal snapshot and the demo source", () => {
    expect(priceDisplayFor("zoho-snapshot")).toEqual(ZOHO_CATALOG_DEMO_PRICE_DISPLAY);
    expect(priceDisplayFor("zoho-demo")).toEqual(ZOHO_CATALOG_DEMO_PRICE_DISPLAY);
    expect(ZOHO_CATALOG_DEMO_PRICE_DISPLAY).toEqual({ locale: "en-IN", currencies: ["INR"] });
  });

  it("keeps the static fixture catalog unpriced", () => {
    expect(priceDisplayFor("static")).toBeNull();
  });
});
