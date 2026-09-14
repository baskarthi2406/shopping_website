import { catalog } from "@/config/catalog";
import { createGetProductsHandler } from "./get-products-handler";

/** Query-specific responses are dynamic but deterministic over static data. */
export const dynamic = "force-dynamic";

export const GET = createGetProductsHandler((query) =>
  catalog.getProductCollection(query),
);
