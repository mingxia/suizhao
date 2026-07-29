import Link from "next/link";
import { requireSession } from "@/lib/session";
import { ProtectedNavigation } from "./protected-navigation";
import { Logo } from "../logo";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireSession();

  return (
    <div className="protected-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <Logo className="site-wordmark" href="/my" />
          <ProtectedNavigation />
        </div>
      </header>

      <div className="protected-content">{children}</div>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <Link className="footer-wordmark" href="/my">照见</Link>
          <p>每岁一张，照见成长。</p>
          <p className="footer-copyright">© {new Date().getFullYear()} 照见</p>
        </div>
      </footer>
    </div>
  );
}
