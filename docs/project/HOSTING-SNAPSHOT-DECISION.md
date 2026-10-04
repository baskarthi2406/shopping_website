# Hosting & Catalog Snapshot Decision

Status: **DECISION RECORD — hosting NOT DECIDED** (2026-10-04).
Documentation only: no application code, infrastructure, ADR, or Zoho change;
zero Zoho API calls. Related: P0-9 and OD-9 in `PRODUCTION-DECISIONS.md`;
ADR 0006 (hosting TBD), ADR 0008 (persistence), ADR 0009 (provider access and
the interim snapshot amendment); implementation commit `4478477`.

## 1. Production Hosting Evidence

**Result: NOT DECIDED.** The repository does not establish a production
hosting target.

Searched (excluding `node_modules` and `.next`): Vercel, AWS, EC2, ECS,
Docker, Kubernetes, VPS, serverless, Node server, Nginx, CI/CD, deployment
and hosting configuration, environment configuration.

| Evidence | Location | What it establishes |
|---|---|---|
| "Host, runtime model (long-running Node server or serverless), and deployment pipeline are **TBD** (Sprint 11)" | ADR 0006 §8 | Hosting explicitly undecided |
| D11 "Hosting and runtime model (long-running Node vs serverless)": **TBD (Sprint 11)** | `docs/sprints/SPRINT-06.md` | Same |
| "Hosting / runtime model: TBD"; "hosting, CI/CD: **TBD**" | `docs/project/TECH_STACK.md` | Same |
| Hosting, runtime model, CI: **TBD** | `docs/architecture/BACKEND_ARCHITECTURE.md`, `ARCHITECTURE.md` | Same |
| "Hosting, CI, and observability vendors are **TBD**" | `docs/sprints/SPRINT-11.md` | Same |
| OD-9 Hosting (D11) open owner decision | `docs/project/PRODUCTION-DECISIONS.md` | Same |
| "Auth provider, hosting, CI vendor" must not be silently chosen | `PROJECT_DEVELOPMENT_RULES.md` §28 | Must not be inferred |
| `VERCEL_ENV === "production" \|\| REQUIRE_SITE_URL === "true"` guard | `frontend/config/site.ts` | A generic guard requiring a real site origin on hosted production; `REQUIRE_SITE_URL` exists for any other host. **Not** a hosting decision |
| `.vercel` entry | `frontend/.gitignore` | Next.js starter-template default. **Not** a hosting decision |
| `next build` / `next start` scripts; empty `next.config.ts` (no `output: "standalone"`) | `frontend/package.json`, `frontend/next.config.ts` | Framework defaults only |
| No Dockerfile, compose file, `vercel.json`, CI workflow, Procfile, Terraform, serverless or platform manifest | repository | No deployment configuration exists |

The production domain is also TBD (`NEXT_PUBLIC_SITE_URL`).

## 2. Current Snapshot Architecture

Source: commit `4478477` (`infrastructure/catalog/catalog-snapshot.ts`,
`infrastructure/zoho/zoho-catalog-snapshot.ts`, `config/zoho-catalog.ts`,
`config/catalog-source.ts`). Not changed by this task.

- **Selection:** `CATALOG_PRODUCT_SOURCE=static` (default) or `zoho-snapshot`.
  Categories always come from the storefront category records.
- **Storage:** one snapshot object in process memory (`globalThis`), per
  server process. Nothing is written to disk or any store.
- **Refresh trigger:** reads only; there is no timer or worker. A read that
  finds the snapshot older than `ZOHO_CATALOG_REFRESH_MINUTES` (default 360,
  allowed 15–720) starts one background refresh and returns the current
  snapshot immediately.
- **Refresh content:** one access token from the in-process token provider
  (cached until about 59 minutes after issue), then `GET /v1/organizations`
  and `GET /items` pages of 200 until `has_more_page` is false (cap 10
  pages). Only active, singly placed, contract-valid products are kept.
- **Single flight:** concurrent readers in one process share one refresh.
- **Failure:** the previous snapshot is kept; no new attempt for 5 minutes
  after a failure. Readers never see the provider error.
- **Maximum age:** a snapshot older than 24 h (from the refresh start time;
  ADR 0007 freshness threshold) is never served. Readers then wait for a
  refresh; if that fails, the storefront returns the existing
  `temporarily_unavailable` response / "catalog unavailable" view.
- **Rendering:** snapshot reads call `connection()`, so in snapshot mode the
  home page and sitemap render per request (from memory) and `next build`
  never calls Zoho. Category and product pages were already per-request.

Implications per scenario:

