"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { inviteTimelineMember, revokeTimelineMemberFromForm } from "@/actions/member-actions";
import type { ActionResult } from "@/types/action-result";

type MemberItem = { id: string; name: string; email: string; role: "owner" | "collaborator" | "viewer"; relation: string };
type PendingInvitation = { id: string; name: string; email: string; role: "collaborator" | "viewer"; relation: string };

export function MemberPanel({ personId, personName, owner, members, invitations }: { personId: string; personName: string; owner: { name: string; email: string }; members: MemberItem[]; invitations: PendingInvitation[] }) {
  const [open, setOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", close); document.body.style.overflow = ""; };
  }, [open]);

  return <>
    <button className="person-settings-trigger" type="button" onClick={() => { setInviting(false); setOpen(true); }}>管理成员 →</button>
    {open && <div className="upload-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <section className="upload-modal member-overview-modal card" role="dialog" aria-modal="true" aria-labelledby="member-modal-title">
        <button type="button" className="modal-close" aria-label="关闭" onClick={() => setOpen(false)}>×</button>
        {!inviting ? <>
          <div className="member-modal-heading"><div><p className="modal-eyebrow">TIMELINE MEMBERS</p><h2 id="member-modal-title">管理照见</h2><p>{personName}的共享与共创成员</p></div><button className="btn" type="button" onClick={() => setInviting(true)}>＋ 添加成员</button></div>
          <div className="member-list">
            <MemberRow icon="👤" name={owner.name} detail={owner.email} label="所有者" />
            {members.map((member) => <MemberRow key={member.id} icon={member.role === "collaborator" ? "👩" : "👵"} name={`${member.name} · ${member.relation}`} detail={member.email} label={member.role === "collaborator" ? "共创者" : "共享者"} action={<form action={revokeTimelineMemberFromForm.bind(null, personId, member.id)}><button className="text-button" type="submit">移除</button></form>} />)}
            {invitations.map((invitation) => <MemberRow key={invitation.id} icon="✉️" name={`${invitation.name} · ${invitation.relation}`} detail={invitation.email} label={`待接受 · ${invitation.role === "collaborator" ? "共创" : "共享"}`} />)}
          </div>
          {members.length === 0 && invitations.length === 0 && <div className="member-empty"><span>♡</span><p>邀请已注册的家人，长期关注或一起记录{personName}的成长。</p></div>}
        </> : <div className="member-invite-view">
          <button className="witness-back" type="button" onClick={() => setInviting(false)}>← 返回所有成员</button>
          <p className="modal-eyebrow">添加成员</p><h2 id="member-modal-title">邀请家人加入{personName}的照见</h2>
          <InviteForm personId={personId} onCancel={() => setInviting(false)} onSuccess={() => { setInviting(false); router.refresh(); }} />
        </div>}
      </section>
    </div>}
  </>;
}

function MemberRow({ icon, name, detail, label, action }: { icon: string; name: string; detail: string; label: string; action?: React.ReactNode }) {
  return <article className="member-row"><span aria-hidden="true">{icon}</span><div><strong>{name}</strong><small>{detail}</small></div><b>{label}</b>{action}</article>;
}

function InviteForm({ personId, onCancel, onSuccess }: { personId: string; onCancel: () => void; onSuccess: () => void }) {
  const [state, inviteAction, pending] = useActionState<ActionResult | null, FormData>(inviteTimelineMember.bind(null, personId), null);
  useEffect(() => { if (state?.success) onSuccess(); }, [state, onSuccess]);
  return <form action={inviteAction} className="person-form">
    <label>成员方式<select name="role" required><option value="viewer">共享给家人 · 查看与互动</option><option value="collaborator">一起共创 · 共同编辑</option></select></label>
    <label>关系<input name="relation" required placeholder="例如：妈妈、奶奶、爷爷" maxLength={30} /></label>
    <label>照见账号<input name="email" type="email" required placeholder="对方的注册邮箱" /></label>
    <p className="permission-note">共享者可以长期查看；共创者还可以上传和替换照片。邀请必须由对方接受后才会生效。</p>
    {state && !state.success && <p className="form-error">{state.error.message}</p>}
    <div className="person-form-actions"><button className="btn modal-cancel" type="button" onClick={onCancel}>取消</button><button className="btn" disabled={pending}>{pending ? "正在发送…" : "发送邀请"}</button></div>
  </form>;
}
