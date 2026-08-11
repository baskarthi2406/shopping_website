# Presentation

Reusable UI for Design Option 1. Components receive **view models / props**. They do not fetch data, import fixtures, or call repositories.

| Folder | Role | When |
|--------|------|------|
| `ui/` | Primitives (Button, Card, Badge, …) | Later UI tasks |
| `storefront/` | Composites (ProductCard, Hero, Header, …) | Later UI tasks |

**Must not contain:** filtering, pricing, cart math, repository calls, `localStorage`.

Do not implement Header, Footer, Hero, ProductCard, or navigation in S1-T04.