| Scenario | Behavior with the current implementation |
|---|---|
| Process restart / server restart | Snapshot lost. The first catalog read after start waits for a full refresh (token + 2 GETs at the observed catalog size). |
| Deployment | Each new process starts empty: same as a restart, once per process per deploy. Build itself makes no Zoho call. |
| Multiple instances | Each instance holds and refreshes its own snapshot independently. Instances can show different catalog versions for up to one refresh interval. Requests multiply by instance count. |
| Serverless cold starts | Every cold instance starts empty; the first request on it waits for a refresh. Instance count and lifetime are controlled by the platform and traffic, not by this code, so refresh count is unbounded by configuration. A background refresh started after the response may be frozen or dropped when the platform suspends the instance. |
| Concurrent refresh | Prevented within a process (single flight). Not coordinated across processes. |
| Zoho outage, snapshot < 24 h old | Storefront keeps serving the last snapshot. While reads continue, a retry is attempted at most every 5 minutes per process. |
| Zoho outage, snapshot ≥ 24 h old or none | Catalog pages show "temporarily unavailable". Retries remain limited to one per 5 minutes per process. |
| Stale snapshot | Normal operation: product, price, and stock data up to one refresh interval old (6 h default). During an outage: up to 24 h old. |
| First visitor after startup | Waits for the refresh (latency of one token call plus 2 Zoho GETs at the current catalog size; not measured as a latency figure). If Zoho is unavailable at that moment, that visitor gets "temporarily unavailable". |

## 3. Snapshot Production Requirements

Derived from existing accepted rules (not new decisions):

1. No page render or public Route Handler calls Zoho per request
   (`PROJECT_DEVELOPMENT_RULES.md` §15, ADR 0009 principle 6) — **met**.
2. Data older than the 24 h freshness threshold is not served (ADR 0007) —
   **met**.
3. Provider failure is shown as "temporarily unavailable", never "out of
   stock" (ADR 0009 principle 5, P0-10) — **met**.
4. Total Zoho requests stay inside the verified quota (ADR 0009 principles
   6, 8) — **cannot be confirmed**: the quota is unverified (V1) and the
   number of processes depends on hosting.
5. Request counting/budget guard (ADR 0009 principles 8, 9) — **partial**:
   each refresh logs its request count; there is no durable or cross-process
   counter (ADR 0008 P4).
6. No database or store without an ADR 0008 amendment — **met**.

Not covered by the snapshot and not required of it: checkout price and stock
must still be re-validated against Zoho at order time (as the demo already
does), because listing data can be hours old.

## 4. Request-Budget Analysis

### Known (live verification, `4478477`)

- One refresh: **2 Zoho GET requests** (`/v1/organizations` + one `/items`
  page), 157 items → 49 product groups → 13 published, 36 unplaced.
- Subsequent home, category, product, sitemap, and API reads in that
  process: **0** Zoho requests.
- `next build` in snapshot mode: **0** Zoho requests.
- One OAuth token refresh (POST to the accounts server) precedes a refresh
  whenever the cached access token has expired. Access token lifetime
  observed: 3600 s.

### Calculated (per process, from the implementation)

- GET requests per refresh = `1 + ceil(items / 200)`; 2 at the current 157
  items, unchanged until the catalog exceeds 200 items. The 10-page cap
  bounds a refresh at 11 GETs.
- Refreshes per process per day ≤ `1440 / interval minutes` (fewer if no
  reads arrive), plus one per process start.
- Token calls: at intervals of 60 minutes or more, about one per refresh;
  below that, at most about one per hour.

Per process, steady state, 30-day month, current catalog size, excluding
restarts and outages:

| Interval | Refreshes/day | GETs/month | Token calls/month | Total if token calls count |
|---|---|---|---|---|
| 720 min (max) | 2 | 120 | 60 | 180 |
| 360 min (default) | 4 | 240 | 120 | 360 |
| 15 min (min) | 96 | 5,760 | ≈ 720 | ≈ 6,480 |

Scaling with process count at the **default** 6 h interval (each process is
independent; plus one refresh per process per restart/deploy):

| Processes | GETs/month | Total if token calls count |
|---|---|---|
| 1 | 240 | 360 |
| 2 | 480 | 720 |
| 5 | 1,200 | 1,800 |
| 10 | 2,400 | 3,600 |

Outage (worst case, per process, while reads continue): one attempt per 5
minutes = up to 12 attempts/hour, each up to 1 token call + 2 GETs ≈ up to
36 calls/hour ≈ 864/day per process if the outage lasts a full day.

Does process count change the picture materially? Linearly, yes: at the
default interval the total stays in the hundreds to low thousands per month
for 1–10 processes, but with a short interval (15 min) even 2 processes
reach about 13,000 calls/month, and a long outage multiplies quickly. On
serverless hosting the process count is not fixed, so no upper bound can be
calculated. No production traffic level is assumed; refresh counts depend on
the interval and process count, not on visitor volume (beyond needing at
least one read per interval).

