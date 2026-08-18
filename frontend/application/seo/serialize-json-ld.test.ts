import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "./serialize-json-ld";

describe("serializeJsonLd", () => {
  it("produces valid JSON for ordinary product fields", () => {
    const json = serializeJsonLd({
      "@type": "Product",
      name: "Pink and white pleated baby dress",
    });

    expect(JSON.parse(json)).toEqual({
      "@type": "Product",
      name: "Pink and white pleated baby dress",
    });
  });

  it("escapes markup so product text cannot close a script element", () => {
    const json = serializeJsonLd({
      name: `Dress</script><script>alert(1)</script> & "quotes" and 'apostrophes'`,
    });

    expect(json).not.toContain("</script>");
    expect(json).toContain("\\u003c");
    expect(JSON.parse(json).name).toContain("</script>");
    expect(JSON.parse(json).name).toContain("&");
    expect(JSON.parse(json).name).toContain('"');
    expect(JSON.parse(json).name).toContain("'");
  });
});
