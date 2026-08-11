# Frontend

Phase 1 SEO-first storefront for the Baby Clothes & Toys project.

## Planned stack

- Next.js (App Router, unless an ADR changes this)
- React
- TypeScript
- Tailwind CSS

## Current state

**Not initialized.** This directory contains documentation only.

Do **not** create `package.json`, Next.js app files, or install npm packages until a Sprint 1 task explicitly requires it (expected: S1-T03).

## Architecture intent

```
Next.js UI
  → Application / use cases
  → Repository interface
  → Static / mock data (Phase 1)
```

In Phase 2 the repository implementation switches to an API client. The UI must not talk to FastAPI or PostgreSQL directly.

## Rules

- Follow `PROJECT_DEVELOPMENT_RULES.md` and `.cursor/rules/frontend.mdc`.
- Keep page files thin.
- Prefer Server Components for crawlable catalog pages.
- SEO is a first-class requirement.

Details: `docs/architecture/FRONTEND_ARCHITECTURE.md`.
