import Image from "next/image";
import Link from "next/link";

export function Logo({ className, href }: { className?: string; href: string }) {
  return (
    <Link className={className} href={href} aria-label="照见首页">
      <Image
        className="brand-logo-image"
        src="/images/logo.png"
        alt="照见"
        width={160}
        height={64}
        priority
      />
    </Link>
  );
}
