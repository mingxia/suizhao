import { and, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "@/db";
import { timelineInvitations, timelineMembers, timelines, user } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { PersonModal } from "../person-modal";
import { AccountActions } from "../account-actions";
import { respondToTimelineInvitation } from "@/actions/member-actions";

const membershipLabel = { free: "免费会员", lifetime: "终身会员" } as const;

type TimelineCardItem = {
  id: string;
  name: string;
  nickname: string | null;
  type: "person" | "family";
  coverKey: string | null;
  updatedAt: Date;
  relation?: string;
};

function TimelineCard({ item, role }: { item: TimelineCardItem; role: "owner" | "viewer" | "collaborator" }) {
  const roleLabel = role === "collaborator" ? "共创" : role === "viewer" ? "共享" : null;
  return <Link className="my-timeline-card card" href={`/persons/${item.id}`}>
    <div className={`my-timeline-cover${item.coverKey ? "" : " my-timeline-cover-placeholder"}`}>
      {item.coverKey
        ? <img src={`/api/persons/${item.id}/cover?v=${item.updatedAt.getTime()}`} alt={`${item.name}的封面`} />
        : <><span className="my-cover-sun" /><span className="my-cover-hills" /><small>{item.type === "family" ? "留住每一年的团圆" : "留住每一岁的光影"}</small></>}
      {roleLabel && <b className={`timeline-role-badge timeline-role-${role}`}>{roleLabel}</b>}
    </div>
    <div className="my-timeline-copy">
      <div><strong>{item.name}</strong>{item.nickname && <span>{item.nickname}</span>}</div>
      <p>{item.type === "family" ? "家庭照见" : "个人照见"}{item.relation ? ` · ${item.relation}` : ""}</p>
      <time dateTime={item.updatedAt.toISOString()}>更新于 {item.updatedAt.toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}</time>
    </div>
  </Link>;
}

function TimelineGroup({ title, description, items, role }: { title: string; description: string; items: TimelineCardItem[]; role: "owner" | "viewer" | "collaborator" }) {
  return <section className="my-section">
    <div className="my-section-heading"><div><h2>{title}</h2><p>{description}</p></div><span>{items.length} 个</span></div>
    {items.length > 0
      ? <div className="my-person-grid">{items.map((item) => <TimelineCard item={item} role={role} key={item.id} />)}</div>
      : <div className="my-group-empty"><span aria-hidden="true">照</span><p>{role === "owner" ? "还没有自己创建的照见，从一张照片开始珍藏时光。" : role === "viewer" ? "暂时没有共享给你的照见。" : "暂时没有参与共创的照见。"}</p></div>}
  </section>;
}

export default async function MyWitnessesPage() {
  const session = await requireSession();
  const db = await getDb();
  const [account] = await db.select({ membership: user.membership, email: user.email, username: user.username, name: user.name }).from(user).where(eq(user.id, session.user.id)).limit(1);
  const ownedPersons = await db.select({ id: timelines.id, name: timelines.name, nickname: timelines.nickname, type: timelines.type, coverKey: timelines.coverKey, updatedAt: timelines.updatedAt }).from(timelines).where(eq(timelines.ownerId, session.user.id)).orderBy(desc(timelines.updatedAt));
  const relatedPersons = await db.select({ id: timelines.id, name: timelines.name, nickname: timelines.nickname, type: timelines.type, coverKey: timelines.coverKey, updatedAt: timelines.updatedAt, role: timelineMembers.role, relation: timelineMembers.relation }).from(timelineMembers).innerJoin(timelines, eq(timelines.id, timelineMembers.timelineId)).where(and(eq(timelineMembers.userId, session.user.id), eq(timelineMembers.status, "accepted"))).orderBy(desc(timelines.updatedAt));
  const invitations = await db.select({ id: timelineInvitations.id, name: timelines.name, role: timelineInvitations.role, relation: timelineInvitations.relation }).from(timelineInvitations).innerJoin(timelines, eq(timelines.id, timelineInvitations.timelineId)).where(and(eq(timelineInvitations.inviteeUserId, session.user.id), eq(timelineInvitations.status, "pending"))).orderBy(desc(timelineInvitations.createdAt));
  const membership = account?.membership ?? "free";
  const sharedPersons = relatedPersons.filter((item) => item.role === "viewer");
  const collaborativePersons = relatedPersons.filter((item) => item.role === "collaborator");
  async function respond(form: FormData) { "use server"; await respondToTimelineInvitation(String(form.get("invitationId")), form.get("decision") === "accept"); }

  return <main className="container my-page">
    <header className="my-page-hero">
      <div><p className="dashboard-eyebrow">MY SEEVAS</p><h1>我的照见</h1><p>管理你珍藏、共享和共同记录的生命时光。</p><div className="my-stats"><span><b>{ownedPersons.length}</b> 个我创建的</span><i /><span><b>{sharedPersons.length}</b> 个共享给我</span><i /><span><b>{collaborativePersons.length}</b> 个参与共创</span></div></div>
      <PersonModal mode="create" isLifetimeMember={membership === "lifetime"} className="btn">＋ 创建照见</PersonModal>
    </header>

    {invitations.length > 0 && <section className="my-section invitation-section"><div className="my-section-heading"><div><h2>待处理邀请</h2><p>接受后，照见会出现在对应的分组中。</p></div><span>{invitations.length} 个</span></div>
      <div className="invitation-list">{invitations.map((item) => <form action={respond} className="card invitation-row" key={item.id}><span className="invitation-icon" aria-hidden="true">✉</span><p><strong>{item.name}</strong><small>{item.relation} · 邀请你成为{item.role === "collaborator" ? "共创者" : "共享者"}</small></p><button className="text-button" name="decision" value="decline">婉拒</button><button className="btn" name="decision" value="accept">接受</button><input type="hidden" name="invitationId" value={item.id} /></form>)}</div>
    </section>}

    <TimelineGroup title="我创建的" description="由你创建并拥有完整管理权限。" items={ownedPersons} role="owner" />
    <TimelineGroup title="共享给我的" description="家人邀请你查看和见证的照见。" items={sharedPersons} role="viewer" />
    <TimelineGroup title="我参与共创的" description="你可以和家人一起上传照片、共同维护。" items={collaborativePersons} role="collaborator" />

    <section className="my-account-grid">
      <div className="account-profile card"><p className="dashboard-eyebrow">PROFILE</p><h2>个人档案</h2><AccountActions name={account?.name ?? session.user.name} username={account?.username ?? ""} email={account?.email ?? session.user.email} /></div>
      <aside className="account-membership card"><p className="dashboard-eyebrow">MEMBERSHIP</p><h2>会员身份</h2><span className="membership-pill">{membershipLabel[membership]}</span><p>{membership === "lifetime" ? "持续珍藏生命中的每一年。" : "升级后可创建并长期维护更多照见。"}</p>{membership !== "lifetime" && <Link className="text-button" href="/membership">了解终身会员 →</Link>}</aside>
    </section>
  </main>;
}
