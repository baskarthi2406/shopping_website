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

UI and HTTP adapters call application services. Application services call repository interfaces. Infrastructure implements repositories.

Phase 1 infrastructure = static/mock data.  
Phase 2 infrastructure = FastAPI + PostgreSQL behind the same frontend repository interface.

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

## Definition of Done

See `PROJECT_DEVELOPMENT_RULES.md` section 25.
