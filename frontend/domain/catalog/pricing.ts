/**
 * Storefront monetary value. `currency` is an ISO-style three-letter code;
 * adapters own conversion from provider-specific rate fields.
 */
export type Money = {
  readonly amount: number;
  readonly currency: string;
};

/**
 * `price` is the current display price. `compareAtPrice` is optional reference
 * pricing only; this contract does not calculate discounts.
 */
export type Pricing = {
  readonly price: Money;
  readonly compareAtPrice: Money | null;
};
