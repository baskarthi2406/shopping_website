import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

/**
 * Production-build boundary checks (S6-T11). Runs real `next build` for the
 * app and isolated fixtures; run with `npm run test:boundary`.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.build.test.ts"],
    exclude: ["node_modules/**", ".next/**", ".boundary-fixtures/**"],
    testTimeout: 300_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": root,
    },
  },
});
