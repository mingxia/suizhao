"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { orders, user } from "@/db/schema";
import { requireSession } from "@/lib/session";

export async function submitLifetimeOrder() {
  const session = await requireSession();
  const db = await getDb();
  const [account] = await db.select({ membership: user.membership, name: user.name, email: user.email }).from(user).where(eq(user.id, session.user.id)).limit(1);

  if (!account) redirect("/login");
  if (account.membership === "lifetime") redirect("/membership");

  const existingPending = await db.select({ id: orders.id }).from(orders).where(and(eq(orders.userId, session.user.id), eq(orders.product, "lifetime_membership"), inArray(orders.status, ["pending", "reviewing"]))).limit(1);
  if (existingPending.length === 0) {
    const now = new Date();
    await db.insert(orders).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      product: "lifetime_membership",
      status: "pending",
      amountCents: 29900,
      currency: "CNY",
      paymentMethod: "wechat_pay_qr",
      customerName: account.name,
      customerEmail: account.email,
      createdAt: now,
      updatedAt: now,
    });
  }

  revalidatePath("/membership/checkout");
  revalidatePath("/admin");
}
