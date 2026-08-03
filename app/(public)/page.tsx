import Link from "next/link";
import { Logo } from "../logo";
import { getSession } from "@/lib/session";
import { ProtectedNavigation } from "../(protected)/protected-navigation";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, index) => ({
  age: `${index + 1}岁`,
  year: String(currentYear - 5 + index),
  image: `/images/home/hero0${index + 1}.webp`,
}));

function FeatureIcon({ type }: { type: "camera" | "lock" | "clock" }) {
  const paths = {
    camera: <><path d="M4 8h3l1.3-2h7.4L17 8h3v10H4z" /><circle cx="12" cy="13" r="3.5" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[type]}</svg>;
}

export default async function Home() {
  const session = await getSession();
  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Logo className="wordmark" href="/" />
        {session ? <ProtectedNavigation /> : <nav aria-label="主导航">
          <Link className="nav-active" href="/">首页</Link>
          <Link href="/membership">会员</Link>
          <Link className="btn btn-large" href="/login">开始记录</Link>
        </nav>}
      </header>

      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">个人与家庭的成长档案</p>
          <h1>每岁一张，<br />照见成长。</h1>
          <span className="title-rule" />
          <p className="hero-description">一年只留一张照片，<br />让家人共同见证一个人的成长。</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/register">开始记录</Link>
            <a className="btn btn-secondary" href="#example">查看示例 <span aria-hidden="true">›</span></a>
          </div>
        </div>

        <div className="album-scene" id="example">
          <div className="album-frame">
            <div className="album">
              <div className="album-head">
                <strong>照见</strong><span>个人与家庭的成长档案</span>
                <span className="album-user" aria-label="我的">♙&nbsp; 我的</span>
              </div>
              <div className="year-strip">
                {years.map(({ age, year, image }) => (
                  <article className="year-card" key={age}>
                    <strong>{age}</strong><small>{year}</small>
                    <div className="portrait" role="img" aria-label={`${age}成长照片`} style={{ backgroundImage: `url(${image})` }} />
                  </article>
                ))}
                <article className="year-card pending">
                  <strong>6岁</strong><small>{currentYear}</small>
                  <div className="add-photo"><b>＋</b><span>待记录</span></div>
                </article>
              </div>
              <div className="timeline">{Array.from({ length: 6 }, (_, index) => <i key={index} />)}</div>
              <p className="album-caption">一个人记录，一家人见证</p>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-grid" aria-label="产品特点">
        <article><span className="feature-icon"><FeatureIcon type="camera" /></span><div><h2>每岁一张</h2><p>每一年，只留一个瞬间</p></div></article>
        <article><span className="feature-icon"><FeatureIcon type="lock" /></span><div><h2>私密记录</h2><p>默认私有，安静保存成长</p></div></article>
        <article><span className="feature-icon"><FeatureIcon type="clock" /></span><div><h2>时间长卷</h2><p>多年以后，一眼看见变化</p></div></article>
      </section>

      <section className="memory-panel">
        <div className="memory-copy"><span className="quote-mark">“</span><div><h2>时间会走远，照片会留下。</h2><p>当你回望，那些年的你，会在这里等你。</p><span className="title-rule" /></div></div>
        <div className="keepsake" aria-hidden="true">
          <div className="photo-stack"><div className="memory-photo" /></div>
          <div className="book">照见<small>我的成长记录</small></div><span className="leaf">⌁</span>
        </div>
      </section>
    </main>
  );
}
