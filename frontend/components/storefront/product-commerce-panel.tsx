import { toTelHref } from "@/components/storefront/to-tel-href";

export type ProductCommercePanelProps = {
  commerce: {
    price: string | null;
    compareAtPrice: string | null;
    priceMessage: string | null;
    availability: "out_of_stock" | "not_available" | "unconfirmed" | null;
    availabilityMessage: string | null;
    sku?: string | null;
  };
  telephone: string;
};

export function ProductCommercePanel({ commerce, telephone }: ProductCommercePanelProps) {
  const unavailable =
    commerce.availability === "out_of_stock" || commerce.availability === "not_available";

  return (
    <section
      aria-labelledby="product-commerce-heading"
      className="mt-6 rounded-lg border border-border bg-surface px-4 py-4 sm:px-5"
    >
      <h2 id="product-commerce-heading" className="sr-only">
        Price and availability
      </h2>

      {commerce.price !== null ? (
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-h2 font-semibold text-foreground">
            <span className="sr-only">Price: </span>
            {commerce.price}
          </span>
          {commerce.compareAtPrice !== null ? (
            <s className="text-body text-foreground-muted">
              <span className="sr-only">Original price: </span>
              {commerce.compareAtPrice}
            </s>
          ) : null}
        </p>
      ) : (
        <p className="text-body font-semibold text-foreground">{commerce.priceMessage}</p>
      )}

      {commerce.sku ? (
        <p className="mt-2 text-small text-foreground-secondary">
          <span className="sr-only">SKU: </span>
          {commerce.sku}
        </p>
      ) : null}

      {commerce.availabilityMessage !== null ? (
        <p
          className={`mt-2 text-small ${
            unavailable ? "font-semibold text-foreground" : "text-foreground-secondary"
          }`}
        >
          {commerce.availabilityMessage}
        </p>
      ) : null}

      <p className="mt-3 text-small text-foreground-secondary">
        Ask about this item:{" "}
        <a
          href={toTelHref(telephone)}
          className="inline-flex min-h-[var(--mm-tap-min)] items-center font-semibold text-primary transition-colors duration-[var(--mm-duration)] hover:text-primary-hover"
        >
          Call {telephone}
        </a>
      </p>
    </section>
  );
}
