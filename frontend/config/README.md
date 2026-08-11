# Configuration

Binds which repository implementation to use (static vs HTTP). Holds non-secret public settings such as site URL for canonicals (**TBD**).

**Must not contain:** secrets, business rules, catalog fixture rows.

`catalog.ts` is the Phase 1 composition root (`Static*Repository`). Pages call `catalog.*` use-case wrappers (including `getCategoryPage` for `/c/[slug]`). They must not import `infrastructure/catalog/data`.

Phase 2 swaps implementations in this file only (ADR 0004).

Secrets go in `.env.local` (gitignored). No environment variables are required yet.
