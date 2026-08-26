import type { Metadata } from "next";
import { getRequestLocale } from "./locale";

type LocalizedMetadata = {
  zh: { title: string; description: string };
  en: { title: string; description: string };
  path: string;
};

export async function getLocalizedMetadata({ zh, en, path }: LocalizedMetadata): Promise<Metadata> {
  const english = await getRequestLocale() === "en";
  const { title, description } = english ? en : zh;
  const locale = english ? "en_US" : "zh_CN";

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: english ? "Seeva" : "照见",
      title,
      description,
      locale,
      alternateLocale: english ? ["zh_CN"] : ["en_US"],
      images: [{
        url: "/images/seeva-og.png",
        alt: english ? "A family growth album on Seeva" : "照见家庭成长相册",
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/seeva-og.png"],
    },
  };
}
