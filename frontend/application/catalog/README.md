# `application/catalog`

Catalog use cases and repository interfaces (`ProductRepository`, `CategoryRepository`, `UomRepository`).

Pages call this layer. UI must not import fixtures. Implementations are bound in `config/` and live in `infrastructure/catalog/`.

S1-T05 implements the first ports and queries. Sprint 2 implements storefront use of them.
