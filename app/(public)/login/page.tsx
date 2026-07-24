import Link from "next/link";
export default function LoginPage(){return <main className="container"><div className="card" style={{maxWidth:420,margin:"60px auto",padding:32}}><h1>登录</h1><form><input name="email" placeholder="邮箱"/><input name="password" type="password" placeholder="密码"/><button className="btn">登录</button></form><p><Link href="/register">注册账号</Link></p></div></main>}
