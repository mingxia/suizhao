"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { PersonModal } from "./person-modal";

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
        我的照见
      </Link>
      <Link className="nav-link" href="/membership">会员</Link>
      <PersonModal mode="create" className="btn header-create-button">创建人物</PersonModal>
      <button className="sign-out-button" type="button" onClick={signOut} disabled={isSigningOut}>
        {isSigningOut ? "正在退出…" : "退出登录"}
      </button>
    </nav>
  );
}
