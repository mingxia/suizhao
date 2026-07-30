import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "@/db";
import { timelines, user } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { PersonModal } from "../person-modal";
import { AccountActions } from "../account-actions";

const membershipLabel = { free: "免费会员", lifetime: "终身会员" } as const;

export default async function MyWitnessesPage() {
  const session = await requireSession();
  const db = await getDb();
  const [account] = await db.select({ membership: user.membership, email: user.email }).from(user).where(eq(user.id, session.user.id)).limit(1);
  const ownedPersons = await db.select({ id: timelines.id, name: timelines.name, nickname: timelines.nickname, updatedAt: timelines.updatedAt }).from(timelines).where(eq(timelines.ownerId, session.user.id)).orderBy(desc(timelines.updatedAt));
  const membership = account?.membership ?? "free";

  return <main className="container my-page">
    <section className="my-section">
      <div className="my-section-heading">
        <div><p className="dashboard-eyebrow">我的照见</p></div>
      </div>
      {ownedPersons.length > 0 ? <div className="my-person-grid">
        {ownedPersons.map((person) => <Link className="my-person-card card" href={`/persons/${person.id}`} key={person.id}>
          <span aria-hidden="true">照</span>
          <strong>{person.name}</strong>
          {person.nickname && <small>{person.nickname}</small>}
        </Link>)}
      </div> : <div className="card my-empty-card"><p className="muted">还没有创建照见。</p><PersonModal mode="create" className="btn">创建第一个照见</PersonModal></div>}
    </section>

    <section className="my-section account-section card">
      <div>
        <p className="dashboard-eyebrow">ACCOUNT</p>
        <h2>基础操作</h2>
        <p className="muted">当前账号：{account?.email ?? session.user.email}</p>
        <p className="membership-pill">{membershipLabel[membership]}</p>
      </div>
      <AccountActions />
    </section>
  </main>;
}
