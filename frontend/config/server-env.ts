import "server-only";

export type ServerEnv = Readonly<Record<string, string | undefined>>;

const PUBLIC_PREFIX = "NEXT_PUBLIC_";
const ENV_NAME_PATTERN = /^[A-Z][A-Z0-9_]*$/;

/**
 * Reads a server-only setting such as a future provider credential. Names with
 * the `NEXT_PUBLIC_` prefix are rejected because Next.js inlines them into
 * client bundles. Unset or blank values return null. Error messages carry the
 * variable name only, never its value.
 */
export function readServerEnv(
  name: string,
  env: ServerEnv = process.env,
): string | null {
  if (!ENV_NAME_PATTERN.test(name) || name.startsWith(PUBLIC_PREFIX)) {
    throw new Error(`Invalid server-only environment variable name: ${name}`);
  }

  const value = env[name];
  return value === undefined || value.trim() === "" ? null : value;
}
