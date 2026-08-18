import type { BreadcrumbItemViewModel } from "../catalog/breadcrumb-view-model";

export type BreadcrumbStructuredDataSource = {
  readonly breadcrumb: readonly BreadcrumbItemViewModel[];
  readonly canonicalPath: string;
};

export type BreadcrumbListItemStructuredData = {
  readonly "@type": "ListItem";
  readonly position: number;
  readonly name: string;
  readonly item: string;
};

export type BreadcrumbListStructuredData = {
  readonly "@context": "https://schema.org";
  readonly "@type": "BreadcrumbList";
  readonly itemListElement: readonly BreadcrumbListItemStructuredData[];
};

/**
 * Schema.org BreadcrumbList from the same trail as the UI breadcrumbs.
 * The current page (href null) uses the page canonical path; no extra levels.
 */
export function buildBreadcrumbStructuredData(
  source: BreadcrumbStructuredDataSource | null,
  toAbsoluteUrl: (path: string) => string,
): BreadcrumbListStructuredData | null {
  if (source === null || source.breadcrumb.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: source.breadcrumb.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: toAbsoluteUrl(crumb.href ?? source.canonicalPath),
    })),
  };
}
