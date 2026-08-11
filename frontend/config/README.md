# Configuration

Binds which repository implementation to use (static vs HTTP). Holds non-secret public settings such as site URL for canonicals (**TBD**).

**Must not contain:** secrets, business rules, catalog data.

Rules:

- Secrets go in `.env.local` (gitignored). Never commit them.
- Document variable names in `.env.example` only when a task introduces them.
- Prefer server-only env vars unless the browser needs the value (`NEXT_PUBLIC_*`).
- Pages must not `if (phase === 1) import json`. Composition happens here (S1-T05+).

No environment variables are required yet.
