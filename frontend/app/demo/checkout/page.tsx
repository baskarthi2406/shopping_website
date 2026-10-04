import { DemoCheckout } from "@/components/demo/demo-checkout";
import { demoStore } from "@/config/demo-store";

export default function DemoCheckoutPage() {
  return <DemoCheckout providerLabel={demoStore.providerLabel} />;
}
