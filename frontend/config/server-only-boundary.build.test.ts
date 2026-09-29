import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * S6-T11 production-build verification of the server-only boundary.
 *
 * - Builds the real app with a synthetic, non-public secret and checks that
 *   neither the secret nor server-only literals reach browser-facing output.
 * - Builds an isolated valid fixture whose server-only module reads the
 *   synthetic secret (positive control) and whose client component reads a
 *   NEXT_PUBLIC_ control value (proves the artifact scan sees client code).
 * - Builds isolated invalid fixtures (direct and transitive client imports of a
 *   server-only module) and requires Next.js to reject them.
 *
 * Fixtures live in `.boundary-fixtures/` (inside the project so Turbopack
 * resolves `node_modules` without symlinks) and are deleted afterwards.
 * Synthetic values are random per run and are never printed.
 */

const frontendRoot = path.resolve(import.meta.dirname, "..");
const nextBin = path.join(frontendRoot, "node_modules/next/dist/bin/next");
const fixturesRoot = path.join(frontendRoot, ".boundary-fixtures");

const SECRET_NAME = "S6T11_SYNTHETIC_SECRET";
const PUBLIC_CONTROL_NAME = "NEXT_PUBLIC_S6T11_PUBLIC_CONTROL";
const SERVER_ONLY_ERROR =
  "'server-only' cannot be imported from a Client Component module";

/** String literals that exist only in protected server modules of the app. */
const APP_SERVER_LITERALS = ["http://catalog.local", "Catalog endpoint was not found"];

function syntheticMarker(label: string): string {
  return `s6t11-${label}-${randomBytes(12).toString("hex")}`;
}

const secretValue = syntheticMarker("secret");
const serverMarker = syntheticMarker("server-marker");
const publicControlValue = syntheticMarker("public-control");

function redact(text: string): string {
  return [secretValue, serverMarker, publicControlValue].reduce(
    (result, value) => result.split(value).join("[synthetic]"),
    text,
  );
}

