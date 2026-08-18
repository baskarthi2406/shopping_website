/**
 * Canonical site origin — single source of truth.
 *
 * Production domain is TBD. Deployment must set NEXT_PUBLIC_SITE_URL
 * to the public https origin before going live. Do not invent a brand domain.
 *
 * Pages and SEO helpers keep path-only canonicals. Next.js metadataBase
 * (layout) resolves them against this origin.
 */
export const SITE_URL_ENV = "NEXT_PUBLIC_SITE_URL";

const DEVELOPMENT_FALLBACK = "http://localhost:3000";

export type EnvLike = Record<string, string | undefined>;

export type SiteOrigin = {
  readonly href: string;
  readonly url: URL;
  readonly fromEnv: boolean;
};

function isLocalhostHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname === "::1"
  );
}

function isHostedProduction(env: EnvLike): boolean {
  return env.VERCEL_ENV === "production" || env.REQUIRE_SITE_URL === "true";
}

/**
 * Parse a configured site origin. Rejects relative URLs, query strings,
 * hashes, credentials, and non-http(s) schemes.
 */
export function parseSiteOrigin(value: string): URL {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error(`${SITE_URL_ENV} must not be empty`);
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(
      `${SITE_URL_ENV} must be an absolute URL (got ${JSON.stringify(value)})`,
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`${SITE_URL_ENV} must use http or https`);
  }

  if (parsed.username || parsed.password) {
    throw new Error(`${SITE_URL_ENV} must not include credentials`);
  }

  if (parsed.search || parsed.hash) {
    throw new Error(`${SITE_URL_ENV} must not include a query or hash`);
  }

  if (parsed.pathname !== "/" && parsed.pathname !== "") {
    throw new Error(`${SITE_URL_ENV} must not include a path`);
  }

  return new URL(parsed.origin);
}

/**
 * Join a path-only catalog URL with the configured origin.
 * Paths must start with `/` and must not include query or hash.
 */
export function toAbsoluteSiteUrl(origin: SiteOrigin, path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`Canonical path must start with / (got ${JSON.stringify(path)})`);
  }

  if (path.includes("?") || path.includes("#")) {
    throw new Error("Canonical path must not include a query or hash");
  }

  return new URL(path, `${origin.href}/`).href;
}

/**
 * Absolute URL matching S3-T03 HTML canonicals.
 * Homepage uses origin.href (no trailing slash), same as Next.js
 * metadataBase + canonical path `/`. Other paths use toAbsoluteSiteUrl.
 */
export function toCanonicalUrl(origin: SiteOrigin, path: string): string {
  if (path === "/") {
    return origin.href;
  }

  return toAbsoluteSiteUrl(origin, path);
}

export function resolveSiteOrigin(env: EnvLike = process.env): SiteOrigin {
  const raw = env[SITE_URL_ENV]?.trim();

  if (raw) {
    const url = parseSiteOrigin(raw);

    if (isHostedProduction(env) && isLocalhostHostname(url.hostname)) {
      throw new Error(
        `${SITE_URL_ENV} must not be localhost when deploying to production`,
      );
    }

    return { href: url.origin, url, fromEnv: true };
  }

  if (isHostedProduction(env)) {
    throw new Error(
      `${SITE_URL_ENV} must be set to the public site origin in production. The production domain is TBD and is not hardcoded.`,
    );
  }

  const url = new URL(DEVELOPMENT_FALLBACK);
  return { href: url.origin, url, fromEnv: false };
}

/** Next.js metadataBase. Uses the same origin as canonical URLs. */
export function getMetadataBase(env: EnvLike = process.env): URL {
  return resolveSiteOrigin(env).url;
}
