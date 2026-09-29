import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Production HTTP status regression (S4-F01). Runs `next start` against the
 * existing `.next` production build and asserts real response status codes.
 * Requires `npm run build` first; run with `npm run test:http`.
 */

const frontendRoot = path.resolve(import.meta.dirname, "..");
const nextBin = path.join(frontendRoot, "node_modules/next/dist/bin/next");

const USER_AGENTS = {
  browser:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
  googlebot:
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
} as const;

const EXISTING_PATHS = [
  "/",
  "/c/baby-essentials",
  "/c/infants",
  "/c/infants-baby-girl-frock",
  "/p/pink-white-pleated-baby-dress",
] as const;

const MISSING_PATHS = [
  "/c/does-not-exist",
  "/p/does-not-exist",
  "/c/Bad_Slug",
] as const;

let server: ChildProcess | null = null;
let baseUrl = "";

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      probe.close(() => {
        if (address && typeof address === "object") {
          resolve(address.port);
        } else {
          reject(new Error("Could not allocate a port"));
        }
      });
    });
  });
}

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${url}/robots.txt`);
      if (response.ok) {
        return;
      }
    } catch {
      // Server not accepting connections yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`next start did not become ready at ${url}`);
}

async function request(pathname: string, userAgent: string) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    headers: { "user-agent": userAgent },
    redirect: "manual",
  });
  return { status: response.status, body: await response.text() };
}

beforeAll(async () => {
  if (!existsSync(path.join(frontendRoot, ".next/BUILD_ID"))) {
    throw new Error("Production build missing. Run `npm run build` first.");
  }

  const port = await freePort();
  baseUrl = `http://127.0.0.1:${port}`;
  server = spawn(
    process.execPath,
    [nextBin, "start", "--port", String(port), "--hostname", "127.0.0.1"],
    { cwd: frontendRoot, stdio: "ignore" },
  );
  await waitForServer(baseUrl, 60_000);
}, 90_000);

afterAll(() => {
  server?.kill();
});

describe.each(Object.entries(USER_AGENTS))(
  "production HTTP status for %s user agent",
  (_label, userAgent) => {
    it.each(EXISTING_PATHS)("returns 200 for existing %s", async (pathname) => {
      const { status, body } = await request(pathname, userAgent);

      expect(status).toBe(200);
      expect(body).not.toContain("<title>Page not found");
      expect(body).not.toMatch(/<meta name="robots" content="noindex/);
    });

    it.each(MISSING_PATHS)(
      "returns 404 with the not-found page for missing %s",
      async (pathname) => {
        const { status, body } = await request(pathname, userAgent);

        expect(status).toBe(404);
        expect(body).toContain("<title>Page not found");
        expect(body).toMatch(/<meta name="robots" content="noindex/);
        expect(body).not.toContain('"@type":"Product"');
        expect(body).not.toContain('"@type":"BreadcrumbList"');
      },
    );
  },
);
