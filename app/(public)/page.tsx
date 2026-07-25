import Link from "next/link";

const years = [
  { age: "1岁", year: "2020", tone: "baby" },
  { age: "2岁", year: "2021", tone: "toddler" },
  { age: "3岁", year: "2022", tone: "child" },
  { age: "4岁", year: "2023", tone: "sunny" },
  { age: "5岁", year: "2024", tone: "field" },
];

export default function Home() {
  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Link className="wordmark" href="/">岁照</Link>
        <nav aria-label="主导航">
          <Link className="nav-active" href="/">首页</Link>
          <Link href="/login">登录</Link>
          <Link className="btn btn-large" href="/register">开始记录</Link>
        </nav>
      </header>

      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">极简个人成长记录</p>
          <h1>每岁一张，<br />照见成长。</h1>
          <span className="title-rule" />
          <p className="hero-description">一年只留一张照片，<br />慢慢看见一个人的一生。</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/register">开始记录</Link>
            <a className="btn btn-secondary" href="#example">查看示例 <span aria-hidden>›</span></a>
          </div>
        </div>

        <div className="album-wrap" id="example">
          <div className="album">
            <div className="album-head"><strong>岁照</strong><span>极简个人成长记录</span><span className="album-user">♙ 我的</span></div>
            <div className="year-strip">
              {years.map(({ age, year, tone }) => (
                <div className="year-card" key={age}>
                  <strong>{age}</strong><small>{year}</small>
                  <div className={`portrait ${tone}`}><span aria-hidden>☺</span></div>
                </div>
              ))}
              <div className="year-card pending"><strong>6岁</strong><small>2025</small><div className="add-photo"><b>＋</b><span>待记录</span></div></div>
            </div>
            <div className="timeline"><i /><i /><i /><i /><i /><i /></div>
            <p className="album-caption">每岁一张，照见成长。</p>
          </div>
        </div>
      </section>

      <section className="feature-grid" aria-label="产品特点">
        <article><span className="feature-icon">▣</span><div><h2>每岁一张</h2><p>每一年，只留一个瞬间</p></div></article>
        <article><span className="feature-icon">♙</span><div><h2>私密记录</h2><p>默认私有，安静保存成长</p></div></article>
        <article><span className="feature-icon">◷</span><div><h2>时间长卷</h2><p>多年以后，一眼看见变化</p></div></article>
      </section>

      <section className="memory-panel">
        <div className="memory-copy"><span className="quote-mark">“</span><div><h2>时间会走远，照片会留下。</h2><p>当你回望，那些年的你，会在这里等你。</p><span className="title-rule" /></div></div>
        <div className="keepsake" aria-hidden><div className="photo-stack"><div className="memory-photo">☺</div></div><div className="book">岁照<small>我的成长记录</small></div><span className="leaf">⌁</span></div>
      </section>
    </main>
  );
}
