# ADR 0002 — Next.js App Router and Server Components

- **Status:** Accepted
- **Date:** 2026-08-11

## Context

Phase 1 is an SEO-first, mobile-first Mini Mystiq storefront. Catalog pages must be crawlable. The stack is Next.js + React + TypeScript + Tailwind.

## Decision

- Use the **App Router** (not Pages Router).
- Use **Server Components** for home, category, and product content, metadata, and structured data.
- Use **Client Components** only for interactive islands (cart, mobile nav, search field, wishlist chrome).

Default routes: `/`, `/c/{slug}`, `/p/{slug}`, `/cart`, `/checkout`.

## Consequences

- S1-T03 initializes Next.js with App Router.
- Page files stay thin and call application services.
- S3 SEO features (`generateMetadata`, sitemap, robots) fit the App Router.
- Changing to Pages Router requires a new ADR.
