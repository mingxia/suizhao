import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { Logo } from "../../logo";
import { LanguageSwitcher } from "../../language-provider";
import { ProtectedNavigation } from "../../(protected)/protected-navigation";
import { getLocalizedMetadata } from "@/lib/metadata";

export function generateMetadata(): Promise<Metadata> {
  return getLocalizedMetadata({
    path: "/about",
    zh: {
      title: "关于照见｜一个人和一个家的成长档案",
      description: "了解照见的由来，以及我们如何通过每年一张照片，记录个人与家庭的成长。",
    },
    en: {
      title: "About Seeva | A growth archive for people and families",
      description: "Learn why Seeva was created and how one photo each year preserves personal and family growth.",
    },
  });
}

export default async function AboutPage() {
  const session = await getSession();

  return (
    <main className="about-page">
      <header className="landing-nav about-nav">
        <Logo className="wordmark" href="/" />
        {session ? <ProtectedNavigation /> : (
          <nav aria-label="主导航">
            <Link href="/">首页</Link>
            <Link href="/membership">会员</Link>
            <Link className="nav-active" href="/about">关于</Link>
            <Link className="btn btn-large" href="/login">开始记录</Link>
            <LanguageSwitcher />
          </nav>
        )}
      </header>

      <article className="about-article">
        <header className="about-hero">
          <p className="eyebrow">ABOUT SEEVA</p>
          <h1>关于照见</h1>
          <p>一个人和一个家的成长档案</p>
        </header>

        <section className="about-intro">
          <p>照见是一款极简的个人与家庭成长记录工具。</p>
          <p>通过年度照片时间线，帮助用户记录个人成长、家庭变化、家人见证与共同创作。</p>
          <strong>让一个人记录，让一家人见证。</strong>
        </section>

        <section>
          <h2>为什么叫「照见」</h2>
          <p>“照见”这个名字，来自于“看见”的意义。</p>
          <p>我们希望通过一张张照片，让时间留下痕迹，让过去重新被看见。</p>
          <div className="about-emphasis">
            <p>照见的不只是照片。</p>
            <p>也是一个人的成长轨迹，一个家庭的变化过程，那些曾经普通，却值得被珍藏的时光。</p>
          </div>
          <p>时间不会停留。但我们可以通过记录，在未来重新看见它。</p>
        </section>

        <section>
          <h2>两种照见</h2>
          <div className="about-types">
            <article>
              <span>01</span>
              <h3>个人照见</h3>
              <p>记录一个人的成长。</p>
              <p>从“初见”开始，到每一岁的时间节点。每一年留下一张照片，配上一段文字。</p>
              <p>多年以后，可以清晰看到一个孩子如何慢慢长大，一个人如何走过自己的生命历程。</p>
            </article>
            <article>
              <span>02</span>
              <h3>家庭照见</h3>
              <p>记录一个家的成长。</p>
              <p>从两个人开始。从相识、结婚，到孩子出生，再到家庭成员共同成长。</p>
              <p>每一年保存一张家庭合影，看见一个家庭如何慢慢形成，并留下属于这个家的故事。</p>
            </article>
          </div>
        </section>

        <section className="about-seeva">
          <h2>关于 Seeva</h2>
          <p>照见的英文名字是 <strong data-no-translate>Seeva</strong>，它由 <strong data-no-translate>See + Viva</strong> 组成。</p>
          <dl>
            <div><dt data-no-translate>See</dt><dd>看见。</dd></div>
            <div><dt data-no-translate>Viva</dt><dd>生命、活力。</dd></div>
          </dl>
          <blockquote>看见生命的成长。</blockquote>
          <p>它与中文名“照见”有着相同的理念：通过记录，看见时间留下的痕迹。</p>
          <p>官方网站：<a href="https://weseeva.com" data-no-translate>https://weseeva.com</a></p>
          <p><strong data-no-translate>We Seeva</strong> 也代表“我们一起看见”。因为成长，从来不是一个人的故事。</p>
        </section>

        <section>
          <h2>关于我们</h2>
          <p>照见诞生于一个非常简单的想法：时间过得太快。</p>
          <p>孩子一年一年长大，家庭一天一天变化。如果没有记录，很多珍贵的瞬间最终会被遗忘。</p>
          <p>于是，我们创造了照见。从一个想法，到第一个版本上线，只用了十天。</p>
          <p>它不是为了记录更多照片，而是希望帮助每个人留下那些真正值得记住的时刻。</p>
        </section>

        <footer className="about-closing">
          <Logo className="about-closing-logo" href="/" />
          <p>每岁一张，照见成长。</p>
          <Link className="btn btn-primary" href="/register">开始记录</Link>
        </footer>
      </article>
    </main>
  );
}
