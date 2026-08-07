"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function signInWithGoogle() {
    setPending(true);
    setError("");
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
      errorCallbackURL: "/login",
    });
    if (result.error) {
      setError(result.error.message ?? "Google 登录失败，请稍后重试。");
      setPending(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const username = String(data.get("username") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const name = String(data.get("name") ?? "").trim();
    const loginId = String(data.get("loginId") ?? "").trim();
    const result = mode === "login"
      ? loginId.includes("@")
        ? await authClient.signIn.email({ email: loginId.toLowerCase(), password })
        : await authClient.signIn.username({ username: loginId, password })
      : await authClient.signUp.email({ email, password, username, displayUsername: name, name });
    if (result.error) {
      setError(result.error.message ?? (mode === "login" ? "登录失败，请检查用户名/邮箱和密码。" : "注册失败，请稍后重试。"));
      setPending(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return <div className="auth-options">
    <button className="google-auth-button" type="button" onClick={signInWithGoogle} disabled={pending}>
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.55h3.24c1.9-1.75 2.98-4.33 2.98-7.42Z" />
        <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.35l-3.24-2.55c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.63A10 10 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.39 13.93A6.02 6.02 0 0 1 6.07 12c0-.67.12-1.32.32-1.93V7.44H3.04A10 10 0 0 0 2 12c0 1.64.39 3.19 1.04 4.56l3.35-2.63Z" />
        <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.82 1.5l2.88-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.44l3.35 2.63C7.18 7.7 9.39 5.94 12 5.94Z" />
      </svg>
      {pending ? "正在连接 Google…" : `使用 Google ${mode === "login" ? "登录" : "注册"}`}
    </button>
    <div className="auth-divider"><span>或使用用户名和密码</span></div>
    <form className="auth-form" onSubmit={submit}>
      {mode === "register" && <>
        <label>你的名字<input name="name" autoComplete="name" required placeholder="怎么称呼你" /></label>
        <label>用户名<input name="username" autoComplete="username" required minLength={3} maxLength={30} pattern="[A-Za-z0-9_.]+" placeholder="用于登录，如 zhangsan" /></label>
        <label>邮箱<input name="email" type="email" autoComplete="email" required placeholder="name@example.com" /></label>
      </>}
      {mode === "login" && <label>用户名或邮箱<input name="loginId" autoComplete="username" required placeholder="用户名或 name@example.com" /></label>}
      <label>密码<input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required placeholder="至少 8 位字符" /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="btn btn-primary auth-submit" disabled={pending}>{pending ? "请稍候…" : mode === "login" ? "登录" : "创建账号"}</button>
    </form>
  </div>;
}
