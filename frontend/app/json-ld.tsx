import { serializeJsonLd } from "@/application/seo/serialize-json-ld";

type JsonLdProps = {
  data: object;
};

/**
 * Server-only JSON-LD script. Callers pass a built structured-data object.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
