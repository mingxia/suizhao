"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { resizeToWebp } from "@/lib/browser-image";
import type { YearPhotoStage } from "@/db/schema/app";

export function PhotoUploadForm({ personId, stage, age, replacing, onSuccess, defaultNote = "", defaultTakenAt = "" }: { personId: string; stage: YearPhotoStage; age: number | null; replacing: boolean; onSuccess?: () => void; defaultNote?: string; defaultTakenAt?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    // Capture all user-entered values before setting `busy`. The busy render
    // disables the controls, and disabled controls are omitted by FormData.
    const fields = new FormData(form);
    const source = fields.get("photo");
    if (!(source instanceof File) || !source.size) return setMessage("请先选择一张照片。");
    if (!source.type.startsWith("image/")) return setMessage("请选择有效的图片文件。");
    if (replacing && !window.confirm("每一年只能留下一个瞬间。确定替换原来的照片吗？")) return;

    setBusy(true);
    setMessage("正在处理图片…");
    try {
      const [thumbnail, large] = await Promise.all([
        resizeToWebp(source, 600, 0.78),
        resizeToWebp(source, 2000, 0.86),
      ]);
      fields.delete("photo");
      fields.set("stage", stage);
      if (age === null) fields.delete("age"); else fields.set("age", String(age));
      fields.set("replace", String(replacing));
      fields.set("thumbnail", thumbnail);
      fields.set("large", large);
      if (!fields.get("takenAt")) fields.delete("takenAt");
      setMessage("正在上传…");
      const response = await fetch(`/api/persons/${personId}/photos`, { method: "POST", body: fields });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "上传失败，请重新尝试。");
      setMessage("保存成功。");
      router.refresh();
      onSuccess?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "上传失败，请重新尝试。");
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={submit} className="upload-form">
    <label>选择照片<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" required disabled={busy} /></label>
    <label>拍摄日期（选填）<input name="takenAt" type="date" defaultValue={defaultTakenAt} disabled={busy} /></label>
    <label>{stage === "first_seen" ? "初见的故事（选填）" : "这一岁的故事（选填）"}<textarea name="note" maxLength={50} rows={3} defaultValue={defaultNote} disabled={busy} /></label>
    <button className="btn" disabled={busy}>{busy ? "请稍候…" : replacing ? "替换照片" : "保存照片"}</button>
    {message && <p role="status" aria-live="polite" className="muted">{message}</p>}
    <p className="muted upload-hint">照片只会存入私有空间；上传前会在浏览器中生成 WebP 尺寸。</p>
  </form>;
}
