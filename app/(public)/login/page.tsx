import Link from "next/link";
import { AuthForm } from "./auth-form";

export default function LoginPage() {
  return <main className="auth-page"><Link className="wordmark auth-logo" href="/">岁照</Link><section className="auth-card"><p className="eyebrow">欢迎回来</p><h1>登录岁照</h1><p className="muted">继续保存属于你的成长时光。</p><AuthForm mode="login" /><p className="auth-switch">还没有账号？<Link href="/register">免费注册</Link></p></section></main>;
}
