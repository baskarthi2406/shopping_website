import { STOREFRONT_SERVICE_CLAIMS } from "@/components/storefront/storefront-service-claims";

export function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground">
      <p className="sr-only">Store notices</p>
      <ul className="flex min-h-[var(--mm-announcement-min)] flex-wrap items-center justify-center gap-x-3 px-[var(--mm-space-page)] py-1 text-center text-caption leading-tight">
        {STOREFRONT_SERVICE_CLAIMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
