/**
 * Option 1 announcement copy (DESIGN_OPTION_1.md).
 * Operations/honor of these policies remains TBD.
 */
const ANNOUNCEMENT_ITEMS = [
  "Free Shipping on Orders above ₹999",
  "Easy Returns",
  "COD Available",
] as const;

export function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground">
      <p className="sr-only">Store notices</p>
      <ul className="flex min-h-[var(--mm-announcement-min)] flex-wrap items-center justify-center gap-x-3 px-[var(--mm-space-page)] py-1 text-center text-caption leading-tight">
        {ANNOUNCEMENT_ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
