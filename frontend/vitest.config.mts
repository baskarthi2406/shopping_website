import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: [
      "node_modules/**",
      ".next/**",
      ".boundary-fixtures/**",
      "**/*.http.test.ts",
      "**/*.build.test.ts",
    ],
  },
  resolve: {
    alias: {
      "@": root,
      // Unit tests run as server code. Next.js resolves `server-only` to this
      // same empty module for server bundles and to a throwing module for
      // client bundles; that client rejection is verified by
      // `npm run test:boundary`, not here.
      "server-only": require.resolve("next/dist/compiled/server-only/empty.js"),
    },
  },
});
