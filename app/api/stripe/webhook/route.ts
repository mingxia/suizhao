import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { fulfillLifetimeCheckout, verifyStripeSignature } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  const { env } = await getCloudflareContext({ async: true });
  if (!signature || !await verifyStripeSignature(payload, signature, env.STRIPE_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  const event = JSON.parse(payload) as { type?: string; data?: { object?: Parameters<typeof fulfillLifetimeCheckout>[0] } };
  if (event.type === "checkout.session.completed" && event.data?.object) await fulfillLifetimeCheckout(event.data.object);
  return NextResponse.json({ received: true });
}
