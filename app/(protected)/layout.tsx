import Link from "next/link";
import { requireSession } from "@/lib/session";
import { ProtectedNavigation } from "./protected-navigation";
import { Logo } from "../logo";
import { getDb } from "@/db";
import { timelines } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const personalTimelines = await (await getDb()).select({ id: timelines.id, name: timelines.name, nickname: timelines.nickname }).from(timelines).where(and(eq(timelines.ownerId, session.user.id), eq(timelines.type, "person"))).orderBy(asc(timelines.name));

  return (
    <div className="protected-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <Logo className="site-wordmark" href="/dashboard" />
          <ProtectedNavigation isAdmin={Boolean(session.user.isAdmin)} associationOptions={personalTimelines} />
        </div>
      </header>

      <div className="protected-content">{children}</div>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <Link className="footer-wordmark" href="/dashboard">照见</Link>
          <p>每岁一张，照见成长。</p>
          <p className="footer-copyright">© {new Date().getFullYear()} 照见</p>
        </div>
      </footer>
    </div>
  );
}
