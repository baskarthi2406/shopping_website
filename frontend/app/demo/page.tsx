import { DemoAddToCart } from "@/components/demo/demo-add-to-cart";
import { headingClass } from "@/components/demo/demo-ui";
import { demoStore } from "@/config/demo-store";

export const dynamic = "force-dynamic";

export default async function DemoProductsPage() {
  const products = await demoStore.loadProducts();
  const provider = demoStore.providerLabel;

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className={headingClass}>Products from {provider}</h1>
        <p className="text-small text-foreground-secondary">
          Images are not yet loaded from {provider}. Stock is organization-level; location-specific
          inventory validation is deferred.
        </p>
      </div>

      {products === null ? (
        <p role="alert" className="text-body text-error">
          Products could not be loaded from {provider} right now. Please try again shortly.
        </p>
      ) : products.length === 0 ? (
        <p className="text-body text-foreground-secondary">No products were returned.</p>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2">
          {products.map((product) => (
            <li key={product.productId} className="rounded-md border border-border bg-surface p-4">
              <h2 className="font-display text-h3 font-semibold text-foreground">{product.name}</h2>
              <ul className="mt-3 divide-y divide-border">
                {product.variants.map((variant) => (
                  <li key={variant.variantId} className="space-y-2 py-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-body text-foreground">{variant.label}</p>
                      <p className="text-body font-semibold text-foreground">
                        {variant.price ?? "Price unavailable"}
                      </p>
                    </div>
                    <p className="text-small text-foreground-secondary">
                      {variant.sku ? `SKU ${variant.sku} · ` : ""}
                      {variant.stockLabel}
                    </p>
                    <DemoAddToCart variant={variant} />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
