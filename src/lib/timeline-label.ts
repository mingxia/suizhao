import type { YearPhotoStage } from "@/db/schema/app";

export function stageLabel(type: "person" | "family", stage: YearPhotoStage, age: number | null, locale: "zh" | "en") {
  if (type === "family") {
    if (stage === "first_seen") return locale === "en" ? "Wedding photo" : "结婚照";
    return locale === "en" ? `Year ${age}` : `第${age}年`;
  }
  if (stage === "first_seen") return locale === "en" ? "First photo" : "初见";
  return locale === "en" ? `Age ${age}` : `${age}岁`;
}
