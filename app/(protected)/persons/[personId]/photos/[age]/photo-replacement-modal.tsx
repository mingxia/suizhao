"use client";

import { useEffect, useState } from "react";
import type { YearPhotoStage } from "@/db/schema/app";
import { PhotoUploadForm } from "./photo-upload-form";

export function PhotoReplacementModal({ personId, stage, age, note, takenAt }: { personId: string; stage: YearPhotoStage; age: number | null; note: string; takenAt: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", close); document.body.style.overflow = ""; };
  }, [open]);

  return <>
    <button type="button" className="photo-manage-button" onClick={() => setOpen(true)}>替换照片</button>
    {open && <div className="upload-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <section className="upload-modal card" role="dialog" aria-modal="true" aria-labelledby="replace-title">
        <button type="button" className="modal-close" aria-label="关闭" onClick={() => setOpen(false)}>×</button>
        <p className="modal-eyebrow">照片管理</p>
        <h2 id="replace-title">替换{stage === "first_seen" ? "初见" : `${age}岁`}的照片</h2>
        <p className="muted">选择新的照片后，当前照片将被替换；原有日期和故事已为你保留。</p>
        <PhotoUploadForm personId={personId} stage={stage} age={age} replacing defaultNote={note} defaultTakenAt={takenAt} onSuccess={() => setOpen(false)} />
      </section>
    </div>}
  </>;
}
