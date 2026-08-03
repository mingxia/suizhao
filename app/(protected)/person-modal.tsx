"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { createPerson, updatePerson } from "@/actions/person-actions";
import { resizeToWebp } from "@/lib/browser-image";

type AssociationOption = { id: string; name: string; nickname?: string | null };
type PersonValues = { id: string; type: "person" | "family"; name: string; nickname: string; birthday: string; privacy: "private" | "unlisted"; hasCover?: boolean; memberIds?: string[] };

export function PersonModal({ mode, person, associationOptions = [], className, children }: { mode: "create" | "edit"; person?: PersonValues; associationOptions?: AssociationOption[]; className?: string; children: React.ReactNode }) {
  const router = useRouter();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState<"person" | "family">(person?.type ?? "person");
  const [coverPreview, setCoverPreview] = useState("");
  const [coverFileName, setCoverFileName] = useState("");
  const [memberSearch, setMemberSearch] = useState("");

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
    const cover = formData.get("cover");
    formData.delete("cover");
    const result = mode === "create" ? await createPerson(undefined, formData) : await updatePerson(person!.id, formData);
    if (!result.success) { setPending(false); setError(result.error.message); return; }
    const personId = mode === "create" ? result.data?.id : person!.id;
    if (cover instanceof File && cover.size && personId) {
      try {
        const upload = new FormData();
        upload.set("cover", await resizeToWebp(cover, 1800, 0.86));
        const response = await fetch(`/api/persons/${personId}/cover`, { method: "POST", body: upload });
        const body = await response.json() as { message?: string };
        if (!response.ok) throw new Error(body.message || "封面图上传失败，请重新尝试。");
      } catch (uploadError) {
        setPending(false);
        setError(uploadError instanceof Error ? uploadError.message : "封面图上传失败，请重新尝试。");
        router.refresh();
        return;
      }
    }
    setPending(false);
    setOpen(false);
    if (mode === "create" && result.data) router.push(`/persons/${result.data.id}`);
    router.refresh();
  }

  const title = mode === "create" ? "创建照见" : "照见设置";
  return <>
    <button type="button" className={className} onClick={() => { setError(""); setCoverPreview(""); setCoverFileName(""); setOpen(true); }}>{children}</button>
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
          <label className="cover-upload-field">
            <span className="cover-upload-heading">封面图 <small>选填</small></span>
            <span className="cover-upload-card">
              <span className="cover-upload-preview">
              {coverPreview || (mode === "edit" && person?.hasCover) ? <img src={coverPreview || `/api/persons/${person?.id}/cover`} alt="封面图预览" /> : <b aria-hidden="true">＋</b>}
              </span>
              <span className="cover-upload-copy"><strong>{coverFileName || (mode === "edit" && person?.hasCover ? "更换封面照片" : "选择一张封面照片")}</strong><small>推荐横向照片，支持 JPG、PNG、WebP</small><span className="cover-upload-button">{mode === "edit" && person?.hasCover ? "重新选择" : "选择照片"}</span></span>
            </span>
            <input name="cover" type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} onChange={(event) => {
              if (coverPreview) URL.revokeObjectURL(coverPreview);
              const file = event.target.files?.[0];
              setCoverPreview(file ? URL.createObjectURL(file) : "");
              setCoverFileName(file?.name ?? "");
            }} />
          </label>
          <label>{type === "family" ? "名称" : "姓名"}<input name="name" required maxLength={30} defaultValue={person?.name} autoFocus /></label>
          <label>昵称 <span>（选填）</span><input name="nickname" maxLength={30} defaultValue={person?.nickname} /></label>
          <label>{type === "family" ? "结婚日期" : "出生日期"}<input name="birthday" required type="date" defaultValue={person?.birthday} /></label>
          {type === "family" && <fieldset className="family-member-fieldset">
            <legend>关联人物 <span>（选填）</span></legend>
            <p>关联你创建的个人照见，保存后可从家庭照见直接进入。</p>
            {associationOptions.length ? <><input className="family-member-search" type="search" value={memberSearch} onChange={(event) => setMemberSearch(event.target.value)} placeholder="按个人照见姓名搜索" aria-label="搜索关联人物" /><div className="family-member-options">
              {associationOptions.filter((option) => `${option.name} ${option.nickname ?? ""}`.toLocaleLowerCase().includes(memberSearch.trim().toLocaleLowerCase())).map((option) => <label key={option.id}><input type="checkbox" name="memberIds" value={option.id} defaultChecked={person?.memberIds?.includes(option.id)} /><span aria-hidden="true">{option.name.slice(0, 1)}</span><strong>{option.name}</strong>{option.nickname && <small>{option.nickname}</small>}</label>)}
            </div></> : <small>还没有可关联的个人照见，你可以稍后在设置中添加。</small>}
          </fieldset>}
          {mode === "edit" ? <label>可见范围<select name="privacy" defaultValue={person?.privacy}><option value="private">私有</option><option value="unlisted">私密链接（预留）</option></select></label> : <input type="hidden" name="privacy" value="private" />}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="person-form-actions"><button type="button" className="btn-secondary modal-cancel" onClick={() => setOpen(false)}>取消</button><button className="btn" disabled={pending}>{pending ? "正在保存…" : "保存"}</button></div>
        </form>
      </section>
    </div>, document.body)}
  </>;
}
