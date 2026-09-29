import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { readServerEnv } from "./server-env";

const SYNTHETIC_NAME = "S6T11_SYNTHETIC_SECRET";
const SYNTHETIC_VALUE = "s6t11-synthetic-unit-marker";

describe("readServerEnv", () => {
  it("reads a synthetic server-only value in a server test context", () => {
    expect(
      readServerEnv(SYNTHETIC_NAME, { [SYNTHETIC_NAME]: SYNTHETIC_VALUE }),
    ).toBe(SYNTHETIC_VALUE);
  });

  it("returns null for unset or blank values", () => {
    expect(readServerEnv(SYNTHETIC_NAME, {})).toBeNull();
    expect(readServerEnv(SYNTHETIC_NAME, { [SYNTHETIC_NAME]: "  " })).toBeNull();
  });

  it("rejects public and malformed names without echoing values", () => {
    const env = { NEXT_PUBLIC_S6T11: SYNTHETIC_VALUE, "bad-name": SYNTHETIC_VALUE };

    for (const name of ["NEXT_PUBLIC_S6T11", "bad-name", ""]) {
      let message = "";
      try {
        readServerEnv(name, env);
      } catch (error) {
        message = (error as Error).message;
      }
      expect(message).toMatch(/^Invalid server-only environment variable name/);
      expect(message).not.toContain(SYNTHETIC_VALUE);
    }
  });

  it("is marked server-only", () => {
    const source = readFileSync(new URL("./server-env.ts", import.meta.url), "utf8");
    expect(source.startsWith('import "server-only";')).toBe(true);
  });
});
