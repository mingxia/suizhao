import Link from "next/link";
import { requireSession } from "@/lib/session";
import { ProtectedNavigation } from "./protected-navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireSession();

  return (
    <div className="protected-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="site-wordmark" href="/dashboard" aria-label="岁照首页">
            岁照
          </Link>
          <ProtectedNavigation />
        </div>
      </header>

      <div className="protected-content">{children}</div>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <Link className="footer-wordmark" href="/dashboard">岁照</Link>
          <p>每岁一张，照见成长。</p>
          <p className="footer-copyright">© {new Date().getFullYear()} 岁照</p>
        </div>
      </footer>
    </div>
  );
}
