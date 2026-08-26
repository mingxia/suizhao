import { describe, expect, it } from "vitest";
import { translateToEnglish } from "../src/lib/english-translations";

describe("English translation", () => {
  it("does not translate a shorter age inside a multi-digit age", () => {
    expect(translateToEnglish("1岁 / 1986")).toBe("Age 1 / 1986");
    expect(translateToEnglish("11岁 / 1996")).toBe("Age 11 / 1996");
    expect(translateToEnglish("21岁 / 2006")).toBe("Age 21 / 2006");
  });
});
