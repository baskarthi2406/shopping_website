import Link from "next/link";
import { STOREFRONT_SERVICE_CLAIMS } from "@/components/storefront/storefront-service-claims";
import { toTelHref } from "@/components/storefront/to-tel-href";
import { Container } from "@/components/ui/container";

export type FooterNavLink = {
  label: string;
  href: string;
};

export type FooterContactAddress = {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
};

export type FooterContact = {
  name: string;
  telephone: string;
  address: FooterContactAddress;
};

export type StorefrontFooterProps = {
  shop: readonly FooterNavLink[];
  collections: readonly FooterNavLink[];
  contact: FooterContact;
};

function formatAddressLines(address: FooterContactAddress): readonly string[] {
  return [
    address.streetAddress,
    `${address.addressLocality}, ${address.addressRegion} ${address.postalCode}`,
  ];
}

function FooterLinkList({
  labelledBy,
  items,
}: {
  labelledBy: string;
  items: readonly FooterNavLink[];
}) {
  return (
    <ul aria-labelledby={labelledBy} className="mt-2 space-y-0.5">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="inline-flex min-h-[var(--mm-tap-min)] items-center text-small text-foreground-secondary transition-colors duration-[var(--mm-duration)] hover:text-primary"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function StorefrontFooter({
  shop,
  collections,
  contact,
}: StorefrontFooterProps) {
  const addressLines = formatAddressLines(contact.address);
  const telephoneHref = toTelHref(contact.telephone);

  return (
    <footer className="mt-4 border-t border-border bg-surface text-foreground">
      <Container>
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-b border-border py-3 text-center text-caption tracking-wide text-foreground-muted">
          {STOREFRONT_SERVICE_CLAIMS.map((claim) => (
            <li key={claim}>{claim}</li>
          ))}
        </ul>

        <div className="grid grid-cols-2 gap-x-6 gap-y-8 py-8 lg:grid-cols-4 lg:gap-8">
          <div className="col-span-2 lg:col-span-1">
            <p className="font-display text-h3 font-semibold text-foreground">
              {contact.name}
            </p>
            <p className="mt-2 text-caption text-foreground-muted">
              Baby Clothes & Toys
            </p>
            <p className="mt-1 text-caption text-foreground-muted">
              Delivering Style & Tech
            </p>
          </div>

          {shop.length > 0 ? (
            <nav aria-label="Shop">
              <h2
                id="footer-shop-heading"
                className="text-caption font-semibold tracking-[0.14em] text-foreground-secondary uppercase"
              >
                Shop
              </h2>
              <FooterLinkList labelledBy="footer-shop-heading" items={shop} />
            </nav>
          ) : null}

          {collections.length > 0 ? (
            <nav aria-label="Collections">
              <h2
                id="footer-collections-heading"
                className="text-caption font-semibold tracking-[0.14em] text-foreground-secondary uppercase"
              >
                Collections
              </h2>
              <FooterLinkList
                labelledBy="footer-collections-heading"
                items={collections}
              />
            </nav>
          ) : null}

          <div className="col-span-2 space-y-6 lg:col-span-1 lg:space-y-8">
            <nav aria-label="Customer care">
              <h2
                id="footer-care-heading"
                className="text-caption font-semibold tracking-[0.14em] text-foreground-secondary uppercase"
              >
                Customer Care
              </h2>
              <ul aria-labelledby="footer-care-heading" className="mt-2 space-y-0.5">
                <li>
                  <a
                    href="#storefront-contact"
                    className="inline-flex min-h-[var(--mm-tap-min)] items-center text-small text-foreground-secondary transition-colors duration-[var(--mm-duration)] hover:text-primary"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </nav>
            <div>
              <h2
                id="storefront-contact"
                className="text-caption font-semibold tracking-[0.14em] text-foreground-secondary uppercase"
              >
                Contact
              </h2>
              <address className="mt-2 not-italic text-small text-foreground-secondary">
                <p>{contact.name}</p>
                {addressLines.map((line) => (
                  <p key={line} className="mt-1">
                    {line}
                  </p>
                ))}
                <p className="mt-2">
                  <a
                    href={telephoneHref}
                    className="inline-flex min-h-[var(--mm-tap-min)] items-center transition-colors duration-[var(--mm-duration)] hover:text-primary"
                  >
                    {contact.telephone}
                  </a>
                </p>
              </address>
            </div>
          </div>
        </div>

        <div className="border-t border-border py-3">
          <p className="text-center text-caption text-foreground-muted">
            © 2026 {contact.name}
          </p>
        </div>
      </Container>
    </footer>
  );
}
