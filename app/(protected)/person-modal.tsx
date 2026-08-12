"use client";

import { useEffect, useId, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPerson, updatePerson } from "@/actions/person-actions";
import { resizeToWebp } from "@/lib/browser-image";

type AssociationOption = { id: string; name: string; nickname?: string | null };
type PersonValues = { id: string; type: "person" | "family"; name: string; nickname: string; birthday: string; privacy: "private" | "unlisted"; hasCover?: boolean; memberIds?: string[] };

export function PersonModal({ mode, person, associationOptions = [], isLifetimeMember = false, hasPersonalTimeline = false, hasFamilyTimeline = false, className, children }: { mode: "create" | "edit"; person?: PersonValues; associationOptions?: AssociationOption[]; isLifetimeMember?: boolean; hasPersonalTimeline?: boolean; hasFamilyTimeline?: boolean; className?: string; children: React.ReactNode }) {
  const router = useRouter();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState<"person" | "family">(person?.type ?? "person");
  const [memberSearch, setMemberSearch] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverName, setCoverName] = useState("");

  useEffect(() => () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
  }, [coverPreview]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [open]);

  function previewCover(event: ChangeEvent<HTMLInputElement>) {
    const cover = event.target.files?.[0];
    setError("");
    setCoverPreview(cover ? URL.createObjectURL(cover) : null);
    setCoverName(cover?.name ?? "");
  }

  function openModal() {
    setError("");
    setCoverPreview(null);
    setCoverName("");
    setOpen(true);
  }

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
  const canCreatePersonal = isLifetimeMember || !hasPersonalTimeline;
  const canCreateFamily = isLifetimeMember && !hasFamilyTimeline;
  const creationLimitReached = mode === "create" && !canCreatePersonal && !canCreateFamily;
  return <>
    <button type="button" className={className} onClick={openModal}>{children}</button>
    {open && createPortal(<div className="upload-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <section className="upload-modal person-form-modal card" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button type="button" className="modal-close" aria-label="关闭" onClick={() => setOpen(false)}>×</button>
        <p className="modal-eyebrow">{mode === "create" ? "开启一条新的时间线" : `正在编辑 · ${person?.name}`}</p>
        <h2 id={titleId}>{title}</h2>
        <form className="person-form" action={submit}>
          {mode === "create" ? <fieldset className="timeline-type-fieldset">
            <legend>照见类型</legend>
            <label className={`timeline-type-option${type === "person" ? " timeline-type-option-active" : ""}${!canCreatePersonal ? " timeline-type-option-disabled" : ""}`} aria-disabled={!canCreatePersonal}><input type="radio" name="type" value="person" checked={type === "person"} disabled={!canCreatePersonal} onChange={() => setType("person")} /><strong>个人照见</strong><span>{canCreatePersonal ? "每岁一张，记录个人成长" : "免费会员仅可创建 1 个，当前已达上限"}</span></label>
            <label className={`timeline-type-option${type === "family" ? " timeline-type-option-active" : ""}${!canCreateFamily ? " timeline-type-option-disabled" : ""}`} aria-disabled={!canCreateFamily}><input type="radio" name="type" value="family" checked={type === "family"} disabled={!canCreateFamily} onChange={() => setType("family")} /><strong>家庭照见</strong><span>{canCreateFamily ? "从结婚照开始，每年一张全家福 · 终身会员" : isLifetimeMember ? "每位终身会员仅可创建 1 个，当前已达上限" : "仅终身会员可创建，升级后即可使用"}</span></label>
          </fieldset> : <input type="hidden" name="type" value={person?.type} />}
          {mode === "create" && !canCreatePersonal && <p className="timeline-limit-notice">你的免费个人照见名额已使用。现有照见可以继续正常记录；如需创建更多个人照见或家庭照见，可<Link href="/membership">查看终身会员权益</Link>。</p>}
          <fieldset className="person-details-fieldset" disabled={creationLimitReached}>
          <label className={`cover-upload-field${coverPreview || person?.hasCover ? " cover-upload-selected" : ""}`}>
            <input name="cover" type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} onChange={previewCover} />
            {coverPreview || (mode === "edit" && person?.hasCover)
              ? <><img src={coverPreview ?? `/api/persons/${person!.id}/cover`} alt="照见封面预览" /><span className="cover-upload-overlay">点击更换封面</span><small>{coverName || "当前封面 · 选择新照片即可替换"}</small></>
              : <span className="cover-upload-empty"><b aria-hidden="true">＋</b><strong>添加照见封面</strong><small>选填 · 推荐横向照片 · 支持 JPG、PNG、WebP</small></span>}
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
          </fieldset>
          <div className="person-form-actions"><button type="button" className="btn-secondary modal-cancel" onClick={() => setOpen(false)}>{creationLimitReached ? "关闭" : "取消"}</button>{!creationLimitReached && <button className="btn" disabled={pending}>{pending ? "正在保存…" : "保存"}</button>}</div>
        </form>
      </section>
    </div>, document.body)}
  </>;
}
