import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "岁照", description: "每岁一张，照见成长。", robots: { index: false, follow: false } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="zh-CN"><body>{children}</body></html>; }
