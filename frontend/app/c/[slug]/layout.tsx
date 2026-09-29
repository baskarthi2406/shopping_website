import { notFound } from "next/navigation";
import { catalog } from "@/config/catalog";

/**
 * Resolves the category before the page's loading boundary starts streaming;
 * once streaming starts, a missing slug can no longer return HTTP 404.
 */
export default async function CategoryLayout({
  children,
  params,
}: LayoutProps<"/c/[slug]">) {
  const { slug } = await params;

  if ((await catalog.getCategoryBySlug(slug)) === null) {
    notFound();
  }

  return children;
}
