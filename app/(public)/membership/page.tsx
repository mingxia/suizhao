import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { user, type Membership } from "@/db/schema";
import { Logo } from "../../logo";
import { getSession } from "@/lib/session";
import { ProtectedNavigation } from "../../(protected)/protected-navigation";
import { LanguageSwitcher } from "../../language-provider";
import { getLocalizedMetadata } from "@/lib/metadata";

export function generateMetadata(): Promise<Metadata> {
  return getLocalizedMetadata({
    path: "/membership",
    zh: { title: "会员方案｜照见", description: "选择适合你的照见会员方案。" },
    en: { title: "Membership | Seeva", description: "Choose the Seeva membership plan that works for you." },
  });
}
const Check = () => <span className="benefit-check" aria-hidden="true">✓</span>;

async function getCurrentMembership(userId: string): Promise<Membership> {
  const db = await getDb();
  const [account] = await db.select({ membership: user.membership }).from(user).where(eq(user.id, userId)).limit(1);
  return account?.membership ?? "free";
}

export default async function MembershipPage() {
  const session = await getSession();
  const membership = session ? await getCurrentMembership(session.user.id) : null;
  const isFreeMember = membership === "free";
  const isLifetimeMember = membership === "lifetime";
  return <main className="membership-page">
    <header className="landing-nav membership-nav">
      <Logo className="wordmark" href="/" />
      {session ? <ProtectedNavigation /> : <nav aria-label="主导航"><Link href="/">首页</Link><Link className="nav-active" href="/membership">会员</Link><Link href="/about">关于</Link><Link className="btn btn-large" href="/login">开始记录</Link><LanguageSwitcher /></nav>}
    </header>
    <section className="membership-hero">
      <p className="eyebrow">MEMBERSHIP</p><h1>把重要的时间，长久地留在这里</h1><p>记录一个人的成长，也收藏一个家庭一年年的团圆。</p>
    </section>
    <section className="pricing-grid" aria-label="会员方案">
      <article className="pricing-card card">
        <p className="plan-label">免费会员</p><h2>免费</h2><p className="plan-note">注册后自动获得</p><div className="plan-divider" />
        <ul><li><Check />创建 1 个个人照见</li><li><Check />每岁上传一张成长照片</li><li><Check />私密保存成长记忆</li><li><Check />家人见证及留言功能</li><li><Check />家人共享</li><li><Check />家人共创</li></ul>
        {session ? <span className="btn btn-secondary plan-button plan-button-disabled" aria-disabled="true">{isFreeMember ? "当前会员级别" : "免费权益已包含"}</span> : <Link className="btn btn-secondary plan-button" href="/register">免费开始</Link>}
      </article>
      <article className="pricing-card pricing-featured card">
        <span className="plan-badge">一次购买 · 终身使用</span><p className="plan-label">终身会员</p><h2 className="lifetime-price"><span className="price-cn"><small>¥</small>299</span><span className="price-overseas" data-no-translate><small>$</small>49.99</span> <em>终身</em></h2><p className="plan-note"><span className="price-cn">中文区定价</span><span className="price-overseas">海外区定价</span> · 无需续费，永久有效</p><div className="plan-divider" />
        <ul><li><Check />创建无限个个人照见</li><li><Check />创建 1 个家庭照见</li><li><Check />精美可打印相册导出</li><li><Check />包含免费会员全部功能</li></ul>
        {isLifetimeMember ? <span className="btn plan-button plan-button-disabled" aria-disabled="true">您已是终身会员</span> : <Link className="btn plan-button" href={session ? "/membership/checkout" : "/register"}>{session ? "立即升级为终身会员" : "先注册体验"}</Link>}
      </article>
    </section>
    <p className="membership-footnote">{session ? "扫码付款后提交订单 · 管理员核实后开通终身会员" : "终身会员支持微信扫码付款 · 也可以先免费开始记录"}</p>
  </main>;
}