### Unknown

- Actual Zoho quota (daily/monthly/per-minute), reset period, overage
  behavior (V1). The **7,500 requests/month** figure is reported, **not
  verified** (TD-010).
- Whether OAuth token refreshes count toward the quota (V1/V10).
- Maximum `per_page` and incremental (modified-since) refresh support (V2).
- Production process/instance count (depends on OD-9).

## 5. Persistence Options

| Option | Survives restart | Shared across instances | Complexity | Fits current architecture | Recommendation |
|---|---|---|---|---|---|
| 1. In-memory per process (current) | No | No | Lowest (implemented) | Yes; no ADR 0008 amendment | Keep for a single long-running Node process or a small fixed instance count; not sufficient for serverless |
| 2. Persistent filesystem (snapshot file on local disk) | Yes, on a host with a persistent disk | No (only with a shared volume) | Low | Fits behind the same store interface; needs ADR 0008 amendment (P3) | Possible warm-start addition for a long-running single host; not useful on serverless or ephemeral containers |
| 3. Shared KV/cache | Yes (provider-dependent) | Yes | Medium (new vendor, credentials, network dependency) | Fits behind the store interface; needs ADR 0008 amendment, vendor TBD | Candidate if hosting is serverless or multi-instance |
| 4. PostgreSQL/database | Yes | Yes | High (schema, migrations, operations) for one JSON-sized document | Over-scoped; ADR 0008 has PostgreSQL not selected | Not recommended for the snapshot alone |
| 5. Object/file storage | Yes | Yes | Medium (vendor, credentials; write-whole-file semantics suit a snapshot) | Fits behind the store interface; needs ADR 0008 amendment, vendor TBD | Candidate alongside option 3 for serverless/multi-instance; also a natural home for the future image cache (P0-7) |

Options 2, 3, and 5 still need a decision on who refreshes the shared copy
(any instance with cross-instance coordination, or a scheduled job), which
is itself hosting-dependent.

## 6. Recommendation

**Hosting decision is required before selecting durable snapshot
infrastructure.**

Minimum production requirement, conditional on that decision:

- **Option A — in-memory is acceptable for initial production** if hosting
  is a long-running Node server (`next start`) with one process or a small,
  fixed number of instances. Evidence: at the default interval a process
  uses about 240 GETs/month (360 if token calls count); restarts and deploys
  each cost one refresh; outages are covered for 24 h by the last snapshot.
- **Option B — a shared/durable snapshot is required before production** if
  hosting is serverless or autoscaling. Evidence: cold instances start
  empty, each refreshes independently, background refreshes may not
  complete, and request volume cannot be bounded by configuration.

Until OD-9 is answered: keep the current in-memory snapshot and the default
`static` source; do not add any store; keep the refresh interval at the
default or longer. Do not choose between options 3 and 5 yet.

## 7. Owner Decision Required

1. **Production hosting platform and runtime model (OD-9 / D11):** a
   long-running Node server (one process or a fixed number) or a
   serverless/autoscaling platform, and its budget. This alone decides
   Option A vs Option B.
2. **Whether a launch may depend on in-memory snapshots:** is it acceptable
   that after every restart or deploy the first visitor waits for a Zoho
   refresh, and that the catalog shows "temporarily unavailable" if Zoho is
   down at that moment? If not, a durable snapshot is required regardless of
   hosting.
3. **Acceptable catalog staleness on listing pages:** normally up to the
   refresh interval (6 h default), and up to 24 h during a Zoho outage.
   The 24 h cap is already the accepted ADR 0007 default; the owner decides
   whether shoppers may see price/stock that is hours old before checkout
   re-validation.
4. **Zoho plan details (V1):** if the API quota is visible only in the Zoho
   account, supply the plan's request limits so the budget can be confirmed.

## 8. ADR Impact

No ADR is amended in this task; no hosting decision has been established.

Expected later:

- **ADR 0006:** record the hosting provider and runtime model once OD-9 is
  decided (§8 "Hosting" is TBD).
- **ADR 0008:** if Option B (or a persistent file for Option A) is chosen,
  amend with the selected store for P3 (snapshot) and, if required, P4
  (request counter) and P5 (token storage), citing the verified quota (V1)
  and the hosting decision.
- **ADR 0009:** after V1, set the budget guard threshold (principle 8) and
  the durable request counting approach (principle 9); update the interim
  snapshot amendment if the refresh model changes (for example a scheduled
  refresh instead of read-triggered refresh).
