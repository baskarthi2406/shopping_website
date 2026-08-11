import { describe, expect, it } from "vitest";
import { StaticUomRepository } from "./static-uom-repository";

describe("StaticUomRepository", () => {
  const uoms = new StaticUomRepository();

  it("lists no UOMs until codes are decided", async () => {
    await expect(uoms.list()).resolves.toEqual([]);
  });

  it("returns null for an unknown code", async () => {
    await expect(uoms.getByCode("each")).resolves.toBeNull();
  });
});
