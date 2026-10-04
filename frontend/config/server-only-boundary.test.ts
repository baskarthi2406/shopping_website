import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const frontendRoot = path.resolve(import.meta.dirname, "..");
const SKIPPED_DIRECTORIES = new Set(["node_modules", ".next", ".boundary-fixtures"]);
const EXTENSIONS = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"];
const IMPORT_PATTERN =
  /(?:import|export)\s[^'"]*?from\s*["']([^"']+)["']|import\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;

const PROTECTED_MODULES = [
  "config/catalog.ts",
  "config/catalog-source.ts",
  "config/catalog-api-dispatch.ts",
  "config/server-env.ts",
  "infrastructure/zoho/zoho-config.ts",
  "infrastructure/zoho/zoho-client.ts",
  "infrastructure/zoho/zoho-oauth.ts",
  "infrastructure/zoho/zoho-demo-gateway.ts",
  "infrastructure/zoho/zoho-category-mapping.ts",
  "infrastructure/zoho/zoho-catalog-snapshot.ts",
  "infrastructure/catalog/catalog-snapshot.ts",
  "config/zoho-catalog.ts",
  "config/zoho-demo.ts",
  "config/demo-store.ts",
];

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = path.join(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      return SKIPPED_DIRECTORIES.has(entry) ? [] : listSourceFiles(fullPath);
    }
    return /\.tsx?$/.test(entry) && !/\.test\.ts$/.test(entry) ? [fullPath] : [];
  });
}

function read(file: string): string {
  return readFileSync(file, "utf8");
}

function isClientModule(source: string): boolean {
  return /^\s*(?:\/\/[^\n]*\n\s*|\/\*[\s\S]*?\*\/\s*)*["']use client["']/.test(
    source,
  );
}

function isServerOnlyModule(source: string): boolean {
  return /^\s*import\s+["']server-only["']/m.test(source);
}

function importSpecifiers(source: string): string[] {
  return [...source.matchAll(IMPORT_PATTERN)].map(
    (match) => match[1] ?? match[2] ?? match[3] ?? "",
  );
}

function resolveLocal(fromFile: string, specifier: string): string | null {
  let base: string;
  if (specifier.startsWith("@/")) {
    base = path.join(frontendRoot, specifier.slice(2));
  } else if (specifier.startsWith(".")) {
    base = path.resolve(path.dirname(fromFile), specifier);
  } else {
    return null;
  }

  for (const extension of EXTENSIONS) {
    const candidate = base + extension;
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return candidate;
    }
  }
  throw new Error(
    `Unresolved import "${specifier}" in ${path.relative(frontendRoot, fromFile)}`,
  );
}

function relative(file: string): string {
  return path.relative(frontendRoot, file).split(path.sep).join("/");
}

/** Every module reachable from `entry`, with the import chain that reaches it. */
function reachableModules(entry: string): Map<string, string[]> {
  const chains = new Map<string, string[]>([[entry, [relative(entry)]]]);
  const queue = [entry];

  while (queue.length > 0) {
    const current = queue.shift() as string;
    for (const specifier of importSpecifiers(read(current))) {
      if (specifier === "server-only") {
        chains.set("server-only", [...(chains.get(current) ?? []), "server-only"]);
        continue;
      }
      const resolved = resolveLocal(current, specifier);
      if (resolved !== null && !chains.has(resolved)) {
        chains.set(resolved, [...(chains.get(current) ?? []), relative(resolved)]);
        queue.push(resolved);
      }
    }
  }

  return chains;
}

function violations(entry: string): string[] {
  const found: string[] = [];
  for (const [module, chain] of reachableModules(entry)) {
    const name = module === "server-only" ? module : relative(module);
    const forbidden =
      module === "server-only" ||
      name.startsWith("config/") ||
      name.startsWith("infrastructure/") ||
      isServerOnlyModule(read(module));
    if (forbidden) {
      found.push(chain.join(" -> "));
    }
  }
  return found;
}

describe("server-only boundary (source import graph)", () => {
  const sourceFiles = listSourceFiles(frontendRoot);
  const clientModules = sourceFiles.filter((file) => isClientModule(read(file)));

  it("marks the server composition roots and env reader as server-only", () => {
    for (const protectedModule of PROTECTED_MODULES) {
      const source = read(path.join(frontendRoot, protectedModule));
      expect(isServerOnlyModule(source), protectedModule).toBe(true);
    }
  });

  it("keeps every client module off config, infrastructure, and server-only code", () => {
    expect(clientModules.length).toBeGreaterThanOrEqual(5);

    for (const clientModule of clientModules) {
      expect(violations(clientModule), relative(clientModule)).toEqual([]);
    }
  });

  it("does not mark browser-safe shared modules as server-only", () => {
    for (const sharedModule of [
      "application/catalog/variant-selection.ts",
      "application/catalog/catalog-messages.ts",
      "domain/catalog/index.ts",
    ]) {
      expect(
        isServerOnlyModule(read(path.join(frontendRoot, sharedModule))),
        sharedModule,
      ).toBe(false);
    }
  });

  it("detects protected modules when they are reachable (resolver self-check)", () => {
    const layoutViolations = violations(path.join(frontendRoot, "app/layout.tsx"));
    expect(layoutViolations.some((chain) => chain.includes("config/catalog.ts"))).toBe(
      true,
    );
    expect(
      layoutViolations.some((chain) => chain.endsWith("server-only")),
    ).toBe(true);
  });
});
