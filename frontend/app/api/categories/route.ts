import { catalogSource } from "@/config/catalog-source";
import { createGetCategoriesHandler } from "./get-categories-handler";

/** Dummy fixture data is deterministic and safe for static route generation. */
export const dynamic = "force-static";

export const GET = createGetCategoriesHandler(() =>
  catalogSource.getCategoryCollection(),
);
