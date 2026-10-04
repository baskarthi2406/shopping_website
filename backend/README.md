# Backend (retired placeholder)

**There is no separate backend.** ADR 0006 (S6-T02) keeps the UI and all
server-side functionality in the Next.js application in `frontend/`, and
supersedes the earlier FastAPI + PostgreSQL plan (ADR 0003).

Do **not** add application code, Python packages, Docker files, or database
schemas to this directory. Server-side code belongs in `frontend/` server-only
modules and Route Handlers.

Details:

- `docs/decisions/0006-nextjs-only-application-architecture.md`
- `docs/architecture/BACKEND_ARCHITECTURE.md` (server-side architecture)
- `docs/decisions/0008-persistent-storage.md` (no database selected)
