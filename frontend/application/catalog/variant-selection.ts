import {
  VARIANT_COMBINATION_UNAVAILABLE_MESSAGE,
  VARIANT_SELECTION_PROMPT,
} from "./catalog-messages";

export type VariantOptionGroupViewModel = {
  /** Normalized attribute name (trimmed, lower case); stable selection key. */
  readonly key: string;
  /** Attribute name as supplied by the first variant that uses it. */
  readonly label: string;
  /** Distinct values in data order. */
  readonly values: readonly string[];
};

export type VariantChoiceViewModel = {
  readonly id: string;
  /** Value per group key. Every group has exactly one value. */
  readonly values: Readonly<Record<string, string>>;
};

export type VariantSelectorViewModel = {
  readonly groups: readonly VariantOptionGroupViewModel[];
  readonly variants: readonly VariantChoiceViewModel[];
};

/** Selected value per group key; `null` or absent means not chosen. */
export type VariantSelection = Readonly<Record<string, string | null | undefined>>;

export type VariantSelectionResult =
  | { readonly status: "matched"; readonly variantId: string; readonly message: null }
  | { readonly status: "incomplete"; readonly variantId: null; readonly message: string }
  | { readonly status: "unmatched"; readonly variantId: null; readonly message: string };

/**
 * Maps explicit choices to one real variant. Never auto-selects. Kept free of
 * pricing/inventory code so client components can import it cheaply.
 */
export function resolveVariantSelection(
  selector: VariantSelectorViewModel,
  selection: VariantSelection,
): VariantSelectionResult {
  const missing = selector.groups.filter((group) => {
    const value = selection[group.key];
    return value === null || value === undefined || !group.values.includes(value);
  });
  if (missing.length > 0) {
    return {
      status: "incomplete",
      variantId: null,
      message: `${VARIANT_SELECTION_PROMPT} ${missing.map((group) => group.label).join(", ")}`,
    };
  }

  const match = selector.variants.find((variant) =>
    selector.groups.every((group) => variant.values[group.key] === selection[group.key]),
  );
  return match === undefined
    ? { status: "unmatched", variantId: null, message: VARIANT_COMBINATION_UNAVAILABLE_MESSAGE }
    : { status: "matched", variantId: match.id, message: null };
}
