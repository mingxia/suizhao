import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <Logo className="footer-logo" href="/" />
          <p>每岁一张，照见成长。</p>
        </div>
        <nav className="footer-links" aria-label="页脚导航">
          <Link href="/">首页</Link>
          <Link href="/membership">会员</Link>
          <Link href="/register">开始记录</Link>
        </nav>
        <p className="footer-copyright">© {new Date().getFullYear()} 照见<br /><span>珍藏每一个值得被记住的年份</span></p>
      </div>
    </footer>
  );
}
