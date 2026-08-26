import { describe, expect, it } from "vitest";
import { resolveLocale } from "../src/lib/locale";

describe("locale selection", () => {
  it("honors a previously saved language", () => {
    expect(resolveLocale("zh", "en-US,en;q=0.9")).toBe("zh");
    expect(resolveLocale("en", "zh-CN,zh;q=0.9")).toBe("en");
  });

  it("uses Chinese for a Chinese browser", () => {
    expect(resolveLocale(undefined, "zh-CN,zh;q=0.9,en;q=0.8")).toBe("zh");
    expect(resolveLocale(undefined, "zh-TW,zh;q=0.9")).toBe("zh");
  });

  it("uses English for non-Chinese browsers", () => {
    expect(resolveLocale(undefined, "en-US,en;q=0.9")).toBe("en");
    expect(resolveLocale(undefined, "fr-FR,fr;q=0.9,en;q=0.8")).toBe("en");
  });

  it("keeps Chinese as the fallback when no language is available", () => {
    expect(resolveLocale(undefined, null)).toBe("zh");
  });
});
