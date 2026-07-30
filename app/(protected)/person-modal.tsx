"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { createPerson, updatePerson } from "@/actions/person-actions";

type PersonValues = { id: string; type: "person" | "family"; name: string; nickname: string; birthday: string; privacy: "private" | "unlisted" };

export function PersonModal({ mode, person, className, children }: { mode: "create" | "edit"; person?: PersonValues; className?: string; children: React.ReactNode }) {
  const router = useRouter();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState<"person" | "family">(person?.type ?? "person");

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [open]);

  async function submit(formData: FormData) {
    setPending(true);
    setError("");
    const result = mode === "create" ? await createPerson(undefined, formData) : await updatePerson(person!.id, formData);
    setPending(false);
    if (!result.success) { setError(result.error.message); return; }
    setOpen(false);
    if (mode === "create" && result.data) router.push(`/persons/${result.data.id}`);
    router.refresh();
  }

  const title = mode === "create" ? "创建照见" : "照见设置";
  return <>
    <button type="button" className={className} onClick={() => { setError(""); setOpen(true); }}>{children}</button>
    {open && createPortal(<div className="upload-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <section className="upload-modal person-form-modal card" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button type="button" className="modal-close" aria-label="关闭" onClick={() => setOpen(false)}>×</button>
        <p className="modal-eyebrow">{mode === "create" ? "开启一条新的时间线" : `正在编辑 · ${person?.name}`}</p>
        <h2 id={titleId}>{title}</h2>
        <form className="person-form" action={submit}>
          {mode === "create" ? <fieldset className="timeline-type-fieldset">
            <legend>照见类型</legend>
            <label className={type === "person" ? "timeline-type-option timeline-type-option-active" : "timeline-type-option"}><input type="radio" name="type" value="person" checked={type === "person"} onChange={() => setType("person")} /><strong>个人照见</strong><span>每岁一张，记录个人成长</span></label>
            <label className={type === "family" ? "timeline-type-option timeline-type-option-active" : "timeline-type-option"}><input type="radio" name="type" value="family" checked={type === "family"} onChange={() => setType("family")} /><strong>家庭照见</strong><span>从结婚照开始，每年一张全家福 · 终身会员</span></label>
          </fieldset> : <input type="hidden" name="type" value={person?.type} />}
          <label>{type === "family" ? "名称" : "姓名"}<input name="name" required maxLength={30} defaultValue={person?.name} autoFocus /></label>
          <label>昵称 <span>（选填）</span><input name="nickname" maxLength={30} defaultValue={person?.nickname} /></label>
          <label>{type === "family" ? "结婚日期" : "出生日期"}<input name="birthday" required type="date" defaultValue={person?.birthday} /></label>
          {mode === "edit" ? <label>可见范围<select name="privacy" defaultValue={person?.privacy}><option value="private">私有</option><option value="unlisted">私密链接（预留）</option></select></label> : <input type="hidden" name="privacy" value="private" />}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="person-form-actions"><button type="button" className="btn-secondary modal-cancel" onClick={() => setOpen(false)}>取消</button><button className="btn" disabled={pending}>{pending ? "正在保存…" : "保存"}</button></div>
        </form>
      </section>
    </div>, document.body)}
  </>;
}
