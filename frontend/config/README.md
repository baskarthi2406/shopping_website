# Configuration

Binds which repository implementation to use (static vs dummy/production/Zoho
HTTP). Holds non-secret public settings such as the canonical site origin.

**Must not contain:** secrets, business rules, catalog fixture rows.

`catalog.ts` is the Phase 1 composition root (`Static*Repository`). Pages,
`app/sitemap.ts`, and the S4-T04 category API route call `catalog.*` use-case
wrappers. They must not import `infrastructure/catalog/data`.

Future tasks swap implementations in this file only (ADR 0004/0005). The
storefront still has no HTTP repository; S4-T09 owns that integration.

`site.ts` is the single source of truth for `NEXT_PUBLIC_SITE_URL` (canonical origin / `metadataBase` / sitemap locs / robots sitemap URL / Organization `url` and logo). The production domain is **TBD** and is not hardcoded. Copy `.env.example` to `.env.local` when you need a local override. Hosted production (`VERCEL_ENV=production` or `REQUIRE_SITE_URL=true`) must set a non-localhost origin.

`organization.ts` holds public Organization JSON-LD facts (brand name, approved logo path, listing telephone and PostalAddress). It is not a legal-entity record: do not add `legalName` or social profiles here until they are confirmed.

Secrets go in `.env.local` (gitignored). The site URL is not a secret.
