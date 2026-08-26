import { cookies, headers } from "next/headers";

export type Locale = "zh" | "en";

export function resolveLocale(savedLocale: string | undefined, acceptLanguage: string | null): Locale {
  if (savedLocale === "zh" || savedLocale === "en") return savedLocale;

  const preferredLanguage = acceptLanguage?.split(",", 1)[0]?.trim().toLowerCase();
  if (!preferredLanguage) return "zh";
  return preferredLanguage === "zh" || preferredLanguage.startsWith("zh-") ? "zh" : "en";
}

export async function getRequestLocale(): Promise<Locale> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  return resolveLocale(cookieStore.get("seeva-locale")?.value, headerStore.get("accept-language"));
}
