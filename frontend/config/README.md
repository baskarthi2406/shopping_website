# Configuration

Binds which repository implementation to use (static vs dummy/production/Zoho
HTTP). Holds non-secret public settings such as the canonical site origin.

**Must not contain:** secrets, business rules, catalog fixture rows.

`create-catalog.ts` is the shared use-case wiring helper.

`catalog-source.ts` is the dummy API backing composition (`Static*Repository`).
Route handlers and `app/sitemap.ts` call it so the dummy API cannot recurse
through the storefront HTTP client.

`catalog.ts` is the storefront composition root (`Http*Repository` + catalog
API client). Pages, layout navigation, and footer category columns call
`catalog.*` use cases and must not import `infrastructure/catalog/data`.
Category tree reads are request-memoized so header, footer, and pages share
one `GET /api/categories`.

A future production or Zoho adapter replaces the dummy dispatch/backing store
in this folder only (ADR 0004/0005).

`site.ts` is the single source of truth for `NEXT_PUBLIC_SITE_URL` (canonical origin / `metadataBase` / sitemap locs / robots sitemap URL / Organization `url` and logo). The production domain is **TBD** and is not hardcoded. Copy `.env.example` to `.env.local` when you need a local override. Hosted production (`VERCEL_ENV=production` or `REQUIRE_SITE_URL=true`) must set a non-localhost origin.

`organization.ts` holds public Organization JSON-LD facts (brand name, approved logo path, listing telephone and PostalAddress). It is not a legal-entity record: do not add `legalName` or social profiles here until they are confirmed.

Secrets go in `.env.local` (gitignored). The site URL is not a secret.
