import { describe, expect, it } from "vitest";
import { organization } from "@/config/organization";
import { resolveSiteOrigin, toCanonicalUrl } from "@/config/site";
import { serializeJsonLd } from "./serialize-json-ld";
import { buildOrganizationStructuredData } from "./organization-structured-data";

const forbiddenKeys = [
  "legalName",
  "sameAs",
  "email",
  "foundingDate",
  "founder",
  "taxID",
  "vatID",
  "leiCode",
  "priceRange",
  "aggregateRating",
  "review",
  "openingHours",
  "openingHoursSpecification",
  "contactPoint",
  "paymentAccepted",
] as const;

describe("buildOrganizationStructuredData", () => {
  const origin = resolveSiteOrigin({
    NEXT_PUBLIC_SITE_URL: "https://store.example",
  });
  const toAbsoluteUrl = (path: string) => toCanonicalUrl(origin, path);

  it("builds Schema.org Organization data from the organization config", () => {
    const data = buildOrganizationStructuredData(organization, toAbsoluteUrl);

    expect(data).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Mini Mystiq",
      url: "https://store.example",
      logo: "https://store.example/mini-mystiq-logo.png",
      telephone: "090257 99377",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Ponnaiah Konar Complex, Avanam Road, Mudapulikkadu",
        addressLocality: "Peravurani",
        addressRegion: "Tamil Nadu",
        postalCode: "614804",
        addressCountry: "IN",
      },
    });
    expect(data?.url).toBe(toAbsoluteUrl("/"));
    expect(data?.logo).toBe(toAbsoluteUrl("/mini-mystiq-logo.png"));
    expect(data?.logo).not.toContain("baby-sleeveless");
    expect(data?.name).not.toBe("Enn2Gee Mini Mystiq");
  });

  it("does not invent legal, social, or identifier fields", () => {
    const data = buildOrganizationStructuredData(organization, toAbsoluteUrl);
    const json = JSON.stringify(data);

    expect(data).not.toBeNull();
    for (const key of forbiddenKeys) {
      expect(data).not.toHaveProperty(key);
    }

    expect(json).not.toMatch(
      /"legalName"|"sameAs"|"email"|"openingHours"|"aggregateRating"|"review"/,
    );
    expect(json).not.toContain("facebook.com");
    expect(json).not.toContain("instagram.com");
  });

  it("omits telephone and address when they are absent", () => {
    const data = buildOrganizationStructuredData(
      { name: "Mini Mystiq", logoPath: "/mini-mystiq-logo.png" },
      toAbsoluteUrl,
    );

    expect(data).not.toHaveProperty("telephone");
    expect(data).not.toHaveProperty("address");
  });

  it("returns null when there is no organization source", () => {
    expect(buildOrganizationStructuredData(null, toAbsoluteUrl)).toBeNull();
  });

  it("serializes safely with the existing JSON-LD serializer", () => {
    const data = buildOrganizationStructuredData(organization, toAbsoluteUrl);
    expect(data).not.toBeNull();
    const json = serializeJsonLd(data!);

    expect(json).not.toContain("</script>");
    expect(JSON.parse(json)["@type"]).toBe("Organization");
  });
});
