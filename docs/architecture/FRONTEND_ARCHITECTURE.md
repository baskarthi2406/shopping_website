# Frontend Architecture

Phase 1 storefront. Implementation starts only when Sprint 1 tasks require it.

## Stack

Next.js + React + TypeScript + Tailwind CSS.

**Proposed (confirm in S1-T01):** App Router, Server Components for catalog pages, Client Components for cart interactivity.

## Intended structure (not created yet)

Proposed only — final tree is an S1-T04 deliverable:

```
frontend/
  src/
    app/                 # routes, metadata, layouts (thin)
    domain/              # entities, value objects
    application/         # use cases, repository interfaces
    infrastructure/      # static repositories, later API client
    components/          # presentational UI
    styles/              # Tailwind entry
```

If Next.js requires files at `frontend/` root (`app/`, `public/`), keep domain/application **outside** route files.

## Rules

- Catalog pages must be crawlable (server-rendered HTML).
- Do not call FastAPI from UI in Phase 1.
- Cart in Phase 1 is client-side only (persistence strategy TBD in Sprint 4; server cart in Sprint 7).
- SEO metadata belongs at the route layer but is fed by application queries, not hardcoded in every component.

## SEO surface

URLs, metadata, canonicals, sitemap, robots, JSON-LD, OpenGraph, and images are specified in `docs/requirements/SEO_REQUIREMENTS.md` and implemented in Sprint 3 (with URL strategy prepared in catalog work).

## Testing

Unit-test domain and application modules without rendering Next.js where possible. Component/e2e tools are **TBD** (S1-T06).
