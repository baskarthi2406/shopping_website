# Infrastructure

Concrete adapters. Implements application repository interfaces. Maps raw
static/API/vendor records → domain.

**May depend on:** domain, repository interfaces.

**Must not depend on:** `app/` pages, presentation components.

| Folder | Current | Planned |
|--------|---------|---------|
| `catalog/` | `Static*Repository` + fixtures (S1-T05) | Dummy HTTP (S4), production (S6), Zoho adapter (S7) |
| `cart/` | README only | Commerce/order repository contract TBD in S5/S8 |

S4-T01 found no HTTP client or backend code. Do not add one until the current
task explicitly schedules it. Zoho DTOs must stay inside infrastructure
(ADR 0005).
