import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "../../logo";
import { getSession } from "@/lib/session";
import { ProtectedNavigation } from "../../(protected)/protected-navigation";

export const metadata: Metadata = { title: "会员方案｜照见", description: "选择适合你的照见会员方案。" };
const Check = () => <span className="benefit-check" aria-hidden="true">✓</span>;

export default async function MembershipPage() {
  const session = await getSession();
  return <main className="membership-page">
    <header className="landing-nav membership-nav">
      <Logo className="wordmark" href="/" />
      {session ? <ProtectedNavigation /> : <nav aria-label="主导航"><Link href="/">首页</Link><Link className="nav-active" href="/membership">会员</Link><Link className="btn btn-large" href="/login">开始记录</Link></nav>}
    </header>
    <section className="membership-hero">
      <p className="eyebrow">MEMBERSHIP</p><h1>把重要的时间，长久地留在这里</h1><p>记录一个人的成长，也收藏一个家庭一年年的团圆。</p>
    </section>
    <section className="pricing-grid" aria-label="会员方案">
      <article className="pricing-card card">
        <p className="plan-label">免费会员</p><h2>免费</h2><p className="plan-note">注册后自动获得</p><div className="plan-divider" />
        <ul><li><Check />创建 1 个个人照见</li><li><Check />每岁上传一张成长照片</li><li><Check />私密保存成长记忆</li></ul>
        <Link className="btn btn-secondary plan-button" href="/register">免费开始</Link>
      </article>
      <article className="pricing-card pricing-featured card">
        <span className="plan-badge">一次购买 · 终身使用</span><p className="plan-label">终身会员</p><h2><small>¥</small>99 <em>终身</em></h2><p className="plan-note">无需续费，永久有效</p><div className="plan-divider" />
        <ul><li><Check />创建无限个个人照见</li><li><Check />创建 1 个家庭照见</li><li><Check />从结婚照开始，每年上传一张全家福</li><li><Check />包含免费会员全部功能</li></ul>
        <Link className="btn plan-button" href="/register">先注册体验</Link>
      </article>
    </section>
    <p className="membership-footnote">终身会员购买功能即将开放 · 现在可以先免费开始记录</p>
  </main>;
}