function stripAnsi(text: string): string {
  return text.replace(/\u001b\[[0-9;]*m/g, "");
}

type BuildResult = { status: number | null; output: string };

function nextBuild(projectDir: string | null, env: Record<string, string>): BuildResult {
  const result = spawnSync(
    process.execPath,
    [nextBin, "build", ...(projectDir === null ? [] : [projectDir])],
    {
      cwd: frontendRoot,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", ...env },
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    },
  );
  return {
    status: result.status,
    output: redact(stripAnsi(`${result.stdout ?? ""}\n${result.stderr ?? ""}`)),
  };
}

function listFiles(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = path.join(directory, entry);
    return statSync(fullPath).isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

/**
 * Browser-facing build output: client chunks and static assets, prerendered
 * HTML/RSC/route bodies served to browsers, and client manifests.
 */
function clientArtifacts(distDir: string): string[] {
  const staticFiles = listFiles(path.join(distDir, "static"));
  const prerendered = listFiles(path.join(distDir, "server", "app")).filter((file) =>
    /\.(html|rsc|body)$/.test(file),
  );
  const clientManifests = listFiles(path.join(distDir, "server")).filter((file) =>
    file.endsWith("client-reference-manifest.js"),
  );
  const buildManifest = path.join(distDir, "build-manifest.json");
  return [
    ...staticFiles,
    ...prerendered,
    ...clientManifests,
    ...(existsSync(buildManifest) ? [buildManifest] : []),
  ];
}

function serverChunks(distDir: string): string[] {
  return listFiles(path.join(distDir, "server")).filter((file) => file.endsWith(".js"));
}

/** Relative paths of files containing `needle`; never returns the needle. */
function filesContaining(files: readonly string[], needle: string, base: string): string[] {
  return files
    .filter((file) => readFileSync(file, "utf8").includes(needle))
    .map((file) => path.relative(base, file).split(path.sep).join("/"));
}

function writeFixture(name: string, files: Record<string, string>): string {
  const dir = path.join(fixturesRoot, name);
  for (const [file, contents] of Object.entries(files)) {
    const target = path.join(dir, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, contents);
  }
  return dir;
}

const LAYOUT = `import type { ReactNode } from "react";
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
`;

const SERVER_SECRET_MODULE = `import "server-only";
const SERVER_MARKER = "${serverMarker}";
export function describeServerSecret(): { configured: boolean } {
  const value = process.env.${SECRET_NAME} ?? "";
  return { configured: value.length > 0 && value !== SERVER_MARKER };
}
`;

function removeFixtures(): void {
  rmSync(fixturesRoot, { recursive: true, force: true });
}

beforeAll(() => {
  removeFixtures();
  expect(SECRET_NAME.startsWith("NEXT_PUBLIC_")).toBe(false);
  expect(existsSync(nextBin)).toBe(true);
});

afterAll(() => {
  removeFixtures();
});

describe("server-only boundary (production build)", () => {
  it("builds the real app without leaking the synthetic secret or server literals", () => {
    const build = nextBuild(null, { [SECRET_NAME]: secretValue });
    expect(build.status, build.output.slice(-4000)).toBe(0);

    const distDir = path.join(frontendRoot, ".next");
    const clientFiles = clientArtifacts(distDir);
    expect(clientFiles.length).toBeGreaterThan(0);

    expect(filesContaining(clientFiles, secretValue, distDir)).toEqual([]);
    for (const literal of APP_SERVER_LITERALS) {
      expect(serverChunks(distDir).length).toBeGreaterThan(0);
      expect(
        filesContaining(serverChunks(distDir), literal, distDir).length,
        `server literal present in server output: ${literal}`,
      ).toBeGreaterThan(0);
      expect(filesContaining(clientFiles, literal, distDir), literal).toEqual([]);
    }
  });

  it("lets a server-only module read the synthetic secret without leaking it (positive control)", () => {
    const dir = writeFixture("valid", {
      "app/layout.tsx": LAYOUT,
      "lib/server-secret.ts": SERVER_SECRET_MODULE,
      "app/public-control.tsx": `"use client";
import { useEffect } from "react";
export function PublicControl() {
  useEffect(() => {
    const target = window as unknown as Record<string, unknown>;
    target.__s6t11Public = process.env.${PUBLIC_CONTROL_NAME};
    target.__s6t11Secret = process.env.${SECRET_NAME};
  }, []);
  return null;
}
`,
      "app/page.tsx": `import { describeServerSecret } from "../lib/server-secret";
import { PublicControl } from "./public-control";
export default function Page() {
  const { configured } = describeServerSecret();
  return <main><p id="secret-state">{configured ? "configured" : "missing"}</p><PublicControl /></main>;
}
`,
    });

    const build = nextBuild(dir, {
      [SECRET_NAME]: secretValue,
      [PUBLIC_CONTROL_NAME]: publicControlValue,
    });
    expect(build.status, build.output.slice(-4000)).toBe(0);

    const distDir = path.join(dir, ".next");
    const clientFiles = clientArtifacts(distDir);
    const html = readFileSync(path.join(distDir, "server", "app", "index.html"), "utf8");

    expect(html).toContain('id="secret-state">configured<');
    expect(filesContaining(clientFiles, publicControlValue, distDir).length).toBeGreaterThan(0);
    expect(filesContaining(serverChunks(distDir), serverMarker, distDir).length).toBeGreaterThan(0);
    expect(filesContaining(clientFiles, secretValue, distDir)).toEqual([]);
    expect(filesContaining(clientFiles, serverMarker, distDir)).toEqual([]);
  });

  it("rejects a client component that imports a server-only module directly", () => {
    const dir = writeFixture("invalid-direct", {
      "app/layout.tsx": LAYOUT,
      "lib/server-secret.ts": SERVER_SECRET_MODULE,
      "app/client-direct.tsx": `"use client";
import { describeServerSecret } from "../lib/server-secret";
export function ClientDirect() {
  return <p>{String(describeServerSecret().configured)}</p>;
}
`,
      "app/page.tsx": `import { ClientDirect } from "./client-direct";
export default function Page() { return <ClientDirect />; }
`,
    });

    const build = nextBuild(dir, {});
    expect(build.status).not.toBe(0);
    expect(build.output, build.output.slice(-4000)).toContain(SERVER_ONLY_ERROR);
    expect(build.output).toContain("invalid-direct/lib/server-secret.ts");
    expect(build.output).toContain("invalid-direct/app/client-direct.tsx");
  });

  it("rejects a client component that imports a server-only module transitively", () => {
    const dir = writeFixture("invalid-transitive", {
      "app/layout.tsx": LAYOUT,
      "lib/server-secret.ts": SERVER_SECRET_MODULE,
      "lib/indirect.ts": `import { describeServerSecret } from "./server-secret";
export function isConfigured(): boolean {
  return describeServerSecret().configured;
}
`,
      "app/client-transitive.tsx": `"use client";
import { isConfigured } from "../lib/indirect";
export function ClientTransitive() {
  return <p>{String(isConfigured())}</p>;
}
`,
      "app/page.tsx": `import { ClientTransitive } from "./client-transitive";
export default function Page() { return <ClientTransitive />; }
`,
    });

    const build = nextBuild(dir, {});
    expect(build.status).not.toBe(0);
    expect(build.output, build.output.slice(-4000)).toContain(SERVER_ONLY_ERROR);
    expect(build.output).toContain("invalid-transitive/lib/server-secret.ts");
    expect(build.output).toContain("invalid-transitive/lib/indirect.ts");
    expect(build.output).toContain("invalid-transitive/app/client-transitive.tsx");
  });
});
