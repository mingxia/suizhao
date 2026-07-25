"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { containSize } from "@/lib/image-resize";

async function resizeToWebp(file: File, maxEdge: number, quality: number) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const size = containSize(bitmap.width, bitmap.height, maxEdge);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("当前浏览器无法处理图片");
  context.drawImage(bitmap, 0, 0, size.width, size.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  if (!blob) throw new Error("图片转换失败");
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
}

export function PhotoUploadForm({ personId, age, replacing }: { personId: string; age: number; replacing: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const source = new FormData(form).get("photo");
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
      const fields = new FormData(form);
      fields.delete("photo");
      fields.set("age", String(age));
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
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "上传失败，请重新尝试。");
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={submit} className="upload-form">
    <label>选择照片<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" required disabled={busy} /></label>
    <label>拍摄日期（选填）<input name="takenAt" type="date" disabled={busy} /></label>
    <label>这一岁的故事（选填）<textarea name="note" maxLength={50} rows={3} disabled={busy} /></label>
    <button className="btn" disabled={busy}>{busy ? "请稍候…" : replacing ? "替换照片" : "保存照片"}</button>
    {message && <p role="status" aria-live="polite" className="muted">{message}</p>}
    <p className="muted upload-hint">照片只会存入私有空间；上传前会在浏览器中生成 WebP 尺寸。</p>
  </form>;
}
