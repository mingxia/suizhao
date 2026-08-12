"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function YearDetailsForm({ photoId, type, locationName, yearHighlight }: { photoId: string; type: "person" | "family"; locationName: string; yearHighlight: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/photos/${photoId}/details`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locationName: data.get("locationName"), yearHighlight: data.get("yearHighlight") }) });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "保存失败，请重新尝试。");
      setMessage("已悄悄记下。");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败，请重新尝试。");
    } finally { setBusy(false); }
  }
  return <form className="year-details-form" onSubmit={submit}>
    <div><label htmlFor="locationName">这一年，家在哪里？</label><input id="locationName" name="locationName" maxLength={50} defaultValue={locationName} placeholder="例如：郑州、北京、杭州" disabled={busy} /></div>
    <div><label htmlFor="yearHighlight">{type === "family" ? "这一年，家里最值得记住的事？" : "这一年，有什么值得记住？"}</label><textarea id="yearHighlight" name="yearHighlight" maxLength={100} rows={2} defaultValue={yearHighlight} placeholder={type === "family" ? "例如：搬进了新家" : "例如：第一次上幼儿园、毕业、结婚"} disabled={busy} /></div>
    <footer><span className="muted">都可以留空，以后再写。</span><button className="photo-manage-button" disabled={busy}>{busy ? "保存中…" : "保存"}</button></footer>
    {message && <p role="status" aria-live="polite" className="muted">{message}</p>}
  </form>;
}
