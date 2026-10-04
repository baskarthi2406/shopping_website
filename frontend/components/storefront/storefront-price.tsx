const SIZE_CLASS = {
  card: "text-body font-semibold leading-snug",
  detail: "font-display text-h2 font-semibold leading-tight",
  line: "text-body font-semibold leading-snug",
  total: "text-h3 font-semibold leading-tight",
} as const;

export type StorefrontPriceSize = keyof typeof SIZE_CLASS;

/**
 * Shared typography for an already formatted selling price. The amount string
 * is shown as given; this does not parse, round, or invent a price.
 */
export function StorefrontPrice({
  amount,
  size = "card",
  label,
}: {
  amount: string;
  size?: StorefrontPriceSize;
  label?: string;
}) {
  return (
    <span
      className={`${SIZE_CLASS[size]} inline-block tabular-nums tracking-tight whitespace-nowrap text-foreground`}
    >
      {label !== undefined ? <span className="sr-only">{label}</span> : null}
      {amount}
    </span>
  );
}
