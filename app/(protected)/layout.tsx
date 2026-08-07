import { requireSession } from "@/lib/session";
import { ProtectedNavigation } from "./protected-navigation";
import { Logo } from "../logo";
import { getDb } from "@/db";
import { timelines } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const ownedTimelines = await (await getDb()).select({ id: timelines.id, name: timelines.name, nickname: timelines.nickname, type: timelines.type }).from(timelines).where(eq(timelines.ownerId, session.user.id)).orderBy(asc(timelines.name));
  const personalTimelines = ownedTimelines.filter((timeline) => timeline.type === "person");

  return (
    <div className="protected-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <Logo className="site-wordmark" href="/dashboard" />
          <ProtectedNavigation isAdmin={Boolean(session.user.isAdmin)} isLifetimeMember={session.user.membership === "lifetime"} hasPersonalTimeline={personalTimelines.length > 0} hasFamilyTimeline={ownedTimelines.some((timeline) => timeline.type === "family")} associationOptions={personalTimelines} />
        </div>
      </header>

      <div className="protected-content">{children}</div>

    </div>
  );
}
