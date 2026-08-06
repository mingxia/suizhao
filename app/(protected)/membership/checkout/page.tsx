import { and, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { orders, user } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { PaymentConfirmation } from "./payment-confirmation";

export default async function LifetimeCheckoutPage() {
  const session = await requireSession();
  const db = await getDb();
  const [account] = await db.select({ name: user.name, email: user.email, membership: user.membership }).from(user).where(eq(user.id, session.user.id)).limit(1);
  if (!account) redirect("/login");
  if (account.membership === "lifetime") redirect("/membership");

  const [activeOrder] = await db.select({ id: orders.id }).from(orders).where(and(
    eq(orders.userId, session.user.id),
    eq(orders.product, "lifetime_membership"),
    inArray(orders.status, ["pending", "reviewing"]),
  )).limit(1);

  return <main className="container checkout-page">
    <section className="card checkout-card">
      <p className="dashboard-eyebrow">LIFETIME MEMBERSHIP</p>
      <h1>确认终身会员购买信息</h1>
      <p className="muted">请先核对账户信息，确认后扫码付款并提交待核实订单。</p>
      <dl className="checkout-summary">
        <div><dt>用户名</dt><dd>{account.name}</dd></div>
        <div><dt>邮箱</dt><dd>{account.email}</dd></div>
        <div><dt>购买内容</dt><dd>照见终身会员</dd></div>
        <div><dt>应付金额</dt><dd>¥299</dd></div>
      </dl>
      <PaymentConfirmation hasActiveOrder={Boolean(activeOrder)} />
    </section>
  </main>;
}
