import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

/** Production HTTP checks against `.next`; run after `npm run build`. */
export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.http.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
    testTimeout: 30_000,
    hookTimeout: 90_000,
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": root,
    },
  },
});
