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

export async function reviewLifetimeOrder(orderId: string, decision: "approve" | "delete") {
  const session = await requireSession();
  if (!session.user.isAdmin) return { success: false, error: "没有管理员权限" } as const;
  if (decision !== "approve" && decision !== "delete") return { success: false, error: "无效的订单操作" } as const;

  const db = await getDb();
  const [order] = await db.select({ id: orders.id, userId: orders.userId }).from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.status, "pending"))).limit(1);
  if (!order) return { success: false, error: "订单不存在或已被处理，请刷新后重试" } as const;

  if (decision === "approve") {
    const now = new Date();
    await db.batch([
      db.update(orders).set({ status: "approved", reviewedBy: session.user.id, reviewedAt: now, updatedAt: now })
        .where(and(eq(orders.id, order.id), eq(orders.status, "pending"))),
      db.update(user).set({ membership: "lifetime" }).where(eq(user.id, order.userId)),
    ]);
  } else {
    await db.delete(orders).where(and(eq(orders.id, order.id), eq(orders.status, "pending")));
  }

  revalidatePath("/admin");
  revalidatePath("/membership");
  return { success: true } as const;
}
