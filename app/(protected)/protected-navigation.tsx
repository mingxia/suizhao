"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { PersonModal } from "./person-modal";

export function ProtectedNavigation({ isAdmin = false }: { isAdmin?: boolean }) {
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
      首页
      </Link>
      <Link className={pathname === "/my" ? "nav-link nav-link-active" : "nav-link"} href="/my">
        我的照见
      </Link>
      {isAdmin ? <Link className={pathname === "/admin" ? "nav-link nav-link-active" : "nav-link"} href="/admin">
        系统大屏
      </Link> : null}
      <PersonModal mode="create" className="btn header-create-button">创建照见</PersonModal>
      <button className="sign-out-button" type="button" onClick={signOut} disabled={isSigningOut}>
        {isSigningOut ? "正在退出…" : "退出登录"}
      </button>
    </nav>
  );
}
