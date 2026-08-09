"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AccountActions({ name, username, email }: { name: string; username: string; email: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function resetFeedback() { setMessage(""); setError(""); }

  async function updateProfile(formData: FormData) {
    resetFeedback();
    const nextName = String(formData.get("name") || "").trim();
    const nextUsername = String(formData.get("username") || "").trim().toLowerCase();
    if (nextName.length < 2 || nextName.length > 30) return setError("昵称需要填写 2 至 30 个字符。");
    if (!/^[a-z0-9_.]{3,30}$/.test(nextUsername)) return setError("用户名需要填写 3 至 30 位字母、数字、下划线或点。");
    setPending(true);
    const result = await authClient.updateUser({ name: nextName, username: nextUsername });
    setPending(false);
    if (result.error) return setError(result.error.message || "个人档案更新失败，请稍后重试。");
    setEditing(false);
    setMessage("个人档案已更新。");
    router.refresh();
  }

  async function changePassword(formData: FormData) {
    resetFeedback();
    const currentPassword = String(formData.get("currentPassword") || "");
    const newPassword = String(formData.get("newPassword") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");
    if (newPassword !== confirmPassword) return setError("两次输入的新密码不一致");
    setPending(true);
    const result = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
    setPending(false);
    if (result.error) return setError(result.error.message || "修改密码失败，请确认当前密码是否正确。");
    setChangingPassword(false);
    setMessage("密码已更新，其他设备将需要重新登录。");
  }

  return <div className="account-actions">
    {editing ? <form className="profile-edit-form" action={updateProfile}>
      <label>昵称<input name="name" defaultValue={name} minLength={2} maxLength={30} required /></label>
      <label>用户名<input name="username" defaultValue={username} minLength={3} maxLength={30} pattern="[A-Za-z0-9_.]+" required /><small>用于登录；可使用字母、数字、下划线和点。</small></label>
      <div className="account-form-actions"><button className="btn" disabled={pending}>{pending ? "正在保存…" : "保存资料"}</button><button className="text-button" type="button" onClick={() => { setEditing(false); resetFeedback(); }}>取消</button></div>
    </form> : <dl className="profile-details"><div><dt>昵称</dt><dd>{name}</dd></div><div><dt>用户名</dt><dd>{username || "尚未设置"}</dd></div><div><dt>邮箱</dt><dd>{email}<small>邮箱是登录与接收邀请的凭据，暂不支持直接修改。</small></dd></div></dl>}

    {!editing && <button className="profile-edit-button" type="button" onClick={() => { setEditing(true); setChangingPassword(false); resetFeedback(); }}>编辑资料</button>}
    <div className="account-security"><div><p className="dashboard-eyebrow">SECURITY</p><h3>账号安全</h3><span>修改密码后，其他设备需要重新登录。</span></div><button className="text-button" type="button" onClick={() => { setChangingPassword((value) => !value); setEditing(false); resetFeedback(); }}>{changingPassword ? "收起" : "修改密码"}</button></div>
    {changingPassword && <form className="account-password-form" action={changePassword}><label>当前密码<input name="currentPassword" type="password" autoComplete="current-password" required /></label><label>新密码<input name="newPassword" type="password" autoComplete="new-password" minLength={8} required /></label><label>确认新密码<input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required /></label><button className="btn" disabled={pending}>{pending ? "正在更新…" : "确认修改"}</button></form>}
    {error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status">{message}</p>}
  </div>;
}
