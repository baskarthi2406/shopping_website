"use client";

import { useEffect, useId, useState } from "react";
import {
  resolveVariantSelection,
  type VariantSelection,
  type VariantSelectorViewModel,
} from "@/application/catalog/variant-selection";
import {
  ProductCommercePanel,
  type ProductCommercePanelProps,
} from "@/components/storefront/product-commerce-panel";

type Commerce = ProductCommercePanelProps["commerce"];

export type ProductPurchaseOptionsProps = {
  selector: VariantSelectorViewModel;
  /** Commerce shown while no variant is resolved. */
  commerce: Commerce;
  commerceByVariant: Readonly<Record<string, Commerce>>;
  telephone: string;
  /** Fires with the resolved variant id, or null while the choice is incomplete. */
  onResolvedVariantId?: (variantId: string | null) => void;
};

export function ProductPurchaseOptions({
  selector,
  commerce,
  commerceByVariant,
  telephone,
  onResolvedVariantId,
}: ProductPurchaseOptionsProps) {
  const baseId = useId();
  const [selection, setSelection] = useState<VariantSelection>({});
  const result = resolveVariantSelection(selector, selection);
  const variantId = result.status === "matched" ? result.variantId : null;
  const current = variantId !== null ? (commerceByVariant[variantId] ?? commerce) : commerce;

  useEffect(() => {
    onResolvedVariantId?.(variantId);
  }, [onResolvedVariantId, variantId]);

  return (
    <div className="mt-6">
      <div className="space-y-4">
        {selector.groups.map((group, groupIndex) => (
          <fieldset key={group.key} className="min-w-0">
            <legend className="text-small font-semibold text-foreground">{group.label}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.values.map((value, valueIndex) => {
                const id = `${baseId}-${groupIndex}-${valueIndex}`;
                return (
                  <label key={value} htmlFor={id} className="cursor-pointer">
                    <input
                      id={id}
                      type="radio"
                      name={`${baseId}-${groupIndex}`}
                      value={value}
                      checked={selection[group.key] === value}
                      onChange={() =>
                        setSelection((previous) => ({ ...previous, [group.key]: value }))
                      }
                      className="peer sr-only"
                    />
                    <span className="inline-flex min-h-[var(--mm-tap-min)] min-w-[var(--mm-tap-min)] items-center justify-center rounded-md border border-border bg-background px-3 text-small text-foreground transition-colors duration-[var(--mm-duration)] hover:border-primary peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus">
                      {value}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <p aria-live="polite" className="mt-3 min-h-[1.25rem] text-small text-foreground-secondary">
        {result.status === "matched"
          ? `Selected: ${selector.groups.map((group) => selection[group.key]).join(", ")}`
          : result.message}
      </p>

      <div aria-live="polite">
        <ProductCommercePanel commerce={current} telephone={telephone} />
      </div>
    </div>
  );
}
