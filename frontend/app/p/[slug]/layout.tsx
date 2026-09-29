import { notFound } from "next/navigation";
import { catalog } from "@/config/catalog";

/**
 * Resolves the product before the page's loading boundary starts streaming;
 * once streaming starts, a missing slug can no longer return HTTP 404.
 */
export default async function ProductLayout({
  children,
  params,
}: LayoutProps<"/p/[slug]">) {
  const { slug } = await params;

  if ((await catalog.getProductBySlug(slug)) === null) {
    notFound();
  }

  return children;
}
