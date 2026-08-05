"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const username = String(data.get("username") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const loginId = String(data.get("loginId") ?? "").trim();
    const result = mode === "login"
      ? loginId.includes("@")
        ? await authClient.signIn.email({ email: loginId.toLowerCase(), password })
        : await authClient.signIn.username({ username: loginId, password })
      : await authClient.signUp.email({ email, password, username, name: String(data.get("name") ?? "") });
    if (result.error) {
      setError(result.error.message ?? (mode === "login" ? "登录失败，请检查用户名/邮箱和密码。" : "注册失败，请稍后重试。"));
      setPending(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return <form className="auth-form" onSubmit={submit}>
    {mode === "register" && <>
      <label>你的名字<input name="name" autoComplete="name" required placeholder="怎么称呼你" /></label>
      <label>用户名<input name="username" autoComplete="username" required minLength={3} maxLength={30} pattern="[A-Za-z0-9_.]+" placeholder="用于登录，如 zhangsan" /></label>
      <label>邮箱<input name="email" type="email" autoComplete="email" required placeholder="name@example.com" /></label>
    </>}
    {mode === "login" && <label>用户名或邮箱<input name="loginId" autoComplete="username" required placeholder="用户名或 name@example.com" /></label>}
    <label>密码<input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required placeholder="至少 8 位字符" /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="btn btn-primary auth-submit" disabled={pending}>{pending ? "请稍候…" : mode === "login" ? "登录" : "创建账号"}</button>
  </form>;
}
