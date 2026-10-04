import type { Money } from "@/domain/catalog";

export const primaryButton =
  "inline-flex min-h-[var(--mm-tap-min)] items-center justify-center rounded-md bg-primary px-4 text-small font-semibold text-primary-foreground transition-colors duration-[var(--mm-duration)] hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButton =
  "inline-flex min-h-[var(--mm-tap-min)] items-center justify-center rounded-md border border-border bg-background px-3 text-small text-foreground transition-colors duration-[var(--mm-duration)] hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50";

export const headingClass = "font-display text-h2 font-semibold tracking-tight text-foreground";

/** Demo currency formatting (provider organization currency). */
export function formatDemoMoney(money: Money): string {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: money.currency }).format(
      money.amount,
    );
  } catch {
    return `${money.currency} ${money.amount}`;
  }
}
