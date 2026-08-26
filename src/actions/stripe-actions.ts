"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { user } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { createLifetimeCheckout } from "@/lib/stripe";

export async function beginStripeLifetimeCheckout() {
  const session = await requireSession();
  const db = await getDb();
  const [account] = await db.select({ email: user.email, membership: user.membership }).from(user).where(eq(user.id, session.user.id)).limit(1);
  if (!account) redirect("/login");
  if (account.membership === "lifetime") redirect("/dashboard");

  const requestHeaders = await headers();
  const configuredOrigin = process.env.BETTER_AUTH_URL;
  const origin = configuredOrigin || `${requestHeaders.get("x-forwarded-proto") || "https"}://${requestHeaders.get("host")}`;
  const checkout = await createLifetimeCheckout({ userId: session.user.id, email: account.email, origin });
  if (!checkout.url) throw new Error("Stripe did not return a checkout URL");
  redirect(checkout.url);
}
