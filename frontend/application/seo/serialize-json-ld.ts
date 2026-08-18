/**
 * JSON-LD must be serialized before it is placed in a <script> element.
 * Escaping `<` prevents product text from closing the script tag.
 */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
