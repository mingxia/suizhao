import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "照见",
  description: "每岁一张，照见成长。",
  icons: { icon: "/images/icon.png", apple: "/images/icon.png" },
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="zh-CN"><body>{children}</body></html>; }
