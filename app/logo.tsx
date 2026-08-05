"use client";

import Link from "next/link";
import { useLanguage } from "./language-provider";

export function Logo({ className, href }: { className?: string; href: string }) {
  const locale = useLanguage()?.locale ?? "zh";
  const isEnglish = locale === "en";

  return (
    <Link className={className} href={href} aria-label={isEnglish ? "Seeva home" : "照见首页"}>
      {/* The logo is a public static asset. Keep its URL direct instead of routing
          it through Next's image optimizer, which is unavailable on this deployment. */}
      <img
        className="brand-logo-image"
        src={isEnglish ? "/images/enlogo.svg" : "/images/cnlogo.svg"}
        alt={isEnglish ? "seeva" : "照见"}
        width={160}
        height={64}
      />
    </Link>
  );
}
