import { getZohoDemo } from "@/config/zoho-demo";
import { createPostDemoOrderHandler } from "./post-demo-order-handler";

export const dynamic = "force-dynamic";

export const POST = createPostDemoOrderHandler(getZohoDemo);
