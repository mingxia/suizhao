import { describe, expect, it } from "vitest";
import { stageLabel } from "../src/lib/timeline-label";

describe("dynamic timeline labels", () => {
  it("formats any family year without a translation entry per number", () => {
    expect(stageLabel("family", "age", 1, "en")).toBe("Year 1");
    expect(stageLabel("family", "age", 37, "en")).toBe("Year 37");
    expect(stageLabel("family", "age", 37, "zh")).toBe("第37年");
  });

  it("formats personal ages and first milestones in both languages", () => {
    expect(stageLabel("person", "age", 26, "en")).toBe("Age 26");
    expect(stageLabel("person", "age", 26, "zh")).toBe("26岁");
    expect(stageLabel("family", "first_seen", null, "en")).toBe("Wedding photo");
    expect(stageLabel("person", "first_seen", null, "en")).toBe("First photo");
  });
});
