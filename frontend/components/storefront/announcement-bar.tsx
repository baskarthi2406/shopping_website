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
      <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-[var(--mm-space-page)] py-2 text-center text-caption sm:text-small">
        {ANNOUNCEMENT_ITEMS.map((item) => (
          <li key={item} className="min-h-[1.5rem]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
