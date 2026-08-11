# Development Guidelines

These guidelines summarize `PROJECT_DEVELOPMENT_RULES.md`. If they conflict, the rules file wins.

## Source of truth

Git documentation and source code. Never previous chat history.

## Before any task

Read:

1. `PROJECT_DEVELOPMENT_RULES.md`
2. `PROJECT_STATUS.md`
3. `SPRINT_STATUS.md`
4. `CURRENT_TASK.md`
5. Architecture, requirements, sprint spec, Cursor rules as relevant

## Execution

```
PLAN → IMPLEMENT → TEST → REVIEW → DOCUMENT → UPDATE STATUS → COMMIT → STOP
```

Never start the next task automatically.

## Layering

See `docs/architecture/FRONTEND_ARCHITECTURE.md` (S1-T02 contract; implemented through S2-T01).

```
App / Pages → Presentation → Application → Domain → Repository interface
Infrastructure implements repositories. Configuration binds them.
```

**Forbidden:** React → static JSON; React → FastAPI/SQL; Domain → Next.js/React.

Phase 1 infrastructure = static/mock data.  
Phase 2 infrastructure = HTTP client → FastAPI + PostgreSQL behind the same frontend repository interface.

Pages are Server Components by default. Client Components are small interactive islands only.

### Frontend folders (S1-T04)

| Path | Boundary |
|------|----------|
| `frontend/app/` | Routes and layouts only |
| `frontend/components/` | Presentation (`ui/`, `storefront/`) |
| `frontend/domain/` | Catalog and cart concepts (no React/Next) |
| `frontend/application/` | Use cases **and** repository interfaces |
| `frontend/infrastructure/` | Static (Phase 1) or HTTP (Phase 2) adapters |
| `frontend/config/` | Composition / env binding; no secrets |
| `frontend/lib/` | Shared technical utilities only |

Do not add a top-level `repositories/` or `types/` dump. Canonical `Product` / `Category` / `Cart` types belong in `domain/`.

Phase 1 catalog access: `config/catalog.ts` → application use cases → repository interfaces → `Static*Repository` → `infrastructure/catalog/data/`. Never import fixtures from React or `app/`.

Category listing (S2-T01; S2-T02 closed as already satisfied): `app/c/[slug]/page.tsx` calls `catalog.getCategoryPage`. Presentation (`ProductCard`) receives view-model props only. Metadata helpers live in `application/seo/`. Do not add a second category listing route or ProductCard.

## Documentation

- Mark undecided business facts as **TBD**.
- Significant architecture changes need an ADR in `docs/decisions/`.
- Update status files after every completed task.

## Quality

- SEO-first storefront pages must remain crawlable.
- Storefront is mobile-first: Mobile → Tablet → Desktop. Desktop extends mobile; it does not lead.
- Mini Mystiq logo and photos: `public/` only. See `docs/project/DESIGN_ASSETS.md`. Do not generate replacements.
- Semantic HTML, keyboard-accessible and touch-friendly storefront controls.
- No secrets in Git.
- No extra dependencies without a task need.
- Unit tests: Vitest (`npm test`). Colocate `*.test.ts`. Application tests use repository fakes, not static fixtures. Domain tests stay framework-free. Component/E2E tests are later tasks.
- Visual tokens: Option 1 via `frontend/app/globals.css`. Use semantic utilities (`bg-primary`, `text-foreground`), not raw hex. Breakpoints and hex are implementation defaults until a brand guide says otherwise.

## Definition of Done

See `PROJECT_DEVELOPMENT_RULES.md` section 25.
