import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { orders, user } from "@/db/schema";

const STRIPE_API = "https://api.stripe.com/v1";

type CheckoutSession = {
  id: string;
  url?: string | null;
  payment_status?: string;
  amount_total?: number | null;
  currency?: string | null;
  customer_details?: { email?: string | null; name?: string | null } | null;
  metadata?: Record<string, string>;
};

async function stripeRequest(path: string, init?: RequestInit) {
  const { env } = await getCloudflareContext({ async: true });
  const response = await fetch(`${STRIPE_API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, ...init?.headers },
  });
  const result = await response.json() as CheckoutSession & { error?: { message?: string } };
  if (!response.ok) throw new Error(result.error?.message ?? "Stripe request failed");
  return result;
}

export async function createLifetimeCheckout(input: { userId: string; email: string; origin: string }) {
  const body = new URLSearchParams({
    mode: "payment",
    success_url: `${input.origin}/api/stripe/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}/membership/checkout`,
    customer_email: input.email,
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": "4999",
    "line_items[0][price_data][product_data][name]": "Seeva Lifetime Membership",
    "line_items[0][quantity]": "1",
    "metadata[user_id]": input.userId,
    "metadata[product]": "lifetime_membership",
  });
  return stripeRequest("/checkout/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
}

export async function retrieveCheckoutSession(id: string) {
  return stripeRequest(`/checkout/sessions/${encodeURIComponent(id)}`);
}

export async function fulfillLifetimeCheckout(session: CheckoutSession) {
  const userId = session.metadata?.user_id;
  if (session.payment_status !== "paid" || session.metadata?.product !== "lifetime_membership" || !userId || session.amount_total !== 4999 || session.currency?.toLowerCase() !== "usd") return false;

  const db = await getDb();
  const [account] = await db.select({ id: user.id, name: user.name, email: user.email }).from(user).where(eq(user.id, userId)).limit(1);
  if (!account) return false;
  const now = new Date();
  await db.batch([
    db.insert(orders).values({
      id: crypto.randomUUID(), userId, product: "lifetime_membership", status: "approved",
      amountCents: 4999, currency: "USD", paymentMethod: "stripe_checkout", paymentReference: session.id,
      customerName: session.customer_details?.name || account.name,
      customerEmail: session.customer_details?.email || account.email,
      reviewedAt: now, createdAt: now, updatedAt: now,
    }).onConflictDoNothing({ target: orders.paymentReference }),
    db.update(user).set({ membership: "lifetime" }).where(eq(user.id, userId)),
  ]);
  return true;
}

export async function verifyStripeSignature(payload: string, header: string, secret: string) {
  const fields = header.split(",").map((part) => part.split("=", 2));
  const timestamp = fields.find(([key]) => key === "t")?.[1];
  const signatures = fields.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`));
  const expected = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return signatures.some((signature) => {
    if (signature.length !== expected.length) return false;
    let difference = 0;
    for (let index = 0; index < expected.length; index += 1) difference |= signature.charCodeAt(index) ^ expected.charCodeAt(index);
    return difference === 0;
  });
}
