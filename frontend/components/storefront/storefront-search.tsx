export function StorefrontSearch({ className = "" }: { className?: string }) {
  return (
    <form
      action="/search"
      method="get"
      role="search"
      className={`flex min-w-0 items-center gap-2 ${className}`}
    >
      <label htmlFor="storefront-search" className="sr-only">
        Search products
      </label>
      <input
        id="storefront-search"
        name="q"
        type="search"
        placeholder="Search products"
        autoComplete="off"
        enterKeyHint="search"
        maxLength={80}
        className="min-h-[var(--mm-tap-min)] min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-body text-foreground placeholder:text-foreground-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      />
      <button
        type="submit"
        className="inline-flex min-h-[var(--mm-tap-min)] shrink-0 items-center justify-center rounded-md bg-primary px-4 text-small font-semibold text-primary-foreground transition-colors duration-[var(--mm-duration)] hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        Search
      </button>
    </form>
  );
}
