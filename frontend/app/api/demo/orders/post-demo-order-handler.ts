import { parsePlaceDemoOrderRequest } from "@/application/checkout/demo-order";
import {
  placeDemoOrder,
  type DemoOrderGateway,
  type DemoOrderLedger,
} from "@/application/checkout/place-demo-order";

export type DemoOrderDependencies = {
  readonly gateway: DemoOrderGateway;
  readonly ledger: DemoOrderLedger;
};

const MAX_BODY_BYTES = 16_384;

function json(status: number, body: unknown): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function field(error: unknown, key: string): string {
  return typeof error === "object" && error !== null && key in error
    ? String((error as Record<string, unknown>)[key] ?? "")
    : "";
}

/**
 * Logs the failure category plus the provider code/message, which the Zoho
 * client already redacts and truncates. Never logs payloads or credentials.
 */
function logFailure(stage: string, error: unknown): void {
  const name = error instanceof Error ? error.name : typeof error;
  const details = ["kind", "status", "providerCode", "providerMessage"]
    .map((key) => field(error, key))
    .filter((value) => value !== "")
    .join(" | ");
  console.error(`[demo-order] ${stage} failed: ${name}${details === "" ? "" : ` | ${details}`}`);
}

/**
 * POST /api/demo/orders. Responses carry only safe confirmation data: the
 * demo reference, the Zoho sales-order number, and the customer name.
 */
export function createPostDemoOrderHandler(getDependencies: () => DemoOrderDependencies | null) {
  return async function POST(request: Request): Promise<Response> {
    let dependencies: DemoOrderDependencies | null;
    try {
      dependencies = getDependencies();
    } catch (error) {
      logFailure("configuration", error);
      return json(503, { error: "demo_unavailable" });
    }
    if (dependencies === null) {
      return json(404, { error: "not_found" });
    }
    if (!(request.headers.get("content-type") ?? "").includes("application/json")) {
      return json(415, { error: "unsupported_media_type" });
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json(413, { error: "payload_too_large" });
    }
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return json(400, { error: "invalid_request", fields: {} });
    }

    const parsed = parsePlaceDemoOrderRequest(body);
    if (!parsed.ok) {
      return json(400, { error: "invalid_request", fields: parsed.errors });
    }

    try {
      const result = await placeDemoOrder(parsed.value, dependencies.gateway, dependencies.ledger);
      switch (result.kind) {
        case "placed":
          return json(201, {
            reference: result.reference,
            orderNumber: result.orderNumber,
            customerName: result.customerName,
          });
        case "rejected":
          return json(409, { error: "cart_changed", rejections: result.rejections });
        case "failed":
          logFailure("sales order creation", result.cause);
          return json(502, { error: "order_not_confirmed", reference: parsed.value.reference });
      }
    } catch (error) {
      logFailure("item re-validation", error);
      return json(502, { error: "provider_unavailable" });
    }
  };
}
