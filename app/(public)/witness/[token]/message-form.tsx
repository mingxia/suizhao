"use client";

import { useActionState, useEffect, useRef } from "react";
import { leaveWitnessMessage, type MessageActionState } from "@/actions/witness-actions";

export function WitnessMessageForm({ token, yearPhotoId, compact = false }: { token: string; yearPhotoId?: string; compact?: boolean }) {
  const [state, action, pending] = useActionState<MessageActionState, FormData>(leaveWitnessMessage, {});
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.success) form.current?.reset(); }, [state.success]);
  return <form ref={form} action={action} className={compact ? "witness-message-form compact" : "witness-message-form"}>
    <input type="hidden" name="token" value={token} /><input type="hidden" name="yearPhotoId" value={yearPhotoId ?? ""} />
    <textarea name="content" maxLength={500} required placeholder={yearPhotoId ? "写下关于这一年的记忆…" : "写下想对TA说的话…"} aria-label="祝福内容" />
    <div>{state.error ? <span className="form-error">{state.error}</span> : state.success ? <span className="message-success">祝福已经留下 ♡</span> : <span />}
      <button className="btn" disabled={pending}>{pending ? "正在保存…" : "留下祝福"}</button></div>
  </form>;
}
