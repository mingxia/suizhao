import Link from "next/link";

export function Logo({ className, href }: { className?: string; href: string }) {
  return (
    <Link className={className} href={href} aria-label="照见首页">
      {/* The logo is a public static asset. Keep its URL direct instead of routing
          it through Next's image optimizer, which is unavailable on this deployment. */}
      <img
        className="brand-logo-image"
        src="/images/cnlogo.svg"
        alt="照见"
        width={160}
        height={64}
      />
      <span className="english-brand-name">seeva</span>
    </Link>
  );
}
