import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteFooter } from "./site-footer";
import { cookies } from "next/headers";
import { LanguageProvider } from "./language-provider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const sharedMetadata: Metadata = {
  icons: {
    icon: [{ url: "/images/icon.png", type: "image/png" }],
    shortcut: [{ url: "/images/icon.png", type: "image/png" }],
    apple: [{ url: "/images/icon.png", type: "image/png" }],
  },
  robots: { index: false, follow: false },
};

export async function generateMetadata(): Promise<Metadata> {
  const english = (await cookies()).get("seeva-locale")?.value === "en";
  return {
    ...sharedMetadata,
    title: english ? "Seeva | One life recorded, witnessed by family" : "照见｜一个人记录，一家人见证",
    description: english ? "One photo each year. See growth come to light." : "每岁一张，照见成长。",
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = (await cookies()).get("seeva-locale")?.value === "en" ? "en" : "zh";
  return <html lang={locale === "en" ? "en" : "zh-CN"} data-locale={locale}><body><LanguageProvider initialLocale={locale}><div className="site-content">{children}</div><SiteFooter /></LanguageProvider></body></html>;
}
