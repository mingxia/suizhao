"use client";

import { useActionState, useEffect, useState } from "react";
import { createWitness, deleteWitness, pauseWitness, reactivateWitness, type WitnessActionState } from "@/actions/witness-actions";

type WitnessItem = { id: string; name: string; relation: string; permission: "readonly" | "comment" | "family"; token: string; status: "active" | "paused"; expiresAt: string | null; lastVisitedAt: string | null; viewedYears: number[] };

const permissionNames = { readonly: "只读分享者", comment: "普通见证者", family: "家庭成员" };

export function WitnessPanel({ personId, personName, items }: { personId: string; personName: string; items: WitnessItem[] }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const action = createWitness.bind(null, personId);
  const [state, formAction, pending] = useActionState<WitnessActionState, FormData>(action, {});
  useEffect(() => { if (state.token) setOpen(true); }, [state.token]);
  function link(token: string) { return `${window.location.origin}/witness/${token}`; }
  async function copy(token: string) {
    await navigator.clipboard.writeText(link(token));
    setCopied(token);
    window.setTimeout(() => setCopied(null), 1800);
  }
  return <section className="witness-panel card">
    <div className="witness-heading">
      <div><p className="modal-eyebrow">FAMILY WITNESS</p><h2>家人见证</h2><p>共有{items.length}位家人在见证{personName}成长</p></div>
      <button className="btn" type="button" onClick={() => setOpen(true)}>＋ 邀请家人见证</button>
    </div>
    {items.length === 0 ? <div className="witness-empty"><span>♡</span><p>邀请重要的人，一起见证{personName}的成长。</p><small>家人无需注册，打开专属链接就能查看与祝福。</small></div> : <div className="witness-list">
      {items.map((item) => <article className="witness-row" key={item.id}>
        <div className="witness-avatar" aria-hidden="true">{item.name.slice(0, 1)}</div>
        <div className="witness-main"><strong>{item.name}</strong><span>{item.relation} · {permissionNames[item.permission]} · <em className={item.status === "active" ? "witness-status-active" : "witness-status-paused"}>{statusText(item)}</em></span>
          <small>{item.lastVisitedAt ? `最近访问：${formatDate(item.lastVisitedAt)}` : "还没有来过"}{item.viewedYears.length ? ` · 浏览：${item.viewedYears.join("、")}` : ""}</small>
        </div>
        {item.status === "active" ? <><button className="witness-copy" type="button" onClick={() => copy(item.token)}>{copied === item.token ? "已复制 ✓" : "复制专属链接"}</button><form action={pauseWitness.bind(null, personId, item.id)}><button className="witness-pause" type="submit">暂停</button></form></> : <form className="witness-reactivate" action={reactivateWitness.bind(null, personId, item.id)}><select name="duration" defaultValue="30" aria-label="再次开启时长"><option value="7">7天</option><option value="30">30天</option><option value="90">90天</option><option value="never">长期</option></select><button type="submit">再次开启</button></form>}
        <form action={deleteWitness.bind(null, personId, item.id)}><button className="witness-delete" type="submit" aria-label={`移除${item.name}`}>×</button></form>
      </article>)}
    </div>}
    {open && <div className="upload-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <section className="upload-modal witness-modal card" role="dialog" aria-modal="true" aria-labelledby="witness-title">
        <button type="button" className="modal-close" aria-label="关闭" onClick={() => setOpen(false)}>×</button>
        <p className="modal-eyebrow">邀请一位重要的人</p><h2 id="witness-title">一起见证{personName}的成长</h2>
        {state.token ? <div className="witness-created"><span>♡</span><h3>{state.createdName}的专属链接已生成</h3><p>无需注册，打开链接即可进入成长记录。</p><button className="btn" type="button" onClick={() => copy(state.token!)}>{copied === state.token ? "链接已复制 ✓" : "复制邀请链接"}</button><button className="text-button" type="button" onClick={() => setOpen(false)}>完成</button></div> : <form action={formAction} className="person-form">
          <label>姓名<input name="name" maxLength={30} placeholder="例如：奶奶" required /></label>
          <label>关系<input name="relation" maxLength={30} placeholder="例如：奶奶、外公、朋友" required /></label>
          <label>见证权限<select name="permission" defaultValue="comment"><option value="comment">普通见证者 · 查看与留言</option><option value="family">家庭成员 · 查看、留言与未来补充照片</option><option value="readonly">分享者 · 仅查看</option></select></label>
          <label>见证期限<select name="duration" defaultValue="30"><option value="7">7天</option><option value="30">30天（推荐）</option><option value="90">90天</option><option value="never">长期开放</option></select></label>
          <p className="permission-note">到期后成长记录会自动收起，祝福和访问记录不会删除。再次开启时会生成新的专属链接。</p>
          <p className="permission-note">家庭成员补充照片将在后续版本开放，所有补充内容都会由主人确认后展示。</p>
          {state.error && <p className="form-error">{state.error}</p>}
          <div className="person-form-actions"><button className="btn modal-cancel" type="button" onClick={() => setOpen(false)}>取消</button><button className="btn" disabled={pending}>{pending ? "正在生成…" : "生成专属链接"}</button></div>
        </form>}
      </section>
    </div>}
  </section>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function statusText(item: WitnessItem) {
  if (item.status === "paused") return item.expiresAt && new Date(item.expiresAt) <= new Date() ? "已到期" : "已暂停";
  if (!item.expiresAt) return "长期开放";
  const days = Math.max(1, Math.ceil((new Date(item.expiresAt).getTime() - Date.now()) / 86_400_000));
  return `见证中 · 还剩${days}天`;
}
