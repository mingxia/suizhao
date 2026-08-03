import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { timelineInvitations, timelineMembers, user } from "@/db/schema";
import { inviteTimelineMember, revokeTimelineMember } from "@/actions/member-actions";
import { requirePersonOwner } from "@/lib/permissions";
import { requireSession } from "@/lib/session";

// Keep old bookmarks working; member management now shares the timeline's modal workflow.
export default async function Settings({ params }: { params: Promise<{ personId: string }> }) {
  const { personId } = await params;
  const session = await requireSession();
  const timeline = await requirePersonOwner(personId, session.user.id);
  const db = await getDb();
  const [members, invitations] = await Promise.all([
    db.select({ id: timelineMembers.id, name: user.name, email: user.email, role: timelineMembers.role, relation: timelineMembers.relation, status: timelineMembers.status }).from(timelineMembers).innerJoin(user, eq(user.id, timelineMembers.userId)).where(eq(timelineMembers.timelineId, personId)).orderBy(desc(timelineMembers.createdAt)),
    db.select({ id: timelineInvitations.id }).from(timelineInvitations).where(eq(timelineInvitations.timelineId, personId)),
  ]);
  async function invite(form: FormData) { "use server"; await inviteTimelineMember(personId, undefined, form); }
  async function revoke(form: FormData) { "use server"; await revokeTimelineMember(personId, String(form.get("memberId"))); }
  return <main className="container settings-page">
    <Link href={`/persons/${personId}`}>← 返回{timeline.name}的成长记录</Link>
    <section className="card member-card"><p className="dashboard-eyebrow">管理照见</p><h1>{timeline.name}的所有成员</h1>
      <div className="member-row"><span>👤</span><div><strong>{session.user.name}</strong><small>{session.user.email}</small></div><b>所有者</b></div>
      {members.filter((item) => item.status === "accepted").map((member) => <div className="member-row" key={member.id}><span>{member.role === "collaborator" ? "👩" : "👵"}</span><div><strong>{member.name} · {member.relation}</strong><small>{member.email}</small></div><b>{member.role === "collaborator" ? "共创者" : "共享者"}</b><form action={revoke}><input type="hidden" name="memberId" value={member.id} /><button className="text-button">移除</button></form></div>)}
      {invitations.length > 0 && <p className="muted">共发出 {invitations.length} 个成员邀请。</p>}
    </section>
    <section className="card member-card"><p className="dashboard-eyebrow">添加成员</p><h2>邀请已注册的家人</h2><form action={invite} className="member-invite-form">
      <label>成员方式<select name="role" required><option value="viewer">共享给家人（查看互动）</option><option value="collaborator">一起共创（共同编辑）</option></select></label>
      <label>关系<input name="relation" required placeholder="妈妈、奶奶、爷爷…" maxLength={30} /></label>
      <label>照见账号<input name="email" type="email" required placeholder="对方的注册邮箱" /></label>
      <button className="btn">发送邀请</button>
    </form><p className="permission-note">共享者可长期查看；共创者还可上传和替换照片。只有所有者能管理成员。</p></section>
  </main>;
}
