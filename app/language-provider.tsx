"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { englishTranslations } from "@/lib/english-translations";

type Locale = "zh" | "en";
const LanguageContext = createContext<{ locale: Locale; switchLocale: (next: Locale) => void } | null>(null);
const entries = Object.entries(englishTranslations).sort(([a], [b]) => b.length - a.length);

function translate(value: string) {
  let translated = value;
  for (const [source, target] of entries) translated = translated.replaceAll(source, target);
  return translated;
}

function translateDocument() {
  const root = document.body;
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.parentElement?.closest("[data-no-translate]")) continue;
    const value = node.nodeValue ?? "";
    const translated = translate(value);
    if (translated !== value) node.nodeValue = translated;
  }
  root.querySelectorAll<HTMLElement>("[aria-label], [placeholder], [title], [alt]").forEach((element) => {
    for (const attribute of ["aria-label", "placeholder", "title", "alt"]) {
      const value = element.getAttribute(attribute);
      if (value) element.setAttribute(attribute, translate(value));
    }
  });
}

export function LanguageProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const [locale, setLocale] = useState(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en" : "zh-CN";
    document.documentElement.dataset.locale = locale;
    if (locale !== "en") return;
    translateDocument();
    const observer = new MutationObserver(() => translateDocument());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [locale]);

  function switchLocale(next: Locale) {
    document.cookie = `seeva-locale=${next}; path=/; max-age=31536000; samesite=lax`;
    setLocale(next);
    // Metadata is rendered on the server from the locale cookie. Reload so the
    // document head and visible content always switch languages together.
    window.location.reload();
  }

  return <LanguageContext.Provider value={{ locale, switchLocale }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/** Use this for sentences containing values that split the Chinese copy across DOM nodes. */
export function LocalizedText({ zh, en }: { zh: React.ReactNode; en: React.ReactNode }) {
  const context = useLanguage();
  return <>{context?.locale === "en" ? en : zh}</>;
}

export function LanguageSwitcher() {
  const context = useLanguage();
  if (!context) return null;
  const { locale, switchLocale } = context;

  const nextLocale = locale === "zh" ? "en" : "zh";
  const label = locale === "zh" ? "EN" : "中文";

  return (
    <div className="language-switcher" data-no-translate aria-label="语言 / Language">
      <button onClick={() => switchLocale(nextLocale)} type="button">{label}</button>
    </div>
  );
}
