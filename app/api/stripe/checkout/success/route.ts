import { NextRequest, NextResponse } from "next/server";
import { fulfillLifetimeCheckout, retrieveCheckoutSession } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId?.startsWith("cs_")) return NextResponse.redirect(new URL("/membership/checkout", request.url));
  const checkout = await retrieveCheckoutSession(sessionId);
  await fulfillLifetimeCheckout(checkout);
  return NextResponse.redirect(new URL(checkout.payment_status === "paid" ? "/dashboard" : "/membership/checkout", request.url));
}
