import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "照见",
  description: "每岁一张，照见成长。",
  icons: {
    icon: [{ url: "/images/icon.png", type: "image/png" }],
    shortcut: [{ url: "/images/icon.png", type: "image/png" }],
    apple: [{ url: "/images/icon.png", type: "image/png" }],
  },
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="zh-CN"><body>{children}</body></html>; }
