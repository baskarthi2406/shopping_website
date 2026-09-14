/**
 * Storefront monetary value. `amount` is a non-negative major-unit number as
 * established in S4-T03. `currency` is an ISO-style three-letter code.
 * This type stores values only; adapters own conversion, and the domain does
 * not perform discount, tax, or currency arithmetic.
 */
export type Money = {
  readonly amount: number;
  readonly currency: string;
};

/**
 * `price` is the current selling price. `compareAtPrice` is optional reference
 * pricing only; this contract does not calculate discounts or percentages.
 */
export type Pricing = {
  readonly price: Money;
  readonly compareAtPrice: Money | null;
};
