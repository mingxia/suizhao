import { and, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "@/db";
import { timelineInvitations, timelineMembers, timelines, user } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { PersonModal } from "../person-modal";
import { AccountActions } from "../account-actions";
import { respondToTimelineInvitation } from "@/actions/member-actions";

const membershipLabel = { free: "免费会员", lifetime: "终身会员" } as const;

export default async function MyWitnessesPage() {
  const session = await requireSession();
  const db = await getDb();
  const [account] = await db.select({ membership: user.membership, email: user.email }).from(user).where(eq(user.id, session.user.id)).limit(1);
  const ownedPersons = await db.select({ id: timelines.id, name: timelines.name, nickname: timelines.nickname, updatedAt: timelines.updatedAt }).from(timelines).where(eq(timelines.ownerId, session.user.id)).orderBy(desc(timelines.updatedAt));
  const membership = account?.membership ?? "free";
  const sharedPersons = await db.select({ id: timelines.id, name: timelines.name, role: timelineMembers.role, relation: timelineMembers.relation }).from(timelineMembers).innerJoin(timelines, eq(timelines.id, timelineMembers.timelineId)).where(and(eq(timelineMembers.userId, session.user.id), eq(timelineMembers.status, "accepted")));
  const invitations = await db.select({ id: timelineInvitations.id, name: timelines.name, role: timelineInvitations.role, relation: timelineInvitations.relation }).from(timelineInvitations).innerJoin(timelines, eq(timelines.id, timelineInvitations.timelineId)).where(and(eq(timelineInvitations.inviteeUserId, session.user.id), eq(timelineInvitations.status, "pending")));
  async function respond(form: FormData) { "use server"; await respondToTimelineInvitation(String(form.get("invitationId")), form.get("decision") === "accept"); }

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

    {(sharedPersons.length > 0 || invitations.length > 0) && <section className="my-section"><div className="my-section-heading"><h2>家人共享给我的照见</h2></div>
      <div className="my-person-grid">{sharedPersons.map((item) => <Link className="my-person-card card" href={`/persons/${item.id}`} key={item.id}><span>家</span><strong>{item.name}</strong><small>{item.relation} · {item.role === "collaborator" ? "共创者" : "共享者"}</small></Link>)}</div>
      {invitations.map((item) => <form action={respond} className="card invitation-row" key={item.id}><input type="hidden" name="invitationId" value={item.id} /><p><strong>{item.name}</strong> 邀请你成为{item.role === "collaborator" ? "共创者" : "共享者"}（{item.relation}）</p><button className="btn" name="decision" value="accept">接受</button><button className="text-button" name="decision" value="decline">婉拒</button></form>)}
    </section>}

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
