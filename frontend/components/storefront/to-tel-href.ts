export function toTelHref(telephone: string): string {
  return `tel:${telephone.replace(/\D/g, "")}`;
}
