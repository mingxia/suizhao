"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function AccountActions() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function changePassword(formData: FormData) {
    setPending(true);
    setMessage("");
    setError("");
    const currentPassword = String(formData.get("currentPassword") || "");
    const newPassword = String(formData.get("newPassword") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (newPassword !== confirmPassword) {
      setPending(false);
      setError("两次输入的新密码不一致");
      return;
    }

    const result = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
    setPending(false);
    if (result.error) {
      setError(result.error.message || "修改密码失败，请确认当前密码是否正确。");
      return;
    }
    setMessage("密码已更新，其他设备将需要重新登录。");
  }

  return <form className="account-password-form" action={changePassword}>
    <label>当前密码<input name="currentPassword" type="password" autoComplete="current-password" required /></label>
    <label>新密码<input name="newPassword" type="password" autoComplete="new-password" minLength={8} required /></label>
    <label>确认新密码<input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    {message && <p className="form-success" role="status">{message}</p>}
    <button className="btn" disabled={pending}>{pending ? "正在更新…" : "修改密码"}</button>
  </form>;
}
