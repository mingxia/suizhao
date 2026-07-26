"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function ProtectedNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="site-navigation" aria-label="用户导航">
      <Link className={pathname === "/dashboard" || pathname.startsWith("/persons/") && pathname !== "/persons/new" ? "nav-link nav-link-active" : "nav-link"} href="/dashboard">
        我的岁照
      </Link>
      <Link className="btn header-create-button" href="/persons/new">创建人物</Link>
      <button className="sign-out-button" type="button" onClick={signOut} disabled={isSigningOut}>
        {isSigningOut ? "正在退出…" : "退出登录"}
      </button>
    </nav>
  );
}
