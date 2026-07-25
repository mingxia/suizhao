import Link from "next/link";
import { AuthForm } from "../login/auth-form";

export default function RegisterPage() {
  return <main className="auth-page"><Link className="wordmark auth-logo" href="/">岁照</Link><section className="auth-card"><p className="eyebrow">从今年开始</p><h1>创建你的岁照</h1><p className="muted">一年一张，慢慢记录时间的模样。</p><AuthForm mode="register" /><p className="auth-switch">已经有账号？<Link href="/login">去登录</Link></p></section></main>;
}
