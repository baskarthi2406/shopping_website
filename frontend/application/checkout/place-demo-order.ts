import { evaluatePurchasability, type PurchasabilityReason } from "@/application/catalog";
import type { Money, Product } from "@/domain/catalog";
import type { DemoCustomer, PlaceDemoOrderRequest } from "./demo-order";

export type DemoSalesOrderLine = {
  readonly variantId: string;
  readonly quantity: number;
  readonly unitPrice: Money;
};

export type DemoSalesOrder = {
  readonly reference: string;
  readonly customer: DemoCustomer;
  readonly lines: readonly DemoSalesOrderLine[];
};

export type CreatedSalesOrder = {
  readonly orderNumber: string;
};

/** Provider operations the demo checkout needs. */
export type DemoOrderGateway = {
  /** Fresh provider read of one sellable variant, as a single-variant product. */
  findVariantProduct(variantId: string): Promise<Product | null>;
  createSalesOrder(order: DemoSalesOrder): Promise<CreatedSalesOrder>;
};

export type LineRejection = {
  readonly variantId: string;
  readonly reason: PurchasabilityReason | "price_changed";
};

export type PlaceDemoOrderResult =
  | {
      readonly kind: "placed";
      readonly reference: string;
      readonly orderNumber: string;
      readonly customerName: string;
    }
  | { readonly kind: "rejected"; readonly rejections: readonly LineRejection[] }
  /** `cause` is for server-side logging only; never return it to clients. */
  | { readonly kind: "failed"; readonly cause: unknown };

/**
 * Remembers results per checkout reference so a repeated submission (double
 * click, retry) returns the first outcome instead of creating another order.
 * In-memory: one server process, demo only.
 */
export type DemoOrderLedger = Map<string, Promise<PlaceDemoOrderResult>>;

function sameMoney(a: Money, b: Money): boolean {
  return a.currency === b.currency && Math.round(a.amount * 100) === Math.round(b.amount * 100);
}

async function placeOnce(
  request: PlaceDemoOrderRequest,
  gateway: DemoOrderGateway,
): Promise<PlaceDemoOrderResult> {
  const rejections: LineRejection[] = [];
  const lines: DemoSalesOrderLine[] = [];
  for (const line of request.lines) {
    const product = await gateway.findVariantProduct(line.variantId);
    const variant = product?.variants.find((item) => item.id === line.variantId);
    const { reasons } = evaluatePurchasability({
      product,
      variantId: variant === undefined ? line.variantId : variant.id,
      quantity: line.quantity,
    });
    if (reasons.length > 0) {
      rejections.push({ variantId: line.variantId, reason: reasons[0] });
      continue;
    }
    const price = variant!.pricing!.price;
    if (!sameMoney(price, line.unitPrice)) {
      rejections.push({ variantId: line.variantId, reason: "price_changed" });
      continue;
    }
    lines.push({ variantId: line.variantId, quantity: line.quantity, unitPrice: price });
  }
  if (rejections.length > 0) {
    return { kind: "rejected", rejections };
  }

  try {
    const created = await gateway.createSalesOrder({
      reference: request.reference,
      customer: request.customer,
      lines,
    });
    return {
      kind: "placed",
      reference: request.reference,
      orderNumber: created.orderNumber,
      customerName: request.customer.name,
    };
  } catch (cause) {
    return { kind: "failed", cause };
  }
}

/**
 * Re-validates every line against a fresh provider read (status, price,
 * available-to-sell), then creates one sales order. Lookup errors propagate;
 * order-creation errors become `failed` and stay cached, because the provider
 * may have created the order before the error. Only rejections (no create
 * attempted) and lookup errors are forgotten so the shopper can retry.
 */
export async function placeDemoOrder(
  request: PlaceDemoOrderRequest,
  gateway: DemoOrderGateway,
  ledger: DemoOrderLedger,
): Promise<PlaceDemoOrderResult> {
  const existing = ledger.get(request.reference);
  if (existing !== undefined) {
    return existing;
  }
  const attempt = placeOnce(request, gateway);
  ledger.set(request.reference, attempt);
  try {
    const result = await attempt;
    if (result.kind === "rejected") {
      ledger.delete(request.reference);
    }
    return result;
  } catch (error) {
    ledger.delete(request.reference);
    throw error;
  }
}
