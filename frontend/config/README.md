# Configuration

Binds which repository implementation to use (static vs HTTP). Holds non-secret public settings such as the canonical site origin.

**Must not contain:** secrets, business rules, catalog fixture rows.

`catalog.ts` is the Phase 1 composition root (`Static*Repository`). Pages call `catalog.*` use-case wrappers (including `getCategoryPage` for `/c/[slug]` and `getProductPage` for `/p/[slug]`). They must not import `infrastructure/catalog/data`.

Phase 2 swaps implementations in this file only (ADR 0004).

`site.ts` is the single source of truth for `NEXT_PUBLIC_SITE_URL` (canonical origin / `metadataBase`). The production domain is **TBD** and is not hardcoded. Copy `.env.example` to `.env.local` when you need a local override. Hosted production (`VERCEL_ENV=production` or `REQUIRE_SITE_URL=true`) must set a non-localhost origin.

Secrets go in `.env.local` (gitignored). The site URL is not a secret.
